import { Link } from "react-router-dom";

const Nav = () => (
  <nav className="border-b border-hairline">
    <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
      <Link to="/" className="font-display text-[15px] font-semibold tracking-tight">
        <span className="text-muted-foreground">▸</span> seconddraft
      </Link>
      <div className="flex items-center gap-7 text-[13px] text-muted-foreground">
        <a href="#how-it-works" className="transition-colors hover:text-foreground">
          how it works
        </a>
        <a href="#get-started" className="transition-colors hover:text-foreground">
          add to slack →
        </a>
      </div>
    </div>
  </nav>
);

export default Nav;
