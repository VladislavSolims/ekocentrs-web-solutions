/**
 * The token format shared by the Joomla bridge and our own session cookie:
 *
 *     base64url(JSON) + "." + hex(HMAC-SHA256(base64url, secret))
 *
 * Chosen because PHP produces it in three lines (`base64_encode`, `strtr`,
 * `hash_hmac`) — no JWT library needed on the Joomla 3 side.
 *
 * This module only proves that a body carries the secret's signature. Deciding
 * whether the payload inside means anything is the caller's job.
 *
 * Uses Web Crypto rather than node:crypto so the same code runs in proxy.ts.
 */

export type OpenedToken =
  | { ok: true; json: string }
  | { ok: false; reason: "malformed" | "bad-signature" | "bad-payload" };

const encoder = new TextEncoder();

async function signHex(body: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(body));

  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time comparison, so a wrong signature reveals nothing by how fast it fails. */
function signaturesMatch(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let difference = 0;
  for (let i = 0; i < a.length; i += 1) {
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return difference === 0;
}

function toBase64Url(text: string): string {
  const bytes = encoder.encode(text);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): string | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(base64 + padding);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

export async function sealToken(payload: unknown, secret: string): Promise<string> {
  const body = toBase64Url(JSON.stringify(payload));

  return `${body}.${await signHex(body, secret)}`;
}

export async function openToken(token: string, secret: string): Promise<OpenedToken> {
  const parts = token.split(".");
  if (parts.length !== 2) return { ok: false, reason: "malformed" };

  const [body, signature] = parts;
  if (body === "" || signature === "") return { ok: false, reason: "malformed" };

  if (!signaturesMatch(signature, await signHex(body, secret))) {
    return { ok: false, reason: "bad-signature" };
  }

  const json = fromBase64Url(body);
  if (json === null) return { ok: false, reason: "bad-payload" };

  return { ok: true, json };
}
