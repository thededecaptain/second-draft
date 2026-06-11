import type { KnownBlock } from "@slack/types";

export type SlackResponseType = "ephemeral" | "in_channel";

interface ResponseUrlPayload {
  text?: string;
  blocks?: KnownBlock[];
  responseType?: SlackResponseType;
  replaceOriginal?: boolean;
  /** Removes the ephemeral message that triggered this interaction. */
  deleteOriginal?: boolean;
}

/** Post via a response_url (ephemeral UI only). */
export async function postViaResponseUrl(
  responseUrl: string,
  payload: ResponseUrlPayload
): Promise<void> {
  const res = await fetch(responseUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      response_type: payload.responseType ?? "ephemeral",
      replace_original: payload.replaceOriginal ?? false,
      delete_original: payload.deleteOriginal ?? false,
      text: payload.text,
      blocks: payload.blocks,
    }),
  });

  if (!res.ok) {
    throw new Error(`response_url request failed with status ${res.status}`);
  }
}

/** Ephemeral-only shorthand (only visible to the invoking user). */
export async function postEphemeralViaResponseUrl(
  responseUrl: string,
  payload: Omit<ResponseUrlPayload, "responseType">
): Promise<void> {
  await postViaResponseUrl(responseUrl, { ...payload, responseType: "ephemeral" });
}

/** Dismiss the ephemeral message tied to this response_url. */
export async function deleteEphemeralViaResponseUrl(
  responseUrl: string
): Promise<void> {
  await postViaResponseUrl(responseUrl, { deleteOriginal: true });
}
