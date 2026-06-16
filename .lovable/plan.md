## Plan

**1. Trim scenarios to 3** in `SeeItInAction.tsx`:
- Deadline panic (Formal · Manager)
- Vague client ask (Friendly · Customer)
- Brain dump (Direct · Teammate)

**2. Auto-advance the demo**
- After `showSent` + short hold, jump to the next scenario (looping).
- Remove hover-pause, prev/next/replay buttons, and clickable dots.
- Replace the bottom nav bar with a slim non-interactive 3-dot progress indicator.

**3. Move the demo into the Hero**
- Add a `variant` prop to `SeeItInAction`: `"hero"` renders just the animated card (no section wrapper, no left-side copy, height ~`h-[560px]`); `"section"` keeps current behavior.
- In `Hero.tsx`, replace the static right-column mock card with `<SeeItInAction variant="hero" />`.
- Remove `<SeeItInAction />` from `src/pages/Index.tsx`.

**4. Keep**: typing/tone-pick/rewrite/send timing, EphemeralCard, SlackMessage, channel header, composer footer.

## Files
- `src/components/landing/SeeItInAction.tsx`
- `src/components/landing/Hero.tsx`
- `src/pages/Index.tsx`