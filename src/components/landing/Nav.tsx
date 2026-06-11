import { Link } from "react-router-dom";

const Nav = () => (
  <nav className="sticky top-0 z-40 border-b border-hairline/70 bg-background/80 backdrop-blur-md">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <Link
        to="/"
        className="flex items-center gap-2 font-display text-[15px] font-semibold tracking-tight text-foreground"
      >
        <span className="inline-block h-2 w-2 rounded-full bg-primary shadow-glow" />
        seconddraft
      </Link>
      <div className="flex items-center gap-7 text-[13px] font-medium text-muted-foreground">
        <a href="#how-it-works" className="hidden transition-colors hover:text-foreground sm:inline">
          How it works
        </a>
        <a href="#examples" className="hidden transition-colors hover:text-foreground sm:inline">
          Examples
        </a>
        <a
          href="https://github.com/thededecaptain/second-draft/blob/main/slack-app/SETUP.md"
          className="inline-flex h-9 items-center gap-1.5 rounded-full bg-foreground px-4 text-[13px] font-semibold text-background transition-all hover:opacity-90"
        >
          Add to Slack
          <span aria-hidden>→</span>
        </a>
      </div>
    </div>
  </nav>
);

export default Nav;
