import { SLACK_INSTALL_URL } from "@/lib/links";
import SeeItInAction from "./SeeItInAction";

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
            href={SLACK_INSTALL_URL}
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
          <div
            className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-primary/10 blur-2xl"
            aria-hidden
          />
          <SeeItInAction variant="hero" />
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
