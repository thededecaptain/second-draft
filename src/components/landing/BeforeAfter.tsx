const samples = [
  {
    tone: "Friendly",
    context: "to a teammate",
    before: "send the report by EOD",
    after: "Hey! Could you get the report over by end of day? Appreciate it.",
  },
  {
    tone: "Assertive",
    context: "to your team",
    before: "i think maybe we should ship it",
    after: "We should ship it. The data backs it up.",
  },
  {
    tone: "Formal",
    context: "to a client",
    before: "the thing is broken and i dont know why",
    after:
      "We're aware of a production issue and are actively investigating the root cause.",
  },
];

const BeforeAfter = () => (
  <section id="examples" className="border-b border-hairline/70 bg-surface/40">
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="mb-3 micro-label">How it works</div>
      <h2 className="mb-14 max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground md:text-[40px] md:leading-[1.1]">
        Your idea. Their understanding<span className="text-primary">.</span>
      </h2>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-hairline bg-hairline md:grid-cols-3">
        {samples.map((s) => (
          <div key={s.tone} className="flex flex-col gap-4 bg-background p-6 md:p-7">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-primary">
                {s.tone}
              </span>
              <span className="text-[12px] text-muted-foreground">· {s.context}</span>
            </div>

            <div className="rounded-lg border border-hairline bg-surface px-4 py-3">
              <div className="micro-label mb-1 !text-[10px]">before</div>
              <p className="font-body text-[14px] text-muted-foreground line-through decoration-muted-foreground/30">
                {s.before}
              </p>
            </div>

            <div className="rounded-lg border border-hairline bg-card px-5 py-5 shadow-soft">
              <div className="micro-label mb-2 !text-[10px] !text-primary">after</div>
              <p className="font-display text-[16.5px] leading-snug text-foreground">
                {s.after}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BeforeAfter;
