## Goal
Cycle all 6 funny scenarios in the demo, with click-to-advance and pacing that gives ample time to read each rewrite. Names are picked here (no "Gida").

## Scenarios (all 6, mixed tone × relationship)

| # | Title | Tone · Rel | Channel | Incoming from |
|---|---|---|---|---|
| 1 | Prod is down | Direct · Teammate | #incidents | Priya |
| 2 | Deadline panic | Formal · Manager | #team-leads | Marcus |
| 3 | Passive-aggressive coworker | Friendly · Teammate | #design-eng | Steve |
| 4 | Vague client ask | Friendly · Customer | #acme-coop | Dana (Acme) |
| 5 | Asking for a raise | Formal · Manager | DM with Alex | Alex |
| 6 | Ghosted invoice | Direct · Customer | #billing | Nadia (Finance) |

Each scenario gets a short incoming Slack message above it so the rewrite feels like a real reply. Final "Send as me" message is posted as **"You"** (no first name — keeps it ownerless and avoids Gida).

### Draft → Rewrite copy
1. `omg the house is burning down, this customer will kick us in the ass` → "We have a critical customer issue that needs immediate attention. I'm ready to help resolve it — what do you need from me?"
2. `omg we ship friday and i haven't started the report lol i think we're cooked` → "Quick heads up: the Friday report is tighter than I'd like. Could we align on scope for 10 minutes so we land it on time?"
3. `dude steve hasn't answered my slack in 3 days, is he even alive` → "Hey Steve! Just bumping this up in case it got buried — would love your take when you get a sec. No rush at all."
4. `can u just make the thing better??` → "Hi! I'd love to refine the current direction — could you share a bit more on what 'better' looks like for you? Happy to jump on a quick call too."
5. `sooo... been here 2 yrs and i'm still making intern money?? help` → "I'd like to set up time to revisit my compensation. I've taken on meaningful scope over the past two years and would value a conversation about leveling."
6. `bruh this client dipped on the invoice for 2 months, send the goons` → "Hi — following up on invoice #1042, now 60 days overdue. Could you confirm a payment date this week? Happy to resend the invoice if helpful."

## Behavior

- **Click-to-advance**: footer row inside the card with `← Prev`, dot indicators (1 of 6), `Replay`, `Next →`. Clicking any control resets the per-scenario timeline.
- **Park on final state**: animation no longer auto-loops. After the rewrite is "sent", the demo holds indefinitely so the user can read in peace, then they hit Next.
- **Reading pace** (slower than current):
  - draft card visible ~1.8s before tone is picked
  - tone → relationship: 1.2s
  - relationship → Rewrite button: 1.2s
  - rewrite card visible **5s** before "Send as me" fires
- **Hover pause** preserved.
- **Channel header** shows `#<channel> · Scenario N / 6 — Title` so context updates per scene.

## Files

- `src/components/landing/SeeItInAction.tsx` — refactor: introduce `SCENARIOS` array, `scenarioIndex` state, per-scenario incoming message, timeline derived from active draft length, nav controls. No other files touched.
