import { Link } from "react-router-dom";

const Nav = () => (
  <nav className="border-b border-hairline/70">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <Link to="/" className="font-display text-[16px] font-bold tracking-tight text-foreground">
        <span className="text-primary">●</span> seconddraft
      </Link>
      <div className="flex items-center gap-7 text-[13px] text-muted-foreground">
        <a href="#how-it-works" className="transition-colors hover:text-foreground">
          how it works
        </a>
        <a href="#get-started" className="transition-colors hover:text-foreground">
          try it →
        </a>
      </div>
    </div>
  </nav>
);

export default Nav;
