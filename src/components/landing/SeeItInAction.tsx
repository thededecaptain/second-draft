import { useEffect, useMemo, useRef, useState } from "react";

type Scenario = {
  title: string;
  draft: string;
  rewritten: string;
  tone: "Friendly" | "Direct" | "Formal";
  relationship: "Teammate" | "Manager" | "Customer";
  channel: string;
  incoming: { name: string; initials: string; avatarClass: string; time: string; body: string };
};

const SCENARIOS: Scenario[] = [
  {
    title: "Deadline panic",
    draft: "omg we ship friday and i haven't started the report lol i think we're cooked",
    rewritten:
      "Quick heads up: the Friday report is tighter than I'd like. Could we align on scope for 10 minutes so we land it on time?",
    tone: "Formal",
    relationship: "Manager",
    channel: "team-leads",
    incoming: {
      name: "Marcus",
      initials: "M",
      avatarClass: "bg-[#1264A3] text-white",
      time: "9:14 AM",
      body: "How's the Q3 report coming? Want to make sure we're on track for Friday's review.",
    },
  },
  {
    title: "Vague client ask",
    draft: "can u just make the thing better??",
    rewritten:
      "Hi! I'd love to refine the current direction — could you share a bit more on what 'better' looks like for you? Happy to jump on a quick call too.",
    tone: "Friendly",
    relationship: "Customer",
    channel: "acme-coop",
    incoming: {
      name: "Dana (Acme)",
      initials: "D",
      avatarClass: "bg-[#D93F4B] text-white",
      time: "9:31 AM",
      body: "took a look at the draft — it's fine but can it just be… better? you know what I mean",
    },
  },
  {
    title: "Brain dump",
    draft:
      "wireframes almost done then design review then hi fi maybe like 1-2 days late but not a big deal i think",
    rewritten:
      "We're on track — wireframes are nearly complete, and after the design review we'll move into hi-fi prototypes. We're looking at a minor delay of a day or two, but nothing that impacts the overall timeline.",
    tone: "Direct",
    relationship: "Teammate",
    channel: "product-updates",
    incoming: {
      name: "Jordan",
      initials: "J",
      avatarClass: "bg-[#0F766E] text-white",
      time: "9:40 AM",
      body: "Hey, quick update on the Q3 redesign?",
    },
  },
];

const PER_CHAR = 22;
const START_TYPING = 600;

const buildTimes = (draft: string) => {
  const startTyping = START_TYPING;
  const draftDone = startTyping + ("/draft " + draft).length * PER_CHAR;
  const showDraftCard = draftDone + 500;
  const pickTone = showDraftCard + 1500;
  const pickRel = pickTone + 1100;
  const clickRewrite = pickRel + 1100;
  const rewriting = clickRewrite + 250;
  const showRewriteCard = rewriting + 1500;
  const clickSend = showRewriteCard + 3500;
  const sent = clickSend + 450;
  const advance = sent + 2200;
  return {
    startTyping,
    draftDone,
    showDraftCard,
    pickTone,
    pickRel,
    clickRewrite,
    rewriting,
    showRewriteCard,
    clickSend,
    sent,
    advance,
  };
};

type Variant = "hero" | "section";

const SeeItInAction = ({ variant = "section" }: { variant?: Variant }) => {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [t, setT] = useState(0);
  const startRef = useRef<number>(performance.now());
  const rafRef = useRef<number>();
  const advancedRef = useRef(false);

  const scenario = SCENARIOS[scenarioIndex];
  const fullTyping = "/draft " + scenario.draft;
  const times = useMemo(() => buildTimes(scenario.draft), [scenario.draft]);

  useEffect(() => {
    startRef.current = performance.now();
    advancedRef.current = false;
    setT(0);
  }, [scenarioIndex]);

  useEffect(() => {
    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      setT(Math.min(elapsed, times.advance));
      if (elapsed >= times.advance && !advancedRef.current) {
        advancedRef.current = true;
        setScenarioIndex((i) => (i + 1) % SCENARIOS.length);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
  }, [times.advance]);

  const typedCount = Math.max(
    0,
    Math.min(fullTyping.length, Math.floor((t - times.startTyping) / PER_CHAR))
  );
  const typedText = fullTyping.slice(0, typedCount);
  const showCaret = t > times.startTyping && t < times.showDraftCard;

  const showDraftCard = t > times.showDraftCard && t < times.rewriting;
  const tonePicked = t > times.pickTone;
  const relPicked = t > times.pickRel;
  const rewritePressed = t > times.clickRewrite && t < times.rewriting + 150;
  const rewriting = t > times.rewriting && t < times.showRewriteCard;
  const showRewriteCard = t > times.showRewriteCard && t < times.sent;
  const sendPressed = t > times.clickSend && t < times.sent + 150;
  const showSent = t > times.sent;

  const composerDraft = t < times.showDraftCard ? typedText : "";

  const isHero = variant === "hero";

  const card = (
    <div
      className="overflow-hidden rounded-2xl border border-hairline bg-card"
      style={{ boxShadow: "var(--shadow-lift)" }}
    >
      <div className={`flex flex-col ${isHero ? "h-[560px]" : "h-[640px] md:h-[660px]"}`}>
        <div className="flex items-center justify-between border-b border-hairline bg-background px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="font-display text-[15px] font-bold text-foreground/80">#</span>
            <span className="font-display text-[14.5px] font-semibold text-foreground">
              {scenario.channel}
            </span>
          </div>
          <div className="text-[11px] text-muted-foreground">{scenario.title}</div>
        </div>

        <div className="flex flex-1 flex-col justify-end gap-4 overflow-hidden bg-background px-4 py-4 md:px-6 md:py-5">
          <SlackMessage
            key={`incoming-${scenarioIndex}`}
            initials={scenario.incoming.initials}
            name={scenario.incoming.name}
            time={scenario.incoming.time}
            avatarClass={scenario.incoming.avatarClass}
          >
            {scenario.incoming.body}
          </SlackMessage>

          {showDraftCard && (
            <EphemeralCard>
              <div className="mb-1.5 font-display text-[13.5px] font-semibold text-foreground">
                Your draft
              </div>
              <div className="mb-3 rounded-md border border-hairline bg-surface/60 px-3 py-2 font-mono text-[12.5px] text-foreground">
                {scenario.draft}
              </div>
              <div className="mb-2.5 text-[11.5px] text-muted-foreground">
                <span className="italic">Only visible to you.</span> Pick tone and who you're
                writing to.
              </div>
              <div className="mb-3 flex flex-wrap gap-2">
                <FakeSelect
                  placeholder="Tone"
                  value={tonePicked ? scenario.tone : undefined}
                  active={t > times.showDraftCard && t < times.pickTone}
                />
                <FakeSelect
                  placeholder="Relationship"
                  value={relPicked ? scenario.relationship : undefined}
                  active={t > times.pickTone && t < times.pickRel}
                />
              </div>
              <button
                className={`rounded-md bg-[#007a5a] px-3.5 py-1.5 font-display text-[12.5px] font-semibold text-white transition-all ${
                  rewritePressed ? "scale-95 brightness-90" : ""
                }`}
              >
                Rewrite
              </button>
            </EphemeralCard>
          )}

          {showRewriteCard && (
            <EphemeralCard>
              <div className="mb-1.5 font-display text-[13.5px] font-semibold text-foreground">
                Your rewrite —{" "}
                <span className="font-normal text-muted-foreground">
                  {scenario.tone} · {scenario.relationship}
                </span>
              </div>
              <div className="mb-3 rounded-md border border-hairline bg-surface/60 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-foreground">
                {scenario.rewritten}
              </div>
              <div className="mb-2.5 text-[11.5px] italic text-muted-foreground">
                Sends to this channel as you when you click send.
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  className={`rounded-md bg-[#007a5a] px-3 py-1.5 font-display text-[12px] font-semibold text-white transition-all ${
                    sendPressed ? "scale-95 brightness-90" : ""
                  }`}
                >
                  Send as me
                </button>
                <SecondaryBtn>Edit & send</SecondaryBtn>
                <SecondaryBtn>Regenerate</SecondaryBtn>
                <SecondaryBtn>Dismiss</SecondaryBtn>
              </div>
            </EphemeralCard>
          )}

          {showSent && (
            <SlackMessage
              initials="Y"
              name="You"
              time="9:42 AM"
              avatarClass="bg-primary text-primary-foreground"
            >
              {scenario.rewritten}
            </SlackMessage>
          )}
        </div>

        <div className="border-t border-hairline bg-background px-4 py-3 md:px-5 md:py-3.5">
          <div className="rounded-md border border-hairline bg-background">
            <div className="flex items-center gap-3 border-b border-hairline px-3 py-1.5 text-muted-foreground/70">
              {["B", "I", "U", "S"].map((c) => (
                <span key={c} className="font-display text-[11px] font-semibold">
                  {c}
                </span>
              ))}
              <span className="text-[11px]">🔗</span>
            </div>
            <div className="flex min-h-[36px] items-center gap-1.5 px-3 py-2 font-body text-[14px]">
              {rewriting ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Dots />
                  <span className="text-[13px]">SecondDraft is rewriting…</span>
                </span>
              ) : composerDraft ? (
                <>
                  {composerDraft.startsWith("/draft") ? (
                    <>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-primary">
                        /draft
                      </span>
                      <span className="text-foreground">{composerDraft.slice(6)}</span>
                    </>
                  ) : (
                    <span className="text-foreground">{composerDraft}</span>
                  )}
                  {showCaret && (
                    <span className="inline-block h-[15px] w-[1.5px] animate-pulse bg-foreground/70" />
                  )}
                </>
              ) : (
                <span className="text-muted-foreground/60">Message #{scenario.channel}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 border-t border-hairline bg-surface/40 px-4 py-3">
          {SCENARIOS.map((_, i) => (
            <span
              key={i}
              aria-hidden
              className={`h-1.5 rounded-full transition-all ${
                i === scenarioIndex ? "w-5 bg-primary" : "w-1.5 bg-foreground/20"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  if (isHero) return card;

  return (
    <section
      id="demo"
      className="border-b border-hairline/70 bg-background"
      aria-label="See SecondDraft in action"
    >
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 py-24 md:grid-cols-12 md:gap-16 md:py-32">
        <div className="md:col-span-5">
          <div className="mb-3 micro-label">See it in action</div>
          <h2 className="mb-5 font-display text-3xl font-semibold tracking-tight text-foreground md:text-[40px] md:leading-[1.1]">
            One shortcut, three steps
            <span className="text-primary">.</span>
          </h2>
          <div className="max-w-md space-y-4 font-body text-[15.5px] leading-relaxed text-muted-foreground">
            <p>
              Type how it sounds in your head. SecondDraft rewrites it for the tone and the
              person on the other end — then sends it as you.
            </p>
          </div>
        </div>
        <div className="md:col-span-7">{card}</div>
      </div>
    </section>
  );
};

const SlackMessage = ({
  initials,
  name,
  time,
  avatarClass,
  children,
}: {
  initials: string;
  name: string;
  time: string;
  avatarClass: string;
  children: React.ReactNode;
}) => (
  <div className="flex items-start gap-3 animate-in fade-in slide-in-from-bottom-1 duration-300">
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[13px] font-semibold ${avatarClass}`}
    >
      {initials}
    </div>
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[13.5px] font-bold text-foreground">{name}</span>
        <span className="text-[11px] text-muted-foreground">{time}</span>
      </div>
      <p className="font-body text-[14px] leading-snug text-foreground/85">{children}</p>
    </div>
  </div>
);

const EphemeralCard = ({ children }: { children: React.ReactNode }) => (
  <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
    <div className="mb-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
      <svg width="11" height="11" viewBox="0 0 20 20" fill="currentColor">
        <path d="M10 4c-4 0-7 4-7 6s3 6 7 6 7-4 7-6-3-6-7-6Zm0 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z" />
      </svg>
      Only visible to you
    </div>
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-[13px] font-semibold text-primary-foreground">
        ●
      </div>
      <div className="flex-1">
        <div className="mb-1 flex items-baseline gap-2">
          <span className="font-display text-[13.5px] font-bold text-foreground">
            second draft
          </span>
          <span className="rounded bg-foreground/10 px-1 py-px text-[9px] font-bold uppercase tracking-wide text-muted-foreground">
            App
          </span>
          <span className="text-[11px] text-muted-foreground">9:41 AM</span>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const FakeSelect = ({
  placeholder,
  value,
  active,
}: {
  placeholder: string;
  value?: string;
  active?: boolean;
}) => (
  <div
    className={`flex min-w-[130px] items-center justify-between gap-2 rounded-md border bg-background px-2.5 py-1.5 text-[12.5px] transition-colors ${
      active ? "border-primary ring-2 ring-primary/20" : "border-hairline"
    }`}
  >
    <span className={value ? "text-foreground" : "text-muted-foreground"}>
      {value ?? placeholder}
    </span>
    <svg
      width="10"
      height="10"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="text-muted-foreground"
    >
      <path d="M5 7l5 6 5-6z" />
    </svg>
  </div>
);

const SecondaryBtn = ({ children }: { children: React.ReactNode }) => (
  <button className="rounded-md border border-hairline bg-background px-3 py-1.5 font-display text-[12px] font-semibold text-foreground/80">
    {children}
  </button>
);

const Dots = () => (
  <span className="inline-flex items-center gap-1">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="h-1.5 w-1.5 rounded-full bg-primary/70"
        style={{
          animation: "sd-bounce 1s ease-in-out infinite",
          animationDelay: `${i * 140}ms`,
        }}
      />
    ))}
    <style>{`@keyframes sd-bounce {
      0%, 80%, 100% { transform: translateY(0); opacity: .5; }
      40% { transform: translateY(-3px); opacity: 1; }
    }`}</style>
  </span>
);

export default SeeItInAction;
