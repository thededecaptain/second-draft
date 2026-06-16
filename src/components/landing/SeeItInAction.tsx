import { useEffect, useRef, useState } from "react";

const DRAFT = "hey can u fix the bug asap its blocking everyone";
const REWRITTEN =
  "The bug is blocking the team — can you prioritize a fix today? Thanks.";
const TONES = ["Friendly", "Assertive", "Formal"] as const;
const SELECTED_TONE = "Assertive";

// Timeline (ms from loop start)
const T = {
  startTyping: 600,
  perChar: 28,
  get draftDone() {
    return this.startTyping + DRAFT.length * this.perChar;
  },
  get showCommand() {
    return this.draftDone + 400;
  },
  get showTones() {
    return this.showCommand + 500;
  },
  get pickTone() {
    return this.showTones + 700;
  },
  get rewriting() {
    return this.pickTone + 450;
  },
  get reply() {
    return this.rewriting + 1100;
  },
  get sent() {
    return this.reply + 900;
  },
  get loop() {
    return this.sent + 2200;
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

  const typedCount = Math.max(
    0,
    Math.min(DRAFT.length, Math.floor((t - T.startTyping) / T.perChar))
  );
  const typedText = DRAFT.slice(0, typedCount);
  const showCaret = t > T.startTyping && t < T.showCommand;
  const showCommand = t > T.showCommand;
  const showTones = t > T.showTones;
  const tonePicked = t > T.pickTone;
  const rewriting = t > T.rewriting && t < T.reply;
  const showReply = t > T.reply;
  const showSent = t > T.sent;

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
              SecondDraft helps you find the right tone for every message.
              One shortcut in Slack, and your rough draft becomes clear,
              confident, and precisely on point.
            </p>
            <ol className="space-y-2.5">
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  1
                </span>
                <span>
                  Type your rough message in any channel — exactly how it sounds in your head.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  2
                </span>
                <span>
                  Run{" "}
                  <span className="font-mono text-foreground">/draft</span> and
                  pick the tone you need — Friendly, Assertive, or Formal.
                </span>
              </li>
              <li className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  3
                </span>
                <span>
                  SecondDraft rewrites it in seconds. Send it as yourself when you're ready.
                </span>
              </li>
            </ol>
          </div>
        </div>

        <div className="md:col-span-7">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-lift"
            style={{ boxShadow: "var(--shadow-lift)" }}
          >
            {/* Slack-like layout */}
            <div className="flex h-[420px] flex-col md:h-[480px]">
              {/* Slack header */}
              <div className="flex items-center justify-between border-b border-hairline bg-background px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-display text-[15px] font-bold text-foreground">
                    #
                  </span>
                  <div>
                    <div className="font-display text-[14.5px] font-semibold leading-tight text-foreground">
                      team-updates
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Daily standups, blockers, and wins
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[9px] font-semibold text-primary">
                    3
                  </span>
                  <span>members</span>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex flex-1 overflow-hidden">
                {/* Left sidebar — stylized Slack channels */}
                <div className="hidden w-16 shrink-0 flex-col items-center gap-3 border-r border-hairline bg-surface/60 py-3 md:flex">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                    A
                  </div>
                  <div className="h-px w-8 bg-hairline" />
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground/10 text-[9px] font-semibold text-foreground/70">
                    #g
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-[9px] font-semibold text-primary-foreground">
                    #t
                  </div>
                  <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground/10 text-[9px] font-semibold text-foreground/70">
                    #d
                  </div>
                </div>

                {/* Message list */}
                <div className="flex flex-1 flex-col justify-end gap-5 bg-background px-5 py-5 md:px-6 md:py-6">
                  {/* Teammate message */}
                  <Message
                    initials="JM"
                    name="Jordan"
                    time="10:42 AM"
                    avatarClass="bg-foreground/10 text-foreground/70"
                  >
                    Any update on the checkout bug? It's hitting prod users.
                  </Message>

                  {/* User's rewritten message (appears after /draft) */}
                  <div
                    className={`flex items-start gap-3 transition-all duration-500 ${
                      showReply
                        ? "translate-y-0 opacity-100"
                        : "pointer-events-none absolute translate-y-2 opacity-0"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-[11px] font-semibold text-primary">
                      Y
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display text-[13.5px] font-semibold text-foreground">
                          You
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          10:43 AM
                        </span>
                        <span
                          className={`flex items-center gap-1 text-[11px] text-muted-foreground transition-opacity duration-300 ${
                            showSent ? "opacity-100" : "opacity-0"
                          }`}
                        >
                          <svg
                            width="11"
                            height="11"
                            viewBox="0 0 20 20"
                            fill="none"
                            className="text-primary"
                          >
                            <path
                              d="M4 10.5 8 14.5 16 6"
                              stroke="currentColor"
                              strokeWidth="2.4"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Sent
                        </span>
                      </div>
                      <p className="font-body text-[14px] leading-snug text-foreground/80">
                        {REWRITTEN}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Composer */}
              <div className="border-t border-hairline bg-surface/40 px-4 py-3 md:px-5 md:py-4">
                {/* Tone selector — Slack-style suggestion bar */}
                <div
                  className={`mb-2.5 flex flex-wrap items-center gap-1.5 transition-all duration-300 ${
                    showTones && !showReply
                      ? "max-h-12 opacity-100"
                      : "max-h-0 overflow-hidden opacity-0"
                  }`}
                >
                  <span className="micro-label !text-[9.5px] text-muted-foreground">
                    tone
                  </span>
                  {TONES.map((tone, i) => {
                    const selected = tonePicked && tone === SELECTED_TONE;
                    return (
                      <span
                        key={tone}
                        className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-300 ${
                          selected
                            ? "border-primary bg-primary text-primary-foreground shadow-soft"
                            : "border-hairline bg-card text-muted-foreground"
                        }`}
                        style={{
                          transitionDelay: `${i * 60}ms`,
                          transform: showTones ? "translateY(0)" : "translateY(4px)",
                          opacity: showTones ? 1 : 0,
                        }}
                      >
                        {tone}
                      </span>
                    );
                  })}
                </div>

                {/* Input box */}
                <div className="rounded-lg border border-hairline bg-background px-3.5 py-2.5 shadow-soft">
                  <div className="flex min-h-[28px] items-center gap-2 font-body text-[14px]">
                    {rewriting ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Dots />
                        <span className="text-[13px]">SecondDraft is rewriting…</span>
                      </span>
                    ) : showReply ? (
                      <span className="text-muted-foreground/60">
                        Message #team-updates
                      </span>
                    ) : (
                      <>
                        {showCommand && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 font-mono text-[12px] font-semibold text-primary">
                            /draft
                          </span>
                        )}
                        <span className="text-foreground">{typedText}</span>
                        {showCaret && (
                          <span className="inline-block h-[15px] w-[1.5px] animate-pulse bg-foreground/70" />
                        )}
                      </>
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

const Message = ({
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
  <div className="flex items-start gap-3">
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[11px] font-semibold ${avatarClass}`}
    >
      {initials}
    </div>
    <div className="flex flex-col gap-0.5">
      <div className="flex items-baseline gap-2">
        <span className="font-display text-[13.5px] font-semibold text-foreground">
          {name}
        </span>
        <span className="text-[11px] text-muted-foreground">{time}</span>
      </div>
      <p className="font-body text-[14px] leading-snug text-foreground/80">
        {children}
      </p>
    </div>
  </div>
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
