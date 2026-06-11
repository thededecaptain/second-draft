import type { ActionsBlockElement, KnownBlock } from "@slack/types";
import { RELATIONSHIPS, TONES, type Relationship, type Tone } from "../prompts/types.js";

export const OPTIONS_BLOCK_ID_PREFIX = "seconddraft_options";
export const BUTTONS_BLOCK_ID_PREFIX = "seconddraft_buttons";

export function optionsBlockId(sessionId: string): string {
  return `${OPTIONS_BLOCK_ID_PREFIX}:${sessionId}`;
}

export function buttonsBlockId(sessionId: string): string {
  return `${BUTTONS_BLOCK_ID_PREFIX}:${sessionId}`;
}

const TONE_OPTIONS = TONES.map((t) => ({
  text: { type: "plain_text" as const, text: capitalize(t) },
  value: t,
}));

const RELATIONSHIP_OPTIONS = RELATIONSHIPS.map((r) => ({
  text: { type: "plain_text" as const, text: capitalize(r) },
  value: r,
}));

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function optionForTone(tone: Tone) {
  return TONE_OPTIONS.find((o) => o.value === tone) ?? TONE_OPTIONS[0];
}

function optionForRelationship(relationship: Relationship) {
  return (
    RELATIONSHIP_OPTIONS.find((o) => o.value === relationship) ??
    RELATIONSHIP_OPTIONS[0]
  );
}

function escapeCodeBlock(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function buildSelectElements(
  tone: Tone,
  relationship: Relationship
): ActionsBlockElement[] {
  return [
    {
      type: "static_select",
      action_id: "seconddraft_tone",
      placeholder: { type: "plain_text", text: "Tone" },
      initial_option: optionForTone(tone),
      options: TONE_OPTIONS,
    },
    {
      type: "static_select",
      action_id: "seconddraft_relationship",
      placeholder: { type: "plain_text", text: "Relationship" },
      initial_option: optionForRelationship(relationship),
      options: RELATIONSHIP_OPTIONS,
    },
  ];
}

function buildSelectModeButtons(sessionId: string): ActionsBlockElement[] {
  return [
    {
      type: "button",
      action_id: "seconddraft_rewrite",
      text: { type: "plain_text", text: "Rewrite" },
      style: "primary",
      value: sessionId,
    },
  ];
}

function buildResultModeButtons(
  sessionId: string,
  connected: boolean,
  oneClickSendAvailable: boolean
): ActionsBlockElement[] {
  if (connected) {
    return [
      {
        type: "button",
        action_id: "seconddraft_send_as_me",
        text: { type: "plain_text", text: "Send as me" },
        style: "primary",
        value: sessionId,
      },
      {
        type: "button",
        action_id: "seconddraft_edit_send",
        text: { type: "plain_text", text: "Edit & send" },
        value: sessionId,
      },
      {
        type: "button",
        action_id: "seconddraft_regenerate",
        text: { type: "plain_text", text: "Regenerate" },
        value: sessionId,
      },
      {
        type: "button",
        action_id: "seconddraft_dismiss",
        text: { type: "plain_text", text: "Dismiss" },
        value: sessionId,
      },
    ];
  }

  const buttons: ActionsBlockElement[] = [
    {
      type: "button",
      action_id: "seconddraft_regenerate",
      text: { type: "plain_text", text: "Regenerate" },
      value: sessionId,
    },
  ];

  if (oneClickSendAvailable) {
    buttons.push({
      type: "button",
      action_id: "seconddraft_enable_send",
      text: { type: "plain_text", text: "⚡ Enable one-click send" },
      value: sessionId,
    });
  }

  buttons.push({
    type: "button",
    action_id: "seconddraft_dismiss",
    text: { type: "plain_text", text: "Dismiss" },
    value: sessionId,
  });

  return buttons;
}

function truncateDraft(draft: string, max = 500): string {
  if (draft.length <= max) return draft;
  return `${draft.slice(0, max)}…`;
}

export function buildSelectionMessage(
  sessionId: string,
  draft: string,
  tone: Tone,
  relationship: Relationship
): { text: string; blocks: KnownBlock[] } {
  return {
    text: "Choose tone and relationship, then Rewrite.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Your draft*\n\`\`\`${truncateDraft(draft)}\`\`\``,
        },
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "_Only visible to you._ Pick tone and who you're writing to.",
          },
        ],
      },
      {
        type: "actions",
        block_id: optionsBlockId(sessionId),
        elements: buildSelectElements(tone, relationship),
      },
      {
        type: "actions",
        block_id: buttonsBlockId(sessionId),
        elements: buildSelectModeButtons(sessionId),
      },
    ],
  };
}

export interface ResultMessageOptions {
  connected: boolean;
  /** False when PUBLIC_BASE_URL or encryption key is not configured. */
  oneClickSendAvailable: boolean;
}

export function buildResultMessage(
  sessionId: string,
  rewritten: string,
  tone: Tone,
  relationship: Relationship,
  options: ResultMessageOptions
): { text: string; blocks: KnownBlock[] } {
  const escaped = escapeCodeBlock(rewritten);
  const label = `${capitalize(tone)} · ${capitalize(relationship)}`;

  const hint = options.connected
    ? "_Sends to this channel as you when you click send._"
    : "_Click the text above, double-click to select all, copy, then paste into the message box below. Only you can see this._";

  return {
    text: "Here's your rewrite.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Your rewrite* — ${label}\n\`\`\`${escaped}\`\`\``,
        },
      },
      {
        type: "context",
        elements: [{ type: "mrkdwn", text: hint }],
      },
      {
        type: "actions",
        block_id: optionsBlockId(sessionId),
        elements: buildSelectElements(tone, relationship),
      },
      {
        type: "actions",
        block_id: buttonsBlockId(sessionId),
        elements: buildResultModeButtons(
          sessionId,
          options.connected,
          options.oneClickSendAvailable
        ),
      },
    ],
  };
}

export function buildLoadingMessage(): { text: string; blocks: KnownBlock[] } {
  return {
    text: "Rewriting your message…",
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: "_Rewriting your message…_" },
      },
    ],
  };
}
