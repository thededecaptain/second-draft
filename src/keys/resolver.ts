import type { Config } from "../config.js";
import type { EnvelopeCryptoProvider } from "../crypto/envelope.js";
import { prisma } from "../db/client.js";

export interface ResolvedLlmKey {
  apiKey: string;
}

/**
 * Single chokepoint for LLM API key selection. No other module should read keys from env or DB.
 */
export class LlmKeyResolver {
  constructor(
    private readonly config: Config,
    private readonly _envelope: EnvelopeCryptoProvider
  ) {}

  async resolveForWorkspace(workspaceId: string): Promise<ResolvedLlmKey> {
    const workspace = await prisma.workspace.findUniqueOrThrow({
      where: { id: workspaceId },
      include: { customerKey: true },
    });

    switch (workspace.tier) {
      case "SMB":
        return { apiKey: this.config.ANTHROPIC_API_KEY };
      case "ENTERPRISE":
        // Phase 2: decrypt via this._envelope using workspace.customerKey
        void this._envelope;
        throw new Error("Enterprise tier key resolution is not yet implemented");
      default: {
        const _exhaustive: never = workspace.tier;
        throw new Error(`Unknown tier: ${_exhaustive}`);
      }
    }
  }

  // Phase 2: load CustomerKey, decrypt via envelope provider in memory per request.
}
