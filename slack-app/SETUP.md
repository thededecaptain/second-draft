# SecondDraft Slack app — local setup

Run all commands from the **`slack-app/`** directory. The landing page at repo root is deployed separately via Lovable.

Follow these in order. Pause after each section and fill in `slack-app/.env`.

## Checklist

- [ ] Postgres `DATABASE_URL`
- [ ] Slack app created (Socket Mode + OAuth + `/seconddraft`)
- [ ] `.env` filled (run `node scripts/check-env.mjs`)
- [ ] `npx prisma db push`
- [ ] `npm run dev`
- [ ] Install: http://localhost:3000/slack/install
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

## 2. Slack app (from manifest)

Config lives in code: **`slack/manifest.yaml`** (or `slack/manifest.json`).

1. Go to https://api.slack.com/apps → **Create New App** → **From an app manifest**.
2. Pick your dev workspace.
3. Paste the contents of `slack/manifest.yaml` (or upload JSON).
4. Review and **Create**.

The manifest sets: app name, Socket Mode, OAuth redirect, bot scope (`commands` only), `/draft` + `/seconddraft`, and interactivity (for buttons and modals).

### After create — copy secrets to `.env`

These are **not** in the manifest; grab them once from the Slack UI:

| Slack UI | `.env` |
|----------|--------|
| **Basic Information → Signing Secret** | `SLACK_SIGNING_SECRET` |
| **OAuth & Permissions → Client ID** | `SLACK_CLIENT_ID` |
| **OAuth & Permissions → Client Secret** | `SLACK_CLIENT_SECRET` |
| **Socket Mode → Generate app-level token** (`connections:write`) | `SLACK_APP_TOKEN` |

(`SLACK_STATE_SECRET` is already in your `.env`.)

### Install to workspace (after server runs)

You will use http://localhost:3000/slack/install once `npm run dev` is up.

---

## 3. Anthropic

1. https://console.anthropic.com → API keys → create key.
2. `ANTHROPIC_API_KEY=sk-ant-...` in `.env`.

Optional: change `ANTHROPIC_MODEL` if your account uses a different model ID.

---

## 4. Validate and run

```bash
node scripts/check-env.mjs   # all required vars set
npm run dev
```

In browser: **http://localhost:3000/slack/install** → authorize.

In Slack:

```
/seconddraft Can you send me the doc by end of day?
```

Pick tone + relationship → **Rewrite** → select the code block, copy, and paste into your composer.

Optional **one-click send** (per-user OAuth, posts as you with no APP badge):

1. Set in `.env`:
   - `LOCAL_ENVELOPE_MASTER_KEY` — `openssl rand -hex 32`
   - `PUBLIC_BASE_URL` — public HTTPS URL (ngrok or Cloudflare Tunnel in dev)
2. In Slack app **OAuth & Permissions**, add redirect URL:
   - `{PUBLIC_BASE_URL}/slack/oauth/callback`
3. Restart `npm run dev`, run `/draft` again, click **⚡ Enable one-click send**, approve on slack.com once.
4. Future rewrites show **Send as me** / **Edit & send**.

Workspace install stays `commands`-only; user `chat:write` is granted individually on demand.

---

## 5. Verify (optional)

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
| Rewrite API error | Confirm Anthropic key and model |
