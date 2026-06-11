import type { BlockAction, BlockElementAction } from "@slack/bolt";
import { BUTTONS_BLOCK_ID_PREFIX, OPTIONS_BLOCK_ID_PREFIX } from "./blocks.js";
import { RELATIONSHIPS, TONES, type Relationship, type Tone } from "../prompts/types.js";

function isTone(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value);
}

function isRelationship(value: string): value is Relationship {
  return (RELATIONSHIPS as readonly string[]).includes(value);
}

export function sessionIdFromBlockId(blockId: string): string | null {
  for (const prefix of [
    `${OPTIONS_BLOCK_ID_PREFIX}:`,
    `${BUTTONS_BLOCK_ID_PREFIX}:`,
  ]) {
    if (blockId.startsWith(prefix)) {
      const id = blockId.slice(prefix.length);
      return id.length > 0 ? id : null;
    }
  }
  return null;
}

export function readSelectionsFromAction(
  body: BlockAction<BlockElementAction>,
  fallback?: { tone: Tone; relationship: Relationship }
): { tone: Tone; relationship: Relationship } | null {
  let toneVal: string | undefined;
  let relVal: string | undefined;

  const stateValues = body.state?.values ?? {};
  for (const blockValues of Object.values(stateValues)) {
    const toneState = blockValues.seconddraft_tone;
    const relState = blockValues.seconddraft_relationship;
    if (toneState?.type === "static_select") {
      toneVal = toneState.selected_option?.value;
    }
    if (relState?.type === "static_select") {
      relVal = relState.selected_option?.value;
    }
  }

  const tone =
    toneVal && isTone(toneVal) ? toneVal : fallback?.tone;
  const relationship =
    relVal && isRelationship(relVal) ? relVal : fallback?.relationship;

  if (!tone || !relationship) return null;

  return { tone, relationship };
}

export function sessionIdFromAction(action: {
  value?: string;
  block_id?: string;
}): string | null {
  if (typeof action.value === "string" && action.value) {
    return action.value;
  }
  if (typeof action.block_id === "string") {
    return sessionIdFromBlockId(action.block_id);
  }
  return null;
}
