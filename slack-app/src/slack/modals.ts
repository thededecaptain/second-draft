import type { ModalView } from "@slack/types";
import type { Relationship, Tone } from "../prompts/types.js";

export const EDIT_SEND_CALLBACK = "seconddraft_edit_send";

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function buildEditSendModal(
  sessionId: string,
  rewritten: string,
  tone: Tone,
  relationship: Relationship
): ModalView {
  return {
    type: "modal",
    callback_id: EDIT_SEND_CALLBACK,
    private_metadata: sessionId,
    title: { type: "plain_text", text: "Edit & send" },
    submit: { type: "plain_text", text: "Send as me" },
    close: { type: "plain_text", text: "Cancel" },
    blocks: [
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `${capitalize(tone)} · ${capitalize(relationship)} · Sends to this channel when you click send.`,
          },
        ],
      },
      {
        type: "input",
        block_id: "rewrite_block",
        label: { type: "plain_text", text: "Your rewrite" },
        element: {
          type: "plain_text_input",
          action_id: "rewrite_input",
          multiline: true,
          initial_value: rewritten,
        },
      },
    ],
  };
}

export function buildConnectInterstitialModal(authorizeUrl: string): ModalView {
  return {
    type: "modal",
    callback_id: "seconddraft_connect_interstitial",
    title: { type: "plain_text", text: "One-click send" },
    close: { type: "plain_text", text: "Not now" },
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "*Send rewrites as yourself — one click, no copy/paste.*\n\n" +
            "You'll approve this once on Slack's standard permission screen. " +
            "SecondDraft can only *post* messages when you click send — it can never read your messages, and your drafts are never stored.\n\n" +
            `<${authorizeUrl}|Connect with Slack>`,
        },
      },
    ],
  };
}

/** Extract rewritten text from edit modal submission. */
export function rewrittenFromViewSubmission(
  values: Record<string, Record<string, { value?: string | null }>>
): string | null {
  const raw = values.rewrite_block?.rewrite_input?.value;
  const text = typeof raw === "string" ? raw.trim() : "";
  return text.length ? text : null;
}
