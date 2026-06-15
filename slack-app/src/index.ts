import { App, LogLevel } from "@slack/bolt";
import { loadConfig, type Config } from "./config.js";
import { PrismaInstallationStore } from "./slack/installation-store.js";
import { registerHandlers } from "./slack/handlers.js";
import { safeLog } from "./logging/redact.js";
import {
  createUserOAuthCallbackHandler,
  userOAuthCallbackPath,
} from "./slack/user-oauth.js";

const config = loadConfig();

function workspaceRedirectUri(cfg: Config): string | undefined {
  if (!cfg.PUBLIC_BASE_URL) return undefined;
  return `${cfg.PUBLIC_BASE_URL.replace(/\/$/, "")}/slack/oauth_redirect`;
}

// HTTP mode (no Socket Mode): Slack delivers commands/interactivity to
// POST /slack/events. Bolt's OAuth installer serves GET /slack/install and
// GET /slack/oauth_redirect for multi-workspace installs.
const app = new App({
  signingSecret: config.SLACK_SIGNING_SECRET,
  clientId: config.SLACK_CLIENT_ID,
  clientSecret: config.SLACK_CLIENT_SECRET,
  stateSecret: config.SLACK_STATE_SECRET,
  redirectUri: workspaceRedirectUri(config),
  logLevel: config.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO,
  installerOptions: {
    directInstall: true,
    redirectUriPath: "/slack/oauth_redirect",
  },
  installationStore: new PrismaInstallationStore(),
  scopes: ["commands"],
  customRoutes: [
    {
      path: userOAuthCallbackPath(),
      method: "GET",
      handler: createUserOAuthCallbackHandler(config),
    },
    {
      path: "/health",
      method: "GET",
      handler: (_req, res) => {
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end("ok");
      },
    },
  ],
});

registerHandlers(app, config);

(async () => {
  const port = config.PORT;
  await app.start(port);
  safeLog("info", "SecondDraft is running", { port, mode: "http" });
})();
