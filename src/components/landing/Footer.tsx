import { GITHUB_URL, SELF_HOST_URL } from "@/lib/links";

const Footer = () => (
  <footer className="border-t border-hairline/70">
    <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-10">
      <div className="flex items-center gap-2 font-display text-[14px] font-semibold text-foreground">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary" />
        seconddraft
      </div>
      <div className="flex items-center gap-6 text-[12px] text-muted-foreground">
        <span>© {new Date().getFullYear()} SecondDraft</span>
        <a
          href={SELF_HOST_URL}
          className="transition-colors hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          self-host
        </a>
        <a
          href={GITHUB_URL}
          className="transition-colors hover:text-foreground"
          target="_blank"
          rel="noreferrer"
        >
          GitHub
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
