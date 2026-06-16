## See it in action — animated Slack demo

Add a new landing section between `Hero` and `BeforeAfter` showing a looping, in-page Slack-style mockup that walks through the core flow: someone types a blunt message → invokes `/draft` → SecondDraft replies with a polished rewrite they can send.

### What the viewer sees (one ~9s loop)

```
1. Slack window fades in (channel: #team-updates, avatars, header)
2. User's draft types itself into the composer:
   "hey can u fix the bug asap its blocking everyone"
3. User types "/draft" → command chip appears with the SecondDraft icon
4. Tone selector flashes: [Friendly] [Assertive] [Formal] — "Assertive" highlights
5. Composer empties, a small "rewriting…" shimmer pulses for ~600ms
6. Rewritten message slides in as a sent bubble:
   "The bug is blocking the team — can you prioritize a fix today? Thanks."
7. Subtle ✓ "Sent" confirmation, hold 1.2s, fade and loop
```

### Section layout

- Eyebrow: `See it in action`
- Headline: `From rough thought to ready to send.`
- Sub: one short line, ~12 words, no API/tech language
- Right (or below on mobile): the animated Slack card, ~560px wide on desktop, with soft shadow, rounded-2xl, hairline border — matching the existing minimal aesthetic (no neon, no purple gradients)

### Motion approach

- Pure frontend, framer-motion (already permitted) driving a deterministic timeline via a single `useEffect` + `setInterval` step counter (0–6), each step triggers the next animation
- Typewriter effect for the draft text (char-by-char, ~25ms/char)
- Command chip uses spring scale-in
- Tone pills stagger in, selected one gets primary ring
- "Rewriting" state: 3 dots pulse + skeleton shimmer using existing `--primary` token
- Sent bubble: slide up + fade, then ✓ check pops via spring
- Loop restarts every ~9s; pause on hover so users can read

### Visual + token rules

- Reuse existing semantic tokens only: `background`, `surface`, `card`, `foreground`, `muted-foreground`, `primary`, `hairline`, `shadow-soft`
- Slack-style chrome is stylized (not a pixel-perfect Slack clone) — avoids trademark issues and stays on-brand
- Avatars: two small circles using `bg-primary/15` and `bg-foreground/10` with initials, no external images
- Fonts: existing `font-display` for the rewritten message, `font-body` for chat text, monospace for `/draft` chip

### Files

- New: `src/components/landing/SeeItInAction.tsx` — the section + animated mockup (self-contained, ~200 lines)
- Edit: `src/pages/Index.tsx` — insert `<SeeItInAction />` between `<Hero />` and `<BeforeAfter />`

### Out of scope

- No real Slack API, no backend calls, no Lottie/MP4 — purely a styled React + framer-motion animation
- No changes to Hero, BeforeAfter, Nav, Footer copy or design tokens
- No new dependencies (framer-motion already in the project)

### Acceptance

- New section visible on `/` between Hero and BeforeAfter
- Animation loops smoothly, pauses on hover, restarts on mouse leave
- Mobile: stacks vertically, mockup scales to full width with no overflow
- Lighthouse/visual regression: no layout shift, no console errors
