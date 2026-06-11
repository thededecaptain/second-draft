import { createHmac, timingSafeEqual } from "node:crypto";

const MAX_AGE_MS = 10 * 60 * 1000;

export interface OAuthStatePayload {
  teamId: string;
  userId: string;
}

export function createOAuthState(
  teamId: string,
  userId: string,
  secret: string
): string {
  const issuedAt = Date.now();
  const payload = `${teamId}:${userId}:${issuedAt}`;
  const sig = createHmac("sha256", secret).update(payload).digest("base64url");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function verifyOAuthState(
  state: string,
  secret: string
): OAuthStatePayload | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf8");
    const lastColon = decoded.lastIndexOf(":");
    if (lastColon === -1) return null;

    const payload = decoded.slice(0, lastColon);
    const sig = decoded.slice(lastColon + 1);
    const expected = createHmac("sha256", secret)
      .update(payload)
      .digest("base64url");

    const sigBuf = Buffer.from(sig);
    const expectedBuf = Buffer.from(expected);
    if (
      sigBuf.length !== expectedBuf.length ||
      !timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return null;
    }

    const parts = payload.split(":");
    if (parts.length !== 3) return null;
    const [teamId, userId, issuedAtStr] = parts;
    const issuedAt = Number(issuedAtStr);
    if (!teamId || !userId || !Number.isFinite(issuedAt)) return null;
    if (Date.now() - issuedAt > MAX_AGE_MS) return null;

    return { teamId, userId };
  } catch {
    return null;
  }
}
