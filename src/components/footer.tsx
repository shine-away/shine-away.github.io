import { siteConfig } from "@/lib/site";

// Rendered at build time. The site is redeployed on every content change, so
// the year stays current in practice.
const BUILD_YEAR = new Date().getUTCFullYear();

export function Footer() {
  return (
    <footer className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-8 text-sm text-zinc-400">
      <span>
        © {BUILD_YEAR} {siteConfig.author}
      </span>
      <a
        href="/rss.xml"
        className="transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
      >
        RSS
      </a>
    </footer>
  );
}
