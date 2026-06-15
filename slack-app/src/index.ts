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
    {
      path: "/health/db",
      method: "GET",
      handler: async (_req, res) => {
        try {
          const { prisma } = await import("./db/client.js");
          await prisma.$queryRaw`SELECT 1 AS ok`;
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: true }));
        } catch (err) {
          const message = err instanceof Error ? err.message : "Database unreachable";
          safeLog("error", "Database health check failed", { error: message });
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ ok: false, error: message }));
        }
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
