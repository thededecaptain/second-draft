import type { Relationship, RewriteContext, Tone } from "./types.js";

const TONE_GUIDANCE: Record<Tone, string> = {
  friendly:
    "Use a warm, approachable voice. Prefer contractions where natural. Be concise but not curt.",
  direct:
    "Be clear and efficient. Lead with the point. Avoid filler and unnecessary qualifiers.",
  formal:
    "Use professional, polished language. Avoid slang and overly casual phrasing.",
};

const RELATIONSHIP_GUIDANCE: Record<Relationship, string> = {
  teammate:
    "The recipient is a peer on your team. Assume shared context; collaborative and respectful.",
  manager:
    "The recipient is your manager. Be respectful, proactive, and appropriately deferential without being obsequious.",
  customer:
    "The recipient is an external customer. Prioritize clarity, professionalism, and helpfulness.",
};

const SYSTEM_PREAMBLE = `You rewrite Slack draft messages for the sender.
Output ONLY the rewritten message text—no quotes, labels, or explanation.
Write in the same language as the draft. Do not translate unless the draft explicitly asks for another language.
Preserve intent, facts, and calls-to-action. Do not invent details not present in the draft.`;

function buildUserInstruction(ctx: RewriteContext): string {
  const toneLine = TONE_GUIDANCE[ctx.tone];
  const relationshipLine = RELATIONSHIP_GUIDANCE[ctx.relationship];

  return [
    "Rewrite the draft below.",
    "",
    `Tone: ${ctx.tone}. ${toneLine}`,
    `Relationship: ${ctx.relationship}. ${relationshipLine}`,
    "",
    "Draft:",
    ctx.draft,
  ].join("\n");
}

export interface RewritePrompt {
  system: string;
  user: string;
}

/** Composable prompt builder: tone × relationship via shared guidance maps. */
export function buildRewritePrompt(ctx: RewriteContext): RewritePrompt {
  return {
    system: SYSTEM_PREAMBLE,
    user: buildUserInstruction(ctx),
  };
}
