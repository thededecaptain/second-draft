# SecondDraft — Premium redesign plan

Goal: lift the landing page from "cheap warm beige" to a Stripe/Notion-grade product page. Keep the same two-section structure (hero + before/after) and the same copy intent — change feel, palette, typography, and detail craft.

## Design direction (locked from your picks)

- **Palette — Stripe Cloud**
  - Background `#ffffff`, surface `#f6f9fc`, ink `#0a2540`, accent indigo `#635bff`
  - Muted ink for secondary text (slate-500-ish), hairline borders at very low opacity
- **Type — Sora (display) + Manrope (body)**, loaded via `@fontsource` packages (no Google CDN, no `index.html` edits)
- **Hero — asymmetric split**: headline + CTAs left, Slack rewrite demo card right
- **Premium cues**: subtle multi-stop gradient washes behind hero and section transitions + crisp 1px hairlines everywhere structure needs definition

## What changes

### Tokens & foundation
- Rewrite `src/index.css` with the new palette as HSL tokens, a `--gradient-hero` (soft indigo → cyan → white wash, Stripe-style), a refined `--shadow-soft` (tighter, cooler), and a `--shadow-lift` for hover.
- Update `tailwind.config.ts` `fontFamily` to Sora / Manrope. Remove Plus Jakarta references.
- Install fonts: `bun add @fontsource/sora @fontsource-variable/manrope` and import in `src/main.tsx`.
- Remove Google Fonts `<link>` from `index.html` only if cleanup is trivial — otherwise leave (won't hurt).

### Nav (`Nav.tsx`)
- Switch dot+wordmark to a small monogram lockup, ink color, indigo dot.
- Add a faint bottom hairline only when scrolled (or keep static hairline at 60% opacity).
- Right side: `how it works`, `examples`, primary pill CTA `Add to Slack →` in indigo.

### Hero (`Hero.tsx`)
- Background: soft gradient wash (top-left indigo glow fading to white) layered behind the section, no dot texture.
- Left column:
  - Eyebrow micro-label in slate
  - Headline in Sora, 64–76px, tight tracking, deep navy ink, period as indigo accent
  - Subhead in Manrope, ~18px, slate-600
  - CTAs: primary indigo pill with soft glow shadow; secondary ghost with hairline border
  - Tiny trust row underneath ("Works in any Slack workspace · No data stored")
- Right column — Slack demo card, leveled up:
  - White card, 1px hairline, `--shadow-lift`, rounded-2xl
  - Faux Slack header: avatar dot, name, "12:04 PM"
  - "you typed" bubble in `#f6f9fc` with hairline
  - Animated arrow/label divider
  - "rewritten" bubble: white, indigo tone chip, subtle inner gradient border
  - Footer row: `Copy` and `Send as you` ghost buttons with hairlines

### Before / After (`BeforeAfter.tsx`)
- Section eyebrow: `What it looks like in practice`
- Three columns, each is one polished "card pair":
  - Tone chip (indigo tint) + context in slate
  - Before: inset panel, `#f6f9fc`, hairline, strike-through faded text
  - After: white card, hairline, `--shadow-soft`, Sora 17/24 ink copy
- Add a faint vertical hairline between columns on desktop for rhythm.

### Footer
- Single hairline top border, wordmark left, minimal links right (Privacy, GitHub), small © line. No gradient.

### Page (`Index.tsx`)
- Add the gradient wash as a fixed, low-opacity background layer behind `<main>` so section transitions feel continuous (Stripe trick).

### SEO / head
- Update `<title>` and meta description to match the new positioning ("Say it right the first time. SecondDraft rewrites Slack messages in your tone."). One H1 (already true).

## Out of scope
- No new sections (no pricing, no logos, no FAQ)
- No backend, auth, or data work — frontend/presentation only
- No changes to routing or `App.tsx`

## Technical notes
- All colors via semantic tokens — no raw `text-white`, `bg-[#...]` in components
- Fonts via `@fontsource` only; do not touch `index.html` `<link>` tags or add CSS `@import`
- Keep components small and presentational; reuse the existing file structure
- Verify with the build after edits; spot-check the preview for the gradient + hairlines rendering cleanly on white

## Files touched
- `src/index.css` (rewrite tokens)
- `tailwind.config.ts` (font families)
- `src/main.tsx` (font imports)
- `src/components/landing/Nav.tsx`
- `src/components/landing/Hero.tsx`
- `src/components/landing/BeforeAfter.tsx`
- `src/components/landing/Footer.tsx`
- `src/pages/Index.tsx` (gradient layer)
- `index.html` (title/description only)
