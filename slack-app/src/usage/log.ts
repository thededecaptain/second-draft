import { prisma } from "../db/client.js";
import type { RewriteResult } from "../llm/rewrite.js";

export async function logUsageEvent(
  workspaceId: string,
  result: Pick<RewriteResult, "inputTokens" | "outputTokens" | "model">
): Promise<void> {
  await prisma.usageEvent.create({
    data: {
      workspaceId,
      rewriteCount: 1,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      model: result.model,
    },
  });
}
