import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

const components: MDXComponents = {
  a: ({ href, children, ...props }: ComponentPropsWithoutRef<"a">) => {
    const isInternal = href && (href.startsWith("/") || href.startsWith("#"));

    if (isInternal) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }

    return (
      <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  },
};

export function useMDXComponents(): MDXComponents {
  return components;
}
