import { createSkyHiSessionToken } from "../_shared/skyhi-session.ts";

const SNAP_CONFIDENTIAL_CLIENT_ID = Deno.env.get("SNAP_CONFIDENTIAL_CLIENT_ID") || "ffddb9d7-7bf7-46dc-a651-c77999e09279";
const SNAP_CLIENT_SECRET = Deno.env.get("SNAP_CLIENT_SECRET") || "";
const SNAP_TOKEN_ENDPOINT = "https://accounts.snapchat.com/accounts/oauth2/token";
const SNAP_ME_ENDPOINT = "https://kit.snapchat.com/v1/me";
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const CORS_ALLOW_HEADERS = "content-type, authorization, apikey, x-client-info";
const CORS_ALLOW_METHODS = "POST, OPTIONS";

function isAllowedOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return (
      url.protocol === "https:" &&
      (url.hostname === "krazyykrunal.com" || url.hostname === "www.krazyykrunal.com")
    );
  } catch {
    return false;
  }
}

function isAllowedRedirectUri(input: string): boolean {
  try {
    const url = new URL(input);
    return (
      isAllowedOrigin(url.origin) &&
      (url.pathname === "/skyhi/" || url.pathname === "/skyhi/index.html")
    );
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

function json(status: number, body: Record<string, unknown>, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json",
    },
  });
}

function normalizeProfile(payload: unknown) {
  const me = payload && typeof payload === "object" && "data" in payload
    ? (payload as { data?: { me?: { displayName?: unknown; bitmoji?: { avatar?: unknown } } } }).data?.me
    : null;

  return {
    displayName: typeof me?.displayName === "string" ? me.displayName.trim() : "",
    avatarUrl: typeof me?.bitmoji?.avatar === "string" ? me.bitmoji.avatar : "",
  };
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

  if (!SNAP_CLIENT_SECRET) {
    return json(500, { error: "Missing SNAP_CLIENT_SECRET" }, origin);
  }

  let payload: Record<string, unknown>;
  try {
    payload = await req.json() as Record<string, unknown>;
  } catch {
    return json(400, { error: "Invalid JSON body" }, origin);
  }

  const action = String(payload.action ?? "").trim();
  if (action === "logout") {
    return json(200, { ok: true }, origin);
  }

  if (action !== "exchange") {
    return json(400, { error: "Unsupported action" }, origin);
  }

  const code = String(payload.code ?? "").trim();
  const codeVerifier = String(payload.codeVerifier ?? "").trim();
  const redirectUri = String(payload.redirectUri ?? "").trim();

  if (!code || !codeVerifier || !redirectUri) {
    return json(400, { error: "Missing code, codeVerifier, or redirectUri" }, origin);
  }

  if (!isAllowedRedirectUri(redirectUri)) {
    return json(400, { error: "Redirect URI not allowed" }, origin);
  }

  const tokenBody = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    client_id: SNAP_CONFIDENTIAL_CLIENT_ID,
    client_secret: SNAP_CLIENT_SECRET,
    code_verifier: codeVerifier,
  });

  const tokenRes = await fetch(SNAP_TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: tokenBody.toString(),
  });

  const tokenPayload = await tokenRes.json().catch(() => null) as Record<string, unknown> | null;
  if (!tokenRes.ok || !tokenPayload) {
    return json(400, {
      error: "Snap token exchange failed",
      detail: tokenPayload?.error_description || tokenPayload?.error || `HTTP ${tokenRes.status}`,
    }, origin);
  }

  const accessToken = typeof tokenPayload.access_token === "string" ? tokenPayload.access_token : "";
  if (!accessToken) {
    return json(400, { error: "Snap token exchange returned no access token" }, origin);
  }

  const profileRes = await fetch(SNAP_ME_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      query: "{me{displayName bitmoji{avatar}}}",
    }),
  });

  const profilePayload = await profileRes.json().catch(() => null);
  if (!profileRes.ok || !profilePayload) {
    return json(400, {
      error: "Snap profile fetch failed",
      detail: `HTTP ${profileRes.status}`,
    }, origin);
  }

  const profile = normalizeProfile(profilePayload);
  const now = Date.now();
  const session = {
    displayName: profile.displayName || "Snapchat account connected",
    avatarUrl: profile.avatarUrl || "",
    scopes: String(tokenPayload.scope || "").split(/\s+/).filter(Boolean),
    connectedAt: now,
    issuedAt: now,
    expiresAt: now + SESSION_TTL_MS,
  };

  const sessionToken = await createSkyHiSessionToken(session);

  return json(200, {
    sessionToken,
    expiresAt: session.expiresAt,
    connectedAt: session.connectedAt,
    scopes: session.scopes,
    profile: {
      displayName: session.displayName,
      avatarUrl: session.avatarUrl,
    },
  }, origin);
});
