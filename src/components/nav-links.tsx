"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteConfig } from "@/lib/site";

/** Normalizes for comparison since `trailingSlash: true` yields "/blog/". */
function normalize(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function isActive(pathname: string, href: string): boolean {
  const current = normalize(pathname);
  const target = normalize(href);

  if (target === "/") return current === "/";
  // Mark "Blog" active on post pages too.
  return current === target || current.startsWith(`${target}/`);
}

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {siteConfig.nav.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            }
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
