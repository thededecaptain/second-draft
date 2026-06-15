# SecondDraft Slack app — local setup (self-host)

Run all commands from the **`slack-app/`** directory. The landing page at repo root is deployed separately via Lovable. For production hosting, see **[DEPLOY.md](./DEPLOY.md)**.

The app runs in **HTTP mode** (no Socket Mode): Slack sends requests to public HTTPS URLs, so local dev needs a tunnel (cloudflared or ngrok).

Follow these in order. Pause after each section and fill in `slack-app/.env`.

## Checklist

- [ ] Postgres `DATABASE_URL`
- [ ] Tunnel running (cloudflared/ngrok) → public HTTPS URL
- [ ] Slack app created from manifest (request URLs = your tunnel)
- [ ] `.env` filled (run `node scripts/check-env.mjs`)
- [ ] `npx prisma db push`
- [ ] `npm run dev`
- [ ] Install: https://YOUR-TUNNEL/slack/install
- [ ] Test: `/seconddraft your draft here`

---

## 1. Database

Use any Postgres 14+ host. Examples:

**Neon** (free): https://neon.tech → create project → copy connection string.

**Supabase**: Project Settings → Database → Connection string (URI, mode *Session* or *Transaction*).

Put it in `.env`:

```
DATABASE_URL=postgresql://...
```

Then:

```bash
npx prisma db push
```

---

## 2. Tunnel (dev only)

HTTP mode means Slack must reach your machine. Start a tunnel to port 3000:

```bash
# Cloudflare (free, no account needed)
cloudflared tunnel --url http://localhost:3000

# or ngrok
ngrok http 3000
```

Copy the public HTTPS URL it prints — that is `YOUR-TUNNEL` below. Put it in `.env`:

```
PUBLIC_BASE_URL=https://YOUR-TUNNEL
```

Note: free trycloudflare/ngrok URLs change on every restart — when they do, update `PUBLIC_BASE_URL` and the Slack request URLs (step 3).

---

## 3. Slack app (from manifest)

Config lives in code: **`slack/manifest.yaml`** (or `slack/manifest.json`).

1. Go to https://api.slack.com/apps → **Create New App** → **From an app manifest**.
2. Pick your dev workspace.
3. Paste the contents of `slack/manifest.yaml` with every `YOUR-DOMAIN` replaced by your tunnel host.
4. Review and **Create**.

The manifest sets: app name, request URLs, OAuth redirects, bot scope (`commands` only), `/draft` + `/seconddraft`, and interactivity (for buttons and modals).

### After create — copy secrets to `.env`

These are **not** in the manifest; grab them once from the Slack UI:

| Slack UI | `.env` |
|----------|--------|
| **Basic Information → Signing Secret** | `SLACK_SIGNING_SECRET` |
| **OAuth & Permissions → Client ID** | `SLACK_CLIENT_ID` |
| **OAuth & Permissions → Client Secret** | `SLACK_CLIENT_SECRET` |

(`SLACK_STATE_SECRET` is already in your `.env`. No app-level token is needed — that was a Socket Mode requirement.)

### Install to workspace (after server runs)

You will use https://YOUR-TUNNEL/slack/install once `npm run dev` is up.

---

## 4. Anthropic

1. https://console.anthropic.com → API keys → create key.
2. `ANTHROPIC_API_KEY=sk-ant-...` in `.env`.

Optional: change `ANTHROPIC_MODEL` if your account uses a different model ID.

---

## 5. Validate and run

```bash
node scripts/check-env.mjs   # all required vars set
npm run dev
```

In browser (tunnel must be running): **https://YOUR-TUNNEL/slack/install** → authorize.

In Slack:

```
/seconddraft Can you send me the doc by end of day?
```

Pick tone + relationship → **Rewrite** → select the code block, copy, and paste into your composer.

Optional **one-click send** (per-user OAuth, posts as you with no APP badge):

1. Set `LOCAL_ENVELOPE_MASTER_KEY` in `.env` — `openssl rand -hex 32`
   (`PUBLIC_BASE_URL` is already set from step 2; the `/slack/oauth/callback` redirect URL is already in the manifest).
2. Restart `npm run dev`, run `/draft` again, click **⚡ Enable one-click send**, approve on slack.com once.
3. Future rewrites show **Send as me** / **Edit & send**.

Workspace install stays `commands`-only; user `chat:write` is granted individually on demand.

---

## 6. Verify (optional)

```bash
npx prisma studio
```

- `workspaces` — row for your team, `tier` = SMB
- `usage_events` — row after a successful rewrite (token counts only)

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `check-env` fails | Open `.env`, fill every empty line |
| Prisma connection error | Check `DATABASE_URL`, SSL (`?sslmode=require` on cloud DBs) |
| OAuth redirect mismatch | Redirect URL must match Slack app exactly |
| `/seconddraft` missing | Reinstall app; confirm slash command exists |
| `dispatch_failed` on slash command | Tunnel down or request URL stale — restart tunnel, update URLs in Slack app settings |
| Rewrite API error | Confirm Anthropic key and model |
