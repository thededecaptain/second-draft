const Hero = () => (
  <section className="border-b border-hairline/70">
    <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-2 md:gap-12 md:py-32">
      <div className="flex flex-col">
        <div className="micro-label mb-8 text-muted-foreground">001 / Slack app</div>
        <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] text-foreground md:text-[68px]">
          Say it right
          <br />
          the first time<span className="text-primary">.</span>
        </h1>
        <p className="mt-8 max-w-md text-[17px] leading-relaxed text-muted-foreground">
          SecondDraft rewrites your Slack messages to match your tone and relationship —
          so you always come across the way you mean to.
        </p>
        <div id="get-started" className="mt-10 flex flex-wrap items-center gap-3">
          <a
            href="https://github.com/thededecaptain/second-draft/blob/main/slack-app/SETUP.md"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-[14px] font-semibold text-primary-foreground shadow-soft transition-all hover:opacity-90 hover:shadow-md"
          >
            Try it in Slack
            <span aria-hidden>→</span>
          </a>
          <a
            href="#how-it-works"
            className="inline-flex h-11 items-center gap-2 rounded-md border border-hairline bg-card px-5 text-[14px] font-medium text-foreground transition-colors hover:bg-muted"
          >
            See how it works
          </a>
        </div>
      </div>

      <div id="how-it-works" className="md:pl-8">
        <div className="rounded-2xl border border-hairline bg-card p-5 shadow-soft md:p-6">
          <div className="micro-label mb-4 flex items-center justify-between text-muted-foreground">
            <span>/draft in Slack</span>
            <span className="inline-flex items-center gap-1.5 text-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> live
            </span>
          </div>

          {/* Raw input bubble */}
          <div className="rounded-xl border border-hairline bg-muted/60 px-4 py-3">
            <div className="micro-label mb-1.5 text-muted-foreground">you typed</div>
            <p className="font-body text-[15px] text-foreground/80">
              can you send me the numbers
            </p>
          </div>

          <div className="my-3 flex items-center gap-2 text-muted-foreground">
            <div className="h-px flex-1 bg-hairline" />
            <span className="text-[11px] uppercase tracking-[0.18em]">rewritten</span>
            <div className="h-px flex-1 bg-hairline" />
          </div>

          {/* Rewritten bubble */}
          <div className="rounded-xl border border-hairline bg-background px-4 py-4 shadow-soft">
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

          <div className="mt-5 flex items-center gap-5 text-[12px] text-muted-foreground">
            <span>— copy & paste</span>
            <span>— or send as you</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
