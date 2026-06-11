/**
 * Pluggable envelope encryption for enterprise customer API keys (phase 2).
 * KMS provider in production; local master key for development.
 */

export interface EnvelopeCryptoProvider {
  encrypt(plaintext: string): Promise<{ ciphertext: string; keyVersion: number }>;
  decrypt(ciphertext: string, keyVersion: number): Promise<string>;
}

export class NotConfiguredEnvelopeProvider implements EnvelopeCryptoProvider {
  async encrypt(): Promise<{ ciphertext: string; keyVersion: number }> {
    throw new Error("Envelope encryption is not configured");
  }

  async decrypt(): Promise<string> {
    throw new Error("Envelope encryption is not configured");
  }
}
