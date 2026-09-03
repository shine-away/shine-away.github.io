import Link from "next/link";
import { siteConfig } from "@/lib/site";
import { NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-8">
      <Link
        href="/"
        className="font-mono text-sm font-medium text-zinc-900 dark:text-zinc-100"
      >
        {siteConfig.title}
      </Link>
      <nav aria-label="Main" className="flex items-center gap-4 text-sm">
        <NavLinks />
        <ThemeToggle />
      </nav>
    </header>
  );
}
