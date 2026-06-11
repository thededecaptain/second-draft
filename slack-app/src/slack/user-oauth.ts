import type { IncomingMessage, ServerResponse } from "node:http";
import type { Config } from "../config.js";
import { createEnvelopeProvider } from "../crypto/local-envelope.js";
import { safeLog } from "../logging/redact.js";
import { createOAuthState, verifyOAuthState } from "./oauth-state.js";
import { saveUserToken } from "./user-tokens.js";

const USER_SCOPE = "chat:write";

export function userOAuthCallbackPath(): string {
  return "/slack/oauth/callback";
}

export function buildUserAuthorizeUrl(config: Config, teamId: string, userId: string): string | null {
  if (!config.PUBLIC_BASE_URL) return null;

  const redirectUri = `${config.PUBLIC_BASE_URL.replace(/\/$/, "")}${userOAuthCallbackPath()}`;
  const state = createOAuthState(teamId, userId, config.SLACK_STATE_SECRET);
  const params = new URLSearchParams({
    client_id: config.SLACK_CLIENT_ID,
    user_scope: USER_SCOPE,
    redirect_uri: redirectUri,
    state,
  });
  return `https://slack.com/oauth/v2/authorize?${params.toString()}`;
}

interface OAuthAccessResponse {
  ok: boolean;
  error?: string;
  authed_user?: {
    id?: string;
    access_token?: string;
  };
}

export function createUserOAuthCallbackHandler(config: Config) {
  const envelope = createEnvelopeProvider(config.LOCAL_ENVELOPE_MASTER_KEY);

  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    const error = url.searchParams.get("error");

    if (error) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderPage("Connection cancelled", "You can close this tab and return to Slack."));
      return;
    }

    if (!code || !state) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderPage("Invalid request", "Missing authorization code. Try again from Slack."));
      return;
    }

    const payload = verifyOAuthState(state, config.SLACK_STATE_SECRET);
    if (!payload) {
      res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderPage("Session expired", "Go back to Slack and click Enable one-click send again."));
      return;
    }

    const redirectUri = `${config.PUBLIC_BASE_URL!.replace(/\/$/, "")}${userOAuthCallbackPath()}`;

    try {
      const tokenRes = await fetch("https://slack.com/api/oauth.v2.access", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: config.SLACK_CLIENT_ID,
          client_secret: config.SLACK_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri,
        }),
      });

      const data = (await tokenRes.json()) as OAuthAccessResponse;
      if (!data.ok || !data.authed_user?.access_token) {
        safeLog("error", "User OAuth token exchange failed", {
          error: data.error ?? "unknown",
          teamId: payload.teamId,
        });
        res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
        res.end(renderPage("Connection failed", "Something went wrong. Try again from Slack."));
        return;
      }

      if (data.authed_user.id && data.authed_user.id !== payload.userId) {
        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
        res.end(renderPage("Wrong account", "Sign in as the same Slack user who clicked Connect."));
        return;
      }

      await saveUserToken(
        payload.teamId,
        payload.userId,
        data.authed_user.access_token,
        envelope
      );

      safeLog("info", "User OAuth connected", {
        teamId: payload.teamId,
        userId: payload.userId,
      });

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(
        renderPage(
          "Connected",
          "One-click send is enabled. Return to Slack — your next rewrite will show Send as me."
        )
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "OAuth failed";
      safeLog("error", "User OAuth callback error", { error: message });
      res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
      res.end(renderPage("Connection failed", message));
    }
  };
}

function renderPage(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SecondDraft — ${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1rem; color: #1a1a2e; }
    h1 { font-size: 1.25rem; }
    p { line-height: 1.5; color: #444; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(body)}</p>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
