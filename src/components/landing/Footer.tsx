import { GITHUB_URL, SELF_HOST_URL } from "@/lib/links";

const Footer = () => (
  <footer>
    <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-8">
      <div className="font-display text-[13px] font-medium">
        <span className="text-muted-foreground">▸</span> seconddraft
      </div>
      <div className="flex items-center gap-6 text-[12px] text-muted-foreground">
        <span>© {new Date().getFullYear()}</span>
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
          github
        </a>
      </div>
    </div>
  </footer>
);

export default Footer;
