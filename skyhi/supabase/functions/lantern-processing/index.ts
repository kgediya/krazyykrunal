import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_ALLOW_HEADERS = "authorization, x-client-info, apikey, content-type, x-snap-client-id";
const CORS_ALLOW_METHODS = "POST, OPTIONS";

function isAllowedOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    if (u.protocol === "https:" && (u.hostname === "krazyykrunal.com" || u.hostname === "www.krazyykrunal.com")) return true;
    if (u.hostname === "localhost") return true;
    if (u.hostname === "127.0.0.1") return true;
    return false;
  } catch {
    return false;
  }
}

function corsHeaders(origin: string | null) {
  const allowOrigin = origin && isAllowedOrigin(origin) ? origin : "https://krazyykrunal.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": CORS_ALLOW_HEADERS,
    "Access-Control-Allow-Methods": CORS_ALLOW_METHODS,
    "Vary": "Origin",
  };
}

type Json = Record<string, unknown>;

function json(status: number, body: Json, origin: string | null = null) {
  const headers = corsHeaders(origin);
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      "Content-Type": "application/json",
    },
  });
}

function normalizePin(value: unknown): string {
  const s = String(value ?? "").trim();
  return /^\d{3,6}$/.test(s) ? s : "";
}

function getBearerToken(authHeader: string | null): string {
  if (!authHeader) return "";
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : "";
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    if (!origin || !isAllowedOrigin(origin)) {
      return new Response("forbidden origin", { status: 403 });
    }
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" }, origin);
  }

  if (!origin || !isAllowedOrigin(origin)) {
    return json(403, { error: "Origin not allowed" }, origin);
  }

  const bearerToken = getBearerToken(req.headers.get("authorization"));
  if (!bearerToken) {
    return json(401, { error: "Authentication required" }, origin);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRole = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRole) {
    return json(500, { error: "Server misconfigured: missing Supabase env" }, origin);
  }

  let payload: Json;
  try {
    payload = (await req.json()) as Json;
  } catch {
    return json(400, { error: "Invalid JSON body" }, origin);
  }

  const action = String(payload.action ?? "");
  const roomPin = normalizePin(payload.roomPin);

  if (!roomPin) return json(400, { error: "Invalid roomPin" }, origin);

  const admin = createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false },
  });

  if (action === "fetch") {
    const limitRaw = Number(payload.limit ?? 20);
    const limit = Math.max(1, Math.min(40, Number.isFinite(limitRaw) ? limitRaw : 20));

    const { data, error } = await admin
      .from("lanterns")
      .select("id, room_id, message_text, sender_name, shape_type, created_at")
      .eq("room_id", roomPin)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return json(500, { error: "Fetch failed", detail: error.message }, origin);
    }

    return json(200, { items: data ?? [] }, origin);
  }

  if (action === "send") {
    const messageText = String(payload.messageText ?? "").trim();
    const senderName = String(payload.senderName ?? "Anonymous").trim() || "Anonymous";
    const shapeTypeRaw = Number(payload.shapeType ?? 0);
    const shapeType = shapeTypeRaw === 1 ? 1 : 0;

    if (!messageText) return json(400, { error: "Empty message" }, origin);
    if (messageText.length > 500) return json(400, { error: "Message too long" }, origin);

    const { error } = await admin
      .from("lanterns")
      .insert([
        {
          room_id: roomPin,
          message_text: messageText,
          sender_name: senderName.slice(0, 50),
          shape_type: shapeType,
        },
      ]);

    if (error) {
      return json(500, { error: "Send failed", detail: error.message }, origin);
    }

    return json(200, { ok: true }, origin);
  }

  return json(400, { error: "Unsupported action" }, origin);
});
