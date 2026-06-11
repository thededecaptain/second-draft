const features = [
  {
    n: "003",
    title: "In Slack",
    body: "Type /draft with your message. Pick tone and audience. Rewrite in seconds — no tab switching.",
  },
  {
    n: "004",
    title: "Private",
    body: "Rewrites are ephemeral — only you see them. Message bodies are never stored or logged.",
  },
  {
    n: "005",
    title: "Send as you",
    body: "Copy and paste, or connect once for one-click send. Posts as you — your name, no APP badge.",
  },
];

const Features = () => (
  <section className="border-b border-hairline">
    <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
      <div className="grid grid-cols-1 gap-px bg-hairline md:grid-cols-3">
        {features.map((f) => (
          <div key={f.n} className="bg-background p-8 md:p-10">
            <div className="micro-label mb-8 text-muted-foreground">{f.n}</div>
            <h3 className="font-display text-2xl font-semibold tracking-tight">{f.title}</h3>
            <p className="mt-3 max-w-xs text-[15px] text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
