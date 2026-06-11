const samples = [
  {
    tone: "friendly",
    before: "send the report by EOD",
    after: "Hey! Could you get the report over by end of day? Appreciate it.",
  },
  {
    tone: "direct",
    before: "i think maybe we should ship it",
    after: "We should ship it. The data backs it up.",
  },
  {
    tone: "formal",
    before: "the thing is broken and i dont know why",
    after: "We have a production issue. Investigating root cause now.",
  },
];

const BeforeAfter = () => (
  <section className="border-b border-hairline">
    <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="micro-label mb-12 text-muted-foreground">002 / Before — After</div>
      <div className="grid grid-cols-1 gap-px bg-hairline md:grid-cols-3">
        {samples.map((s) => (
          <div key={s.tone} className="bg-background p-6 md:p-8">
            <div className="micro-label mb-6 text-foreground">{s.tone}</div>
            <p className="text-[15px] text-muted-foreground line-through decoration-muted-foreground/40">
              {s.before}
            </p>
            <div className="my-4 text-muted-foreground">↓</div>
            <p className="font-display text-[17px] leading-snug text-foreground">{s.after}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BeforeAfter;
