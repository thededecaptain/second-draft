import type { App, BlockAction, SlackActionMiddlewareArgs } from "@slack/bolt";
import type { ModalView } from "@slack/types";
import type { WebClient } from "@slack/web-api";
import type { Config } from "../config.js";
import {
  readSelectionsFromAction,
  sessionIdFromAction,
  sessionIdFromBlockId,
} from "./actions.js";
import {
  buildLoadingMessage,
  buildResultMessage,
  buildSelectionMessage,
} from "./blocks.js";
import { createEnvelopeProvider } from "../crypto/local-envelope.js";
import { NotConfiguredEnvelopeProvider } from "../crypto/envelope.js";
import { LlmKeyResolver } from "../keys/resolver.js";
import { rewriteDraft } from "../llm/rewrite.js";
import { safeLog } from "../logging/redact.js";
import { prisma } from "../db/client.js";
import {
  RELATIONSHIPS,
  TONES,
  type Relationship,
  type Tone,
} from "../prompts/types.js";
import { logUsageEvent } from "../usage/log.js";
import {
  deleteEphemeralViaResponseUrl,
  postEphemeralViaResponseUrl,
} from "./response-url.js";
import { createSession, getSession, updateSession } from "./session-store.js";
import {
  buildConnectInterstitialModal,
  buildEditSendModal,
  EDIT_SEND_CALLBACK,
  rewrittenFromViewSubmission,
} from "./modals.js";
import { buildUserAuthorizeUrl } from "./user-oauth.js";
import { isUserConnected, sendRewriteAsUser } from "./send-as-user.js";

/** Commands registered in Slack (manifest uses /seconddraft; /draft supported as alias). */
const SLASH_COMMANDS = ["/seconddraft", "/draft"] as const;

const DEFAULT_TONE: Tone = "friendly";
const DEFAULT_RELATIONSHIP: Relationship = "teammate";

function isToneValue(value: string): value is Tone {
  return (TONES as readonly string[]).includes(value);
}

function isRelationshipValue(value: string): value is Relationship {
  return (RELATIONSHIPS as readonly string[]).includes(value);
}

function oneClickSendAvailable(config: Config): boolean {
  return Boolean(config.PUBLIC_BASE_URL && config.LOCAL_ENVELOPE_MASTER_KEY);
}

function rememberResponseUrl(sessionId: string, responseUrl: string | undefined): void {
  if (responseUrl) {
    updateSession(sessionId, { responseUrl });
  }
}

function registerSlashCommandHandler(app: App, slashCommand: string): void {
  app.command(slashCommand, async ({ command, ack, respond }) => {
    await ack();

    const draft = (command.text ?? "").trim();
    if (!draft) {
      await respond({
        response_type: "ephemeral",
        text: `Usage: \`${slashCommand} <your draft message>\``,
      });
      return;
    }

    if (draft.length > 2500) {
      await respond({
        response_type: "ephemeral",
        text: "Draft is too long (max 2500 characters). Shorten it and try again.",
      });
      return;
    }

    const session = createSession({
      draft,
      channelId: command.channel_id,
      teamId: command.team_id,
      userId: command.user_id,
      tone: DEFAULT_TONE,
      relationship: DEFAULT_RELATIONSHIP,
    });

    const message = buildSelectionMessage(
      session.id,
      draft,
      DEFAULT_TONE,
      DEFAULT_RELATIONSHIP
    );

    await respond({
      response_type: "ephemeral",
      ...message,
    });
  });
}

async function executeRewrite(
  config: Config,
  keyResolver: LlmKeyResolver,
  sessionId: string,
  tone: Tone,
  relationship: Relationship,
  responseUrl: string
): Promise<void> {
  const session = getSession(sessionId);
  if (!session) {
    await postEphemeralViaResponseUrl(responseUrl, {
      text: "This session expired. Run `/draft` again.",
      replaceOriginal: true,
    });
    return;
  }

  rememberResponseUrl(sessionId, responseUrl);

  const workspace = await prisma.workspace.findUnique({
    where: { slackTeamId: session.teamId },
  });
  if (!workspace) {
    await postEphemeralViaResponseUrl(responseUrl, {
      text: "This workspace is not installed. Reinstall SecondDraft.",
      replaceOriginal: true,
    });
    return;
  }

  await postEphemeralViaResponseUrl(responseUrl, {
    ...buildLoadingMessage(),
    replaceOriginal: true,
  });

  const { apiKey } = await keyResolver.resolveForWorkspace(workspace.id);
  const result = await rewriteDraft(apiKey, config, {
    draft: session.draft,
    tone,
    relationship,
  });

  await logUsageEvent(workspace.id, result);
  updateSession(sessionId, { tone, relationship, rewritten: result.rewritten });

  const envelope = createEnvelopeProvider(config.LOCAL_ENVELOPE_MASTER_KEY);
  const connected = await isUserConnected(session.teamId, session.userId, envelope);

  const message = buildResultMessage(sessionId, result.rewritten, tone, relationship, {
    connected,
    oneClickSendAvailable: oneClickSendAvailable(config),
  });

  await postEphemeralViaResponseUrl(responseUrl, {
    ...message,
    replaceOriginal: true,
  });

  safeLog("info", "Rewrite completed", {
    workspaceId: workspace.id,
    teamId: session.teamId,
    userId: session.userId,
    model: result.model,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });
}

function requireSessionForAction(
  sessionId: string | null,
  userId: string,
  responseUrl: string | undefined
): ReturnType<typeof getSession> {
  if (!responseUrl || !sessionId) return undefined;
  const session = getSession(sessionId);
  if (!session || session.userId !== userId) return undefined;
  rememberResponseUrl(sessionId, responseUrl);
  return session;
}

async function openModal(
  client: WebClient,
  triggerId: string,
  view: ModalView,
  responseUrl: string | undefined
): Promise<void> {
  try {
    await client.views.open({ trigger_id: triggerId, view });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not open modal";
    safeLog("error", "views.open failed", { error: message });
    if (responseUrl) {
      await postEphemeralViaResponseUrl(responseUrl, {
        text: "Could not open the editor. Select the code block above and copy instead.",
        replaceOriginal: false,
      });
    }
  }
}

export function registerHandlers(app: App, config: Config): void {
  const keyResolver = new LlmKeyResolver(config, new NotConfiguredEnvelopeProvider());
  const envelope = createEnvelopeProvider(config.LOCAL_ENVELOPE_MASTER_KEY);

  for (const slashCommand of SLASH_COMMANDS) {
    registerSlashCommandHandler(app, slashCommand);
  }

  const handleRewriteAction = async ({
    body,
    ack,
  }: SlackActionMiddlewareArgs<BlockAction>): Promise<void> => {
    await ack();

    const responseUrl = body.response_url;
    const userId = body.user.id;
    const action = body.actions[0] as { value?: string; block_id?: string };
    const sessionId = sessionIdFromAction(action);

    const session = requireSessionForAction(sessionId, userId, responseUrl);
    if (!session || !responseUrl || !sessionId) {
      if (responseUrl) {
        await postEphemeralViaResponseUrl(responseUrl, {
          text: "This session expired or is invalid. Run `/draft` again.",
          replaceOriginal: true,
        });
      }
      return;
    }

    const selections = readSelectionsFromAction(body, {
      tone: session.tone,
      relationship: session.relationship,
    });
    if (!selections) {
      safeLog("warn", "Could not resolve tone/relationship for rewrite", { userId });
      await postEphemeralViaResponseUrl(responseUrl, {
        text: "Could not read your tone/relationship picks. Run `/draft` again.",
        replaceOriginal: true,
      });
      return;
    }

    try {
      await executeRewrite(
        config,
        keyResolver,
        sessionId,
        selections.tone,
        selections.relationship,
        responseUrl
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Rewrite failed";
      safeLog("error", "Rewrite failed", {
        error: message,
        teamId: session.teamId,
        userId,
      });
      await postEphemeralViaResponseUrl(responseUrl, {
        text: `Could not rewrite your message: ${message}`,
        replaceOriginal: true,
      });
    }
  };

  const handleSelectChange = async ({
    body,
    ack,
    action,
  }: SlackActionMiddlewareArgs<BlockAction>): Promise<void> => {
    await ack();

    if (action.type !== "static_select" || !action.selected_option?.value) {
      return;
    }

    const sessionId = sessionIdFromBlockId(action.block_id);
    if (!sessionId) return;

    const session = getSession(sessionId);
    if (!session || session.userId !== body.user.id) return;

    if ("response_url" in body && body.response_url) {
      rememberResponseUrl(sessionId, body.response_url);
    }

    const value = action.selected_option.value;
    if (action.action_id === "seconddraft_tone" && isToneValue(value)) {
      updateSession(sessionId, { tone: value });
    } else if (
      action.action_id === "seconddraft_relationship" &&
      isRelationshipValue(value)
    ) {
      updateSession(sessionId, { relationship: value });
    }
  };

  app.action("seconddraft_tone", handleSelectChange);
  app.action("seconddraft_relationship", handleSelectChange);
  app.action("seconddraft_rewrite", handleRewriteAction);
  app.action("seconddraft_regenerate", handleRewriteAction);

  app.action("seconddraft_dismiss", async ({ body, ack }) => {
    await ack();
    if ("response_url" in body && body.response_url) {
      await deleteEphemeralViaResponseUrl(body.response_url);
    }
  });

  app.action("seconddraft_edit_send", async ({ body, ack, client }) => {
    await ack();
    if (body.type !== "block_actions") return;

    const responseUrl = body.response_url;
    const userId = body.user.id;
    const action = body.actions[0] as { value?: string };
    const sessionId = sessionIdFromAction(action);
    const session = requireSessionForAction(sessionId, userId, responseUrl);

    if (!session?.rewritten || !body.trigger_id) {
      if (responseUrl) {
        await postEphemeralViaResponseUrl(responseUrl, {
          text: "This session expired. Run `/draft` again.",
          replaceOriginal: true,
        });
      }
      return;
    }

    await openModal(
      client,
      body.trigger_id,
      buildEditSendModal(
        session.id,
        session.rewritten,
        session.tone,
        session.relationship
      ),
      responseUrl
    );
  });

  app.action("seconddraft_enable_send", async ({ body, ack, client }) => {
    await ack();
    if (body.type !== "block_actions") return;

    const responseUrl = body.response_url;
    const userId = body.user.id;
    const teamId = body.team?.id;
    const action = body.actions[0] as { value?: string };
    const sessionId = sessionIdFromAction(action);
    const session = requireSessionForAction(sessionId, userId, responseUrl);

    if (!session || !body.trigger_id) return;

    if (!oneClickSendAvailable(config)) {
      await postEphemeralViaResponseUrl(responseUrl!, {
        text:
          "One-click send isn't configured on this server yet. Set PUBLIC_BASE_URL and LOCAL_ENVELOPE_MASTER_KEY, then add the OAuth redirect URL in your Slack app settings.",
        replaceOriginal: false,
      });
      return;
    }

    const authorizeUrl = buildUserAuthorizeUrl(config, teamId ?? session.teamId, userId);
    if (!authorizeUrl) return;

    await openModal(
      client,
      body.trigger_id,
      buildConnectInterstitialModal(authorizeUrl),
      responseUrl
    );
  });

  app.action("seconddraft_send_as_me", async ({ body, ack, client }) => {
    await ack();
    if (body.type !== "block_actions") return;

    const responseUrl = body.response_url;
    const userId = body.user.id;
    const action = body.actions[0] as { value?: string };
    const sessionId = sessionIdFromAction(action);
    const session = requireSessionForAction(sessionId, userId, responseUrl);

    if (!session?.rewritten || !responseUrl) return;

    await sendRewriteAsUser({
      client,
      envelope,
      session,
      text: session.rewritten,
      tone: session.tone,
      relationship: session.relationship,
      responseUrl,
      oneClickSendAvailable: oneClickSendAvailable(config),
    });
  });

  app.view(EDIT_SEND_CALLBACK, async ({ ack, body, view, client }) => {
    await ack();

    const sessionId = view.private_metadata;
    const session = getSession(sessionId);
    if (!session || session.userId !== body.user.id) {
      return;
    }

    const rewritten = rewrittenFromViewSubmission(view.state.values);
    if (!rewritten) return;

    updateSession(sessionId, { rewritten });

    const responseUrl = session.responseUrl;
    if (!responseUrl) return;

    await sendRewriteAsUser({
      client,
      envelope,
      session,
      text: rewritten,
      tone: session.tone,
      relationship: session.relationship,
      responseUrl,
      oneClickSendAvailable: oneClickSendAvailable(config),
    });
  });
}
