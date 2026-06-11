# SecondDraft

Rewrite Slack draft messages in the right **tone** and **relationship** context.

## Repository layout

| Path | What | Deploy with |
|------|------|-------------|
| **`/`** (root) | Landing page (Vite + React) | **[Lovable](https://lovable.dev)** — Share → Publish |
| **`slack-app/`** | Bolt Slack app (`/draft`, Send as me) | Railway, Render, or local |

Lovable watches the **repo root** and deploys the marketing site. The Slack backend lives in `slack-app/` and runs as a separate Node process.

## Landing page (Lovable)

```bash
npm install
npm run dev      # http://localhost:8080
npm run build    # dist/ — what Lovable publishes
```

In Lovable: open your project → ensure it’s connected to this GitHub repo → **Share → Publish**.

## Slack app

See [slack-app/SETUP.md](./slack-app/SETUP.md).

```bash
cd slack-app
cp .env.example .env
npm install
npx prisma db push
npm run dev      # http://localhost:3000
```

Install to workspace: `http://localhost:3000/slack/install`

## Architecture (slack-app)

- `/draft` → ephemeral picker → rewrite → copy/paste or **Send as me** (per-user OAuth)
- SMB tier uses platform `ANTHROPIC_API_KEY`; enterprise BYOK is phase 2
- Drafts are not stored; usage logs token counts only
