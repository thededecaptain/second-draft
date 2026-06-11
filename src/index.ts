import { App, LogLevel } from "@slack/bolt";
import { loadConfig } from "./config.js";
import { PrismaInstallationStore } from "./slack/installation-store.js";
import { registerHandlers } from "./slack/handlers.js";
import { safeLog } from "./logging/redact.js";
import {
  createUserOAuthCallbackHandler,
  userOAuthCallbackPath,
} from "./slack/user-oauth.js";

const config = loadConfig();

const app = new App({
  signingSecret: config.SLACK_SIGNING_SECRET,
  clientId: config.SLACK_CLIENT_ID,
  clientSecret: config.SLACK_CLIENT_SECRET,
  stateSecret: config.SLACK_STATE_SECRET,
  appToken: config.SLACK_APP_TOKEN,
  socketMode: true,
  logLevel: config.NODE_ENV === "development" ? LogLevel.DEBUG : LogLevel.INFO,
  installerOptions: {
    directInstall: true,
  },
  installationStore: new PrismaInstallationStore(),
  scopes: ["commands"],
  customRoutes: [
    {
      path: userOAuthCallbackPath(),
      method: "GET",
      handler: createUserOAuthCallbackHandler(config),
    },
  ],
});

registerHandlers(app, config);

(async () => {
  const port = config.PORT;
  await app.start(port);
  safeLog("info", "SecondDraft is running", { port, socketMode: true });
})();
