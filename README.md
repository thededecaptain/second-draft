# SecondDraft

Slack app that rewrites a draft message in a chosen **tone** (Friendly, Direct, Formal) for a **relationship** context (teammate, manager, customer).

## Repository layout

| Path | What it is |
|------|------------|
| **`/`** (root) | Bolt Slack app — `/draft`, rewrite, Send as me |
| **`landing/`** | Marketing site (Lovable design, landing page only) |

## Landing page

The Lovable-designed marketing site lives in `landing/` — no dashboard, no Supabase.

```bash
cd landing
npm install
npm run dev    # http://localhost:8080
npm run build  # static files in landing/dist/
```

Deploy `landing/dist/` to any static host (Vercel, Netlify, Cloudflare Pages).

## Architecture

### Tier model

Each installed Slack workspace has a `Workspace` row with `tier`:

| Tier | LLM API key source |
|------|-------------------|
| **SMB** (default on install) | Platform `ANTHROPIC_API_KEY` from server env |
| **ENTERPRISE** | Customer key stored encrypted in `CustomerKey` (phase 2) |

The **only** runtime fork for tiers is in `src/keys/resolver.ts` (`LlmKeyResolver`). Handlers, prompts, and the LLM client call `resolveForWorkspace()` and never read `ANTHROPIC_API_KEY` or customer ciphertext directly.

### Request flow (phase 1)

1. `/draft <draft>` → ephemeral picker (tone + relationship) → rewrite → copy/paste or optional one-click **Send as me** (per-user OAuth)
2. `src/prompts/templates.ts` builds the prompt from composable tone/relationship guidance
3. Key resolver → Anthropic Messages API
4. Ephemeral rewrite in channel; `UsageEvent` logged (token counts only)

### Privacy

- Draft and rewrite text are **not** logged or stored.
- `UsageEvent` stores counts and model metadata for monthly cost aggregation.

## Setup

**Step-by-step:** see [SETUP.md](./SETUP.md).

1. Copy `.env.example` to `.env` and fill values (or use the starter `.env` already in the repo).
2. Create a [Slack app](https://api.slack.com/apps) from **`slack/manifest.yaml`**, then copy signing secret, OAuth client credentials, and app-level token to `.env`.
3. Database:

```bash
npm install
npx prisma db push
```

4. Run:

```bash
npm run dev
```

Install the app into a workspace via the OAuth URL Bolt serves (default port `3000`).

## Project layout

```
src/
  config.ts           # Typed env; fails fast on missing vars
  keys/resolver.ts    # Key-resolution chokepoint
  prompts/            # Versioned prompt templates
  llm/rewrite.ts      # Anthropic call
  slack/              # Bolt handlers, OAuth store, modals
  usage/log.ts        # UsageEvent writes
  logging/redact.ts   # Safe logging (no bodies or secrets)
  crypto/envelope.ts  # Envelope encryption interface (phase 2)
```

## Phase 2 (not implemented)

- Enterprise key management UI/commands
- KMS-backed `EnvelopeCryptoProvider` + `CustomerKey` decrypt in resolver
- Message shortcut (in addition to slash command)
- Monthly usage reporting
