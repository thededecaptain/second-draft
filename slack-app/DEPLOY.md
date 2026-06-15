# Deploying SecondDraft (hosted, multi-workspace)

One hosted instance serves every workspace. The Prisma installation store already
keys installs by Slack team ID, so multi-workspace OAuth works out of the box.

These steps use **Railway** (recommended: simplest monorepo support, ~$5/mo).
Render and Fly work the same way — build `slack-app/`, run `npm start`, expose
the port, set the same env vars.

> Run the session store on a **single instance** (`numReplicas: 1` in
> `railway.json`). Rewrite sessions are held in memory; multiple replicas would
> lose sessions between requests.

## 1. Create the Railway service

1. https://railway.app → **New Project** → **Deploy from GitHub repo** → pick this repo.
2. In the service **Settings → Root Directory**, set: `slack-app`
   (the repo root is the marketing site; Railway should only build the Slack app).
3. Railway auto-detects Node, runs `npm ci && npm run build`, and uses the
   `startCommand` + `/health` healthcheck from `railway.json`.

## 2. Environment variables

Service → **Variables**. Copy from your local `.env`, with these changes:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Postgres connection string (Supabase/Neon). Schema is already pushed if you ran `npx prisma db push` locally against it. |
| `SLACK_SIGNING_SECRET` | From Slack app → Basic Information |
| `SLACK_CLIENT_ID` / `SLACK_CLIENT_SECRET` | From Slack app → OAuth & Permissions |
| `SLACK_STATE_SECRET` | Any random secret (`openssl rand -hex 32`) |
| `ANTHROPIC_API_KEY` | Platform key (this is the hosted/SMB tier) |
| `ANTHROPIC_MODEL` | e.g. `claude-haiku-4-5-20251001` |
| `NODE_ENV` | `production` |
| `LOCAL_ENVELOPE_MASTER_KEY` | `openssl rand -hex 32` — **generate a fresh one for prod**, do not reuse dev |
| `PUBLIC_BASE_URL` | Your Railway domain, e.g. `https://second-draft-production.up.railway.app` |

`SLACK_APP_TOKEN` is gone — HTTP mode needs no app-level token.
Do **not** set `PORT`; Railway injects it and the app reads it.

## 3. Get the public domain

Service → **Settings → Networking → Generate Domain**. Use this domain for
`PUBLIC_BASE_URL` (step 2) and everywhere `YOUR-DOMAIN` appears below.

## 4. Update the Slack app config

At https://api.slack.com/apps → your app:

1. **Socket Mode** → toggle **off**.
2. **Slash Commands** → set both `/draft` and `/seconddraft` Request URLs to:
   `https://YOUR-DOMAIN/slack/events`
3. **Interactivity & Shortcuts** → enable, Request URL:
   `https://YOUR-DOMAIN/slack/events`
4. **OAuth & Permissions → Redirect URLs** → add:
   - `https://YOUR-DOMAIN/slack/oauth_redirect` (workspace install)
   - `https://YOUR-DOMAIN/slack/oauth/callback` (per-user "send as me")

Or just update everything at once: **App Manifest** → paste
`slack/manifest.yaml` with `YOUR-DOMAIN` replaced.

Slack will verify the interactivity URL with a challenge request — deploy
**before** saving these URLs so the server is up to answer it.

## 5. Smoke test

1. `https://YOUR-DOMAIN/health` → `ok`
2. `https://YOUR-DOMAIN/slack/install` → Slack authorize screen → install into a test workspace.
3. In Slack: `/draft can you send me the numbers` → pick tone → **Rewrite**.
4. Click **⚡ Enable one-click send** → approve → **Send as me** works.

## 6. Wire up the landing page

The install link lives in `src/lib/links.ts` (repo root). Replace the
placeholder with:

```
https://YOUR-DOMAIN/slack/install
```

and republish the landing page. The "Add to Slack" button is now a real
one-click OAuth install.

## Marketplace notes (when you're ready to list)

- HTTP mode (done here) is a listing requirement — Socket Mode apps are not eligible.
- You'll need: a support email/URL, a privacy policy URL, real screenshots of
  the app in Slack, and OAuth scopes justification (`commands` only — easy approval).
- Listing review happens at https://api.slack.com/apps → your app → **Submit to App Directory**.
