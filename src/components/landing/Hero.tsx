const Hero = () => (
  <section className="relative overflow-hidden border-b border-hairline/70">
    {/* Gradient wash */}
    <div className="pointer-events-none absolute inset-0 bg-hero-gradient" aria-hidden />
    {/* Grid hairline backdrop */}
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.35]"
      aria-hidden
      style={{
        backgroundImage:
          "linear-gradient(to right, hsl(var(--hairline)) 1px, transparent 1px)",
        backgroundSize: "80px 100%",
        maskImage:
          "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent)",
      }}
    />

    <div className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-[1.05fr_0.95fr] md:gap-14 md:py-32">
      <div className="flex flex-col">
        <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full border border-hairline bg-card/80 px-3 py-1 text-[12px] font-medium text-muted-foreground backdrop-blur">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
          New · Slack app
        </div>

        <h1 className="font-display text-[44px] font-semibold leading-[1.02] tracking-[-0.03em] text-foreground sm:text-[56px] md:text-[68px]">
          Say it the way
          <br />
          you meant to<span className="text-primary">.</span>
        </h1>

        <p className="mt-7 max-w-md text-[17px] leading-relaxed text-muted-foreground">
          SecondDraft helps you find the right tone for every message. One
          shortcut in Slack, and your rough draft becomes clear, confident, and
          precisely on point.
        </p>

        <div id="get-started" className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="https://github.com/thededecaptain/second-draft/blob/main/slack-app/SETUP.md"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-[14px] font-semibold text-primary-foreground shadow-glow transition-all hover:-translate-y-px hover:opacity-95"
          >
            Add to Slack
            <span aria-hidden>→</span>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-hairline bg-card px-5 text-[14px] font-medium text-foreground transition-colors hover:bg-surface"
          >
            See how it works
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[12.5px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-foreground/40" />
            Works in any workspace
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-foreground/40" />
            Your messages stay private
          </span>
        </div>
      </div>

      <div id="how-it-works" className="md:pl-4">
        <div className="relative">
          {/* soft accent halo */}
          <div
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-primary/10 blur-2xl"
            aria-hidden
          />

          <div className="overflow-hidden rounded-2xl border border-hairline bg-card shadow-lift">
            {/* card chrome */}
            <div className="flex items-center justify-between border-b border-hairline px-5 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
                <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/25" />
              </div>
              <div className="micro-label !text-[10px]">/draft · Slack</div>
              <div className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
                live
              </div>
            </div>

            <div className="space-y-3 p-5 md:p-6">
              {/* Slack-ish header */}
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-[12px] font-semibold text-background">
                  Y
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[13px] font-semibold text-foreground">You</span>
                  <span className="text-[11px] text-muted-foreground">12:04 PM</span>
                </div>
              </div>

              {/* Raw input */}
              <div className="rounded-xl border border-hairline bg-surface px-4 py-3">
                <div className="micro-label mb-1.5 !text-[10px]">you typed</div>
                <p className="font-body text-[14.5px] text-foreground/70">
                  can you send me the numbers
                </p>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1 text-muted-foreground">
                <div className="h-px flex-1 bg-hairline" />
                <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-primary">
                  rewritten
                </span>
                <div className="h-px flex-1 bg-hairline" />
              </div>

              {/* Rewritten */}
              <div className="relative rounded-xl border border-hairline bg-card p-4 shadow-soft">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                    Friendly
                  </span>
                  <span className="text-[11px] text-muted-foreground">· to a teammate</span>
                </div>
                <p className="font-display text-[17px] leading-snug text-foreground">
                  "Hey! Could you share those numbers when you get a chance? Thanks!"
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-1">
                <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-hairline bg-card px-3 text-[12px] font-medium text-foreground transition-colors hover:bg-surface">
                  Copy
                </button>
                <button className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-[12px] font-medium text-background transition-opacity hover:opacity-90">
                  Send as you
                </button>
                <span className="ml-auto text-[11px] text-muted-foreground">
                  ⌘↵ to send
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
