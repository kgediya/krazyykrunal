const encoder = new TextEncoder();
const decoder = new TextDecoder();

export type SkyHiSessionClaims = {
  displayName: string;
  avatarUrl: string;
  scopes: string[];
  connectedAt: number;
  issuedAt: number;
  expiresAt: number;
};

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
  return out;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function getSessionSecret(): string {
  const secret = Deno.env.get("SKYHI_SESSION_SECRET") || Deno.env.get("SNAP_CLIENT_SECRET") || "";
  if (!secret) {
    throw new Error("Missing SKYHI_SESSION_SECRET or SNAP_CLIENT_SECRET");
  }
  return secret;
}

async function signInput(input: string): Promise<string> {
  const secret = getSessionSecret();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(input));
  return toBase64Url(new Uint8Array(signature));
}

export async function createSkyHiSessionToken(claims: SkyHiSessionClaims): Promise<string> {
  const payload = toBase64Url(encoder.encode(JSON.stringify(claims)));
  const signature = await signInput(payload);
  return `${payload}.${signature}`;
}

export async function verifySkyHiSessionToken(token: string): Promise<SkyHiSessionClaims | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  const expected = await signInput(payload);
  if (!timingSafeEqual(signature, expected)) return null;

  try {
    const parsed = JSON.parse(decoder.decode(fromBase64Url(payload)));
    if (!parsed || typeof parsed !== "object") return null;

    const claims: SkyHiSessionClaims = {
      displayName: typeof parsed.displayName === "string" ? parsed.displayName.trim() : "",
      avatarUrl: typeof parsed.avatarUrl === "string" ? parsed.avatarUrl.trim() : "",
      scopes: Array.isArray(parsed.scopes) ? parsed.scopes.filter((scope) => typeof scope === "string") : [],
      connectedAt: Number(parsed.connectedAt || 0),
      issuedAt: Number(parsed.issuedAt || 0),
      expiresAt: Number(parsed.expiresAt || 0),
    };

    if (!claims.expiresAt || claims.expiresAt <= Date.now()) return null;
    return claims;
  } catch {
    return null;
  }
}
