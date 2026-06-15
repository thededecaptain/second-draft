import { SLACK_INSTALL_URL } from "@/lib/links";

const Hero = () => (
  <section className="border-b border-hairline">
    <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-center border-hairline px-6 py-20 md:border-r md:py-32 md:pr-12">
        <div className="micro-label mb-8 text-muted-foreground">001 / Slack app</div>
        <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-[-0.03em] md:text-7xl">
          Second
          <br />
          Draft<span className="text-muted-foreground">.</span>
        </h1>
        <p className="mt-8 max-w-md text-base text-muted-foreground md:text-lg">
          Stop rewriting that message for the fifth time. Type{" "}
          <span className="font-mono text-foreground">/draft</span>, pick a tone — friendly,
          direct, or formal — and send something that lands right. Without leaving Slack.
        </p>
        <div id="get-started" className="mt-10 flex items-center gap-4">
          <a
            href={SLACK_INSTALL_URL}
            className="inline-flex h-10 items-center gap-2 bg-primary px-5 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Add to Slack
            <span>→</span>
          </a>
          <a
            href="#how-it-works"
            className="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
          >
            See how it works
          </a>
        </div>
      </div>

      <div id="how-it-works" className="flex flex-col justify-center px-6 py-20 md:py-32 md:pl-12">
        <div className="micro-label mb-4 flex items-center justify-between text-muted-foreground">
          <span>/draft in Slack</span>
          <span className="text-foreground">● live</span>
        </div>
        <pre className="overflow-x-auto border border-hairline bg-card p-5 font-mono text-[12.5px] leading-relaxed text-foreground">
{`/draft can you send me the numbers
→ tone: friendly
→ to: teammate`}
        </pre>
        <div className="mt-6 flex items-start gap-3">
          <span className="mt-1 text-muted-foreground">→</span>
          <p className="font-display text-lg leading-snug">
            "Hey! Could you share those numbers when you get a chance? Thanks!"
          </p>
        </div>
        <div className="micro-label mt-8 flex items-center gap-6 text-muted-foreground">
          <span>— copy & paste</span>
          <span>— or send as you</span>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
