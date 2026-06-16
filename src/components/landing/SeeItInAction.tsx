import { useEffect, useRef, useState } from "react";

const DRAFT = "hey can u fix the bug asap pls its blocking";
const REWRITTEN =
  "Hi there! I wanted to check in on that bug — could you let me know where things stand? It's currently blocking the team and I'd appreciate an update when you get a chance.";

const TONES = ["Friendly", "Direct", "Formal"] as const;
const RELATIONSHIPS = ["Teammate", "Manager", "Customer"] as const;
const SELECTED_TONE = "Friendly";
const SELECTED_REL = "Customer";

// Timeline (ms from loop start)
const T = {
  startTyping: 500,
  perChar: 26,
  get draftDone() {
    return this.startTyping + ("/draft " + DRAFT).length * this.perChar;
  },
  get showDraftCard() {
    return this.draftDone + 350;
  },
  get pickTone() {
    return this.showDraftCard + 900;
  },
  get pickRel() {
    return this.pickTone + 700;
  },
  get clickRewrite() {
    return this.pickRel + 700;
  },
  get rewriting() {
    return this.clickRewrite + 200;
  },
  get showRewriteCard() {
    return this.rewriting + 1300;
  },
  get clickSend() {
    return this.showRewriteCard + 1600;
  },
  get sent() {
    return this.clickSend + 400;
  },
  get loop() {
    return this.sent + 2600;
  },
};

const SeeItInAction = () => {
  const [t, setT] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef<number>(performance.now());
  const rafRef = useRef<number>();

  useEffect(() => {
    const tick = (now: number) => {
      if (!paused) {
        const elapsed = now - startRef.current;
        if (elapsed > T.loop) {
          startRef.current = now;
          setT(0);
        } else {
          setT(elapsed);
        }
      } else {
        startRef.current = now - t;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const fullTyping = "/draft " + DRAFT;
  const typedCount = Math.max(
    0,
    Math.min(fullTyping.length, Math.floor((t - T.startTyping) / T.perChar))
  );
  const typedText = fullTyping.slice(0, typedCount);
  const showCaret = t > T.startTyping && t < T.showDraftCard;

  const showDraftCard = t > T.showDraftCard && t < T.rewriting;
  const tonePicked = t > T.pickTone;
  const relPicked = t > T.pickRel;
  const rewritePressed = t > T.clickRewrite && t < T.rewriting + 150;
  const rewriting = t > T.rewriting && t < T.showRewriteCard;
  const showRewriteCard = t > T.showRewriteCard && t < T.sent;
  const sendPressed = t > T.clickSend && t < T.sent + 150;
  const showSent = t > T.sent;

  // After draft submitted, composer should be empty-ish
  const composerDraft = t < T.showDraftCard ? typedText : "";

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
              Type how it sounds in your head. SecondDraft rewrites it for the
              tone and the person on the other end — then sends it as you.
            </p>
            <ol className="space-y-2.5">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  1
                </span>
                <span>
                  Run{" "}
                  <span className="font-mono text-foreground">/draft</span>{" "}
                  with your rough message in any Slack channel.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  2
                </span>
                <span>
                  Pick a tone — Friendly, Direct, or Formal — and who you're
                  writing to.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  3
                </span>
                <span>
                  Send as you, edit first, or regenerate. Only you see the
                  draft.
                </span>
              </li>
            </ol>
          </div>
        </div>

        <div className="md:col-span-7">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="overflow-hidden rounded-2xl border border-hairline bg-card"
            style={{ boxShadow: "var(--shadow-lift)" }}
          >
            <div className="flex h-[560px] flex-col md:h-[600px]">
              {/* Slack-like channel header */}
              <div className="flex items-center justify-between border-b border-hairline bg-background px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[15px] font-bold text-foreground/80">
                    #
                  </span>
                  <span className="font-display text-[14.5px] font-semibold text-foreground">
                    general
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">3 members</div>
              </div>

              {/* Messages */}
              <div className="flex flex-1 flex-col justify-end gap-4 overflow-hidden bg-background px-4 py-4 md:px-6 md:py-5">
                {/* Teammate message */}
                <SlackMessage
                  initials="J"
                  name="Jordan"
                  time="9:23 AM"
                  avatarClass="bg-[#5B47E0] text-white"
                >
                  Hey! Did you get a chance to wrap up that thing we discussed
                  last week? Needing it when you have a sec. Thanks!
                </SlackMessage>

                {/* Ephemeral "Your draft" card */}
                {showDraftCard && (
                  <EphemeralCard>
                    <div className="mb-1.5 font-display text-[13.5px] font-semibold text-foreground">
                      Your draft
                    </div>
                    <div className="mb-3 rounded-md border border-hairline bg-surface/60 px-3 py-2 font-mono text-[12.5px] text-foreground">
                      {DRAFT}
                    </div>
                    <div className="mb-2.5 text-[11.5px] text-muted-foreground">
                      <span className="italic">Only visible to you.</span> Pick
                      tone and who you're writing to.
                    </div>
                    <div className="mb-3 flex flex-wrap gap-2">
                      <FakeSelect
                        placeholder="Tone"
                        value={tonePicked ? SELECTED_TONE : undefined}
                        active={t > T.showDraftCard && t < T.pickTone}
                      />
                      <FakeSelect
                        placeholder="Relationship"
                        value={relPicked ? SELECTED_REL : undefined}
                        active={t > T.pickTone && t < T.pickRel}
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

                {/* Ephemeral "Your rewrite" card */}
                {showRewriteCard && (
                  <EphemeralCard>
                    <div className="mb-1.5 font-display text-[13.5px] font-semibold text-foreground">
                      Your rewrite —{" "}
                      <span className="font-normal text-muted-foreground">
                        {SELECTED_TONE} · {SELECTED_REL}
                      </span>
                    </div>
                    <div className="mb-3 rounded-md border border-hairline bg-surface/60 px-3 py-2 font-mono text-[12.5px] leading-relaxed text-foreground">
                      {REWRITTEN}
                    </div>
                    <div className="mb-2.5 text-[11.5px] text-muted-foreground italic">
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

                {/* Final sent message from You */}
                {showSent && (
                  <SlackMessage
                    initials="G"
                    name="Gida"
                    time="9:42 AM"
                    avatarClass="bg-primary text-primary-foreground"
                  >
                    {REWRITTEN}
                  </SlackMessage>
                )}
              </div>

              {/* Composer */}
              <div className="border-t border-hairline bg-background px-4 py-3 md:px-5 md:py-3.5">
                <div className="rounded-md border border-hairline bg-background">
                  {/* Formatting bar */}
                  <div className="flex items-center gap-3 border-b border-hairline px-3 py-1.5 text-muted-foreground/70">
                    {["B", "I", "U", "S"].map((c) => (
                      <span
                        key={c}
                        className="font-display text-[11px] font-semibold"
                      >
                        {c}
                      </span>
                    ))}
                    <span className="text-[11px]">🔗</span>
                  </div>
                  {/* Input */}
                  <div className="flex min-h-[36px] items-center gap-1.5 px-3 py-2 font-body text-[14px]">
                    {rewriting ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Dots />
                        <span className="text-[13px]">
                          SecondDraft is rewriting…
                        </span>
                      </span>
                    ) : composerDraft ? (
                      <>
                        {composerDraft.startsWith("/draft") ? (
                          <>
                            <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-primary">
                              /draft
                            </span>
                            <span className="text-foreground">
                              {composerDraft.slice(6)}
                            </span>
                          </>
                        ) : (
                          <span className="text-foreground">{composerDraft}</span>
                        )}
                        {showCaret && (
                          <span className="inline-block h-[15px] w-[1.5px] animate-pulse bg-foreground/70" />
                        )}
                      </>
                    ) : (
                      <span className="text-muted-foreground/60">
                        Message #general
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
        <span className="font-display text-[13.5px] font-bold text-foreground">
          {name}
        </span>
        <span className="text-[11px] text-muted-foreground">{time}</span>
      </div>
      <p className="font-body text-[14px] leading-snug text-foreground/85">
        {children}
      </p>
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
    <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor" className="text-muted-foreground">
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
