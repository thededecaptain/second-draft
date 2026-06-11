import Anthropic from "@anthropic-ai/sdk";
import type { Config } from "../config.js";
import { buildRewritePrompt } from "../prompts/templates.js";
import type { RewriteContext } from "../prompts/types.js";

export interface RewriteResult {
  rewritten: string;
  inputTokens: number;
  outputTokens: number;
  model: string;
}

export async function rewriteDraft(
  apiKey: string,
  config: Config,
  ctx: RewriteContext
): Promise<RewriteResult> {
  const client = new Anthropic({ apiKey });
  const prompt = buildRewritePrompt(ctx);
  const model = config.ANTHROPIC_MODEL;

  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: prompt.system,
    messages: [{ role: "user", content: prompt.user }],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("LLM response contained no text");
  }

  const inputTokens = response.usage.input_tokens;
  const outputTokens = response.usage.output_tokens;

  return {
    rewritten: textBlock.text.trim(),
    inputTokens,
    outputTokens,
    model,
  };
}
