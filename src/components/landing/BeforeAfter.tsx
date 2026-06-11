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

const steps = [
  {
    num: "01",
    title: "Write it rough",
    body: "Type your message exactly as it comes to mind — half-formed, rushed, or already close.",
  },
  {
    num: "02",
    title: "Pick your tone",
    body: "Hit the shortcut in Slack and choose how you want to sound: friendly, direct, or formal.",
  },
  {
    num: "03",
    title: "Send the right version",
    body: "Replace your draft with a message that lands precisely the way you intended.",
  },
];

const BeforeAfter = () => (
  <section id="examples" className="border-b border-hairline/70 bg-surface/40">
    <div className="mx-auto max-w-6xl px-6 py-24 md:py-32">
      <div className="mb-3 micro-label">How it works</div>
      <h2 className="mb-16 max-w-2xl font-display text-3xl font-semibold tracking-tight text-foreground md:text-[40px] md:leading-[1.1]">
        Three steps to saying it right<span className="text-primary">.</span>
      </h2>

      <div className="mb-20 grid grid-cols-1 gap-10 md:grid-cols-3">
        {steps.map((s) => (
          <div key={s.num}>
            <div className="mb-3 font-display text-[13px] font-semibold tracking-wide text-primary">
              {s.num}
            </div>
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground">
              {s.title}
            </h3>
            <p className="font-body text-[15px] leading-relaxed text-muted-foreground">
              {s.body}
            </p>
          </div>
        ))}
      </div>

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
