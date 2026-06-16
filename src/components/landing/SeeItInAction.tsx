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
            From rough thought to ready to send
            <span className="text-primary">.</span>
          </h2>
          <p className="max-w-md font-body text-[15.5px] leading-relaxed text-muted-foreground">
            Type the message you mean. Run <span className="font-mono text-foreground">/draft</span>,
            pick a tone, and SecondDraft hands you a version you'll actually want to send.
          </p>
        </div>

        <div className="md:col-span-7">
          <div
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
            className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-lift"
            style={{ boxShadow: "var(--shadow-lift)" }}
          >
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-hairline bg-surface/70 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              <span className="h-2.5 w-2.5 rounded-full bg-foreground/15" />
              <div className="ml-3 flex items-center gap-2 text-[12px] text-muted-foreground">
                <span className="font-mono text-foreground/70">#</span>
                <span className="font-body">team-updates</span>
              </div>
            </div>

            {/* Conversation */}
            <div className="min-h-[340px] space-y-5 px-5 py-6 md:px-7 md:py-7">
              {/* Teammate message */}
              <Message
                initials="JM"
                name="Jordan"
                time="10:42"
                avatarClass="bg-foreground/10 text-foreground/70"
              >
                Any update on the checkout bug? It's hitting prod users.
              </Message>

              {/* Rewritten reply (after /draft) */}
              <div
                className={`flex justify-end transition-all duration-500 ${
                  showReply
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                <div className="flex max-w-[78%] flex-col items-end gap-1.5">
                  <div className="rounded-2xl rounded-br-sm border border-primary/15 bg-primary/5 px-4 py-3 shadow-soft">
                    <p className="font-display text-[15px] leading-snug text-foreground">
                      {REWRITTEN}
                    </p>
                  </div>
                  <div
                    className={`flex items-center gap-1.5 pr-1 text-[11px] text-muted-foreground transition-opacity duration-300 ${
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
                    Sent · 10:43
                  </div>
                </div>
              </div>
            </div>

            {/* Composer */}
            <div className="border-t border-hairline bg-surface/40 px-4 py-3 md:px-5 md:py-4">
              <div className="rounded-xl border border-hairline bg-background px-3.5 py-3 shadow-soft">
                {/* Tone pills */}
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

                {/* Input line */}
                <div className="flex min-h-[28px] items-center gap-2 font-body text-[14px]">
                  {rewriting ? (
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Dots />
                      <span className="text-[13px]">SecondDraft is rewriting…</span>
                    </span>
                  ) : showReply ? (
                    <span className="text-muted-foreground/60">Message #team-updates</span>
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
