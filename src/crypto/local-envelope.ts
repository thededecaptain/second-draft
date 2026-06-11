import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import type { EnvelopeCryptoProvider } from "./envelope.js";

const ALGORITHM = "aes-256-gcm";
const IV_BYTES = 12;
const KEY_VERSION = 1;

function parseMasterKey(hex: string): Buffer {
  const key = Buffer.from(hex, "hex");
  if (key.length !== 32) {
    throw new Error("LOCAL_ENVELOPE_MASTER_KEY must be 32 bytes (64 hex characters)");
  }
  return key;
}

/** AES-256-GCM envelope encryption for secrets at rest (user tokens, BYOK keys). */
export class LocalEnvelopeProvider implements EnvelopeCryptoProvider {
  constructor(private readonly masterKeyHex: string) {}

  async encrypt(plaintext: string): Promise<{ ciphertext: string; keyVersion: number }> {
    const key = parseMasterKey(this.masterKeyHex);
    const iv = randomBytes(IV_BYTES);
    const cipher = createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([
      cipher.update(plaintext, "utf8"),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag();
    const packed = [
      KEY_VERSION.toString(),
      iv.toString("base64url"),
      authTag.toString("base64url"),
      encrypted.toString("base64url"),
    ].join(":");
    return { ciphertext: packed, keyVersion: KEY_VERSION };
  }

  async decrypt(ciphertext: string, keyVersion: number): Promise<string> {
    if (keyVersion !== KEY_VERSION) {
      throw new Error(`Unsupported key version: ${keyVersion}`);
    }
    const key = parseMasterKey(this.masterKeyHex);
    const parts = ciphertext.split(":");
    if (parts.length !== 4) {
      throw new Error("Invalid ciphertext format");
    }
    const [, ivB64, tagB64, dataB64] = parts;
    const iv = Buffer.from(ivB64!, "base64url");
    const authTag = Buffer.from(tagB64!, "base64url");
    const data = Buffer.from(dataB64!, "base64url");
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  }
}

export function createEnvelopeProvider(
  masterKeyHex: string | undefined
): EnvelopeCryptoProvider {
  if (!masterKeyHex?.length) {
    return new NotConfiguredLocalEnvelopeProvider();
  }
  return new LocalEnvelopeProvider(masterKeyHex);
}

class NotConfiguredLocalEnvelopeProvider implements EnvelopeCryptoProvider {
  async encrypt(): Promise<{ ciphertext: string; keyVersion: number }> {
    throw new Error(
      "LOCAL_ENVELOPE_MASTER_KEY is required to store user OAuth tokens"
    );
  }

  async decrypt(): Promise<string> {
    throw new Error(
      "LOCAL_ENVELOPE_MASTER_KEY is required to use stored user OAuth tokens"
    );
  }
}
