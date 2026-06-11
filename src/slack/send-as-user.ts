import type { WebClient } from "@slack/web-api";
import type { EnvelopeCryptoProvider } from "../crypto/envelope.js";
import { safeLog } from "../logging/redact.js";
import { buildResultMessage } from "./blocks.js";
import {
  deleteEphemeralViaResponseUrl,
  postEphemeralViaResponseUrl,
} from "./response-url.js";
import type { RewriteSession } from "./session-store.js";
import {
  getUserAccessToken,
  hasUserToken,
  revokeUserToken,
} from "./user-tokens.js";
import type { Relationship, Tone } from "../prompts/types.js";

function isSlackAuthError(err: unknown): boolean {
  const data = (err as { data?: { error?: string } })?.data?.error;
  return data === "token_revoked" || data === "invalid_auth";
}

export async function postMessageAsUser(
  client: WebClient,
  userToken: string,
  channelId: string,
  text: string
): Promise<void> {
  const result = await client.chat.postMessage({
    token: userToken,
    channel: channelId,
    text,
  });
  if (!result.ok) {
    throw Object.assign(new Error(result.error ?? "postMessage failed"), {
      data: { error: result.error },
    });
  }
}

export async function sendRewriteAsUser(args: {
  client: WebClient;
  envelope: EnvelopeCryptoProvider;
  session: RewriteSession;
  text: string;
  tone: Tone;
  relationship: Relationship;
  responseUrl: string;
  oneClickSendAvailable: boolean;
}): Promise<void> {
  const {
    client,
    envelope,
    session,
    text,
    tone,
    relationship,
    responseUrl,
    oneClickSendAvailable,
  } = args;

  const userToken = await getUserAccessToken(
    session.teamId,
    session.userId,
    envelope
  );
  if (!userToken) {
    await postEphemeralViaResponseUrl(responseUrl, {
      text: "One-click send isn't connected. Click Enable one-click send to connect.",
      replaceOriginal: true,
    });
    return;
  }

  try {
    await postMessageAsUser(client, userToken, session.channelId, text);
    await deleteEphemeralViaResponseUrl(responseUrl);
    safeLog("info", "Rewrite sent as user", {
      teamId: session.teamId,
      userId: session.userId,
      channelId: session.channelId,
    });
  } catch (err) {
    if (isSlackAuthError(err)) {
      await revokeUserToken(session.teamId, session.userId);
      const message = buildResultMessage(
        session.id,
        text,
        tone,
        relationship,
        { connected: false, oneClickSendAvailable }
      );
      await postEphemeralViaResponseUrl(responseUrl, {
        ...message,
        replaceOriginal: true,
      });
      return;
    }

    const message = err instanceof Error ? err.message : "Send failed";
    safeLog("error", "Send as user failed", {
      error: message,
      teamId: session.teamId,
      userId: session.userId,
    });
    await postEphemeralViaResponseUrl(responseUrl, {
      text: `Could not send your message: ${message}`,
      replaceOriginal: true,
    });
  }
}

export async function isUserConnected(
  teamId: string,
  userId: string,
  envelope: EnvelopeCryptoProvider
): Promise<boolean> {
  if (!(await hasUserToken(teamId, userId))) return false;
  try {
    const token = await getUserAccessToken(teamId, userId, envelope);
    return token !== null;
  } catch {
    return false;
  }
}
