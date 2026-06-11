export const TONES = ["friendly", "direct", "formal"] as const;
export type Tone = (typeof TONES)[number];

export const RELATIONSHIPS = ["teammate", "manager", "customer"] as const;
export type Relationship = (typeof RELATIONSHIPS)[number];

export interface RewriteContext {
  draft: string;
  tone: Tone;
  relationship: Relationship;
}
