import Link from "next/link";
import type { TagInfo } from "@/lib/posts";

interface TagListProps {
  tags: TagInfo[];
}

export function TagList({ tags }: TagListProps) {
  if (tags.length === 0) return null;

  return (
    <section className="flex flex-col gap-3" aria-labelledby="home-tags-heading">
      <h2 id="home-tags-heading" className="text-sm font-medium text-zinc-500">
        Tags
      </h2>
      <ul className="flex flex-wrap gap-2">
        {tags.map(({ tag, slug }) => (
          <li key={slug}>
            <Link
              href={`/tags/${slug}`}
              className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 font-mono text-xs text-zinc-600 transition-colors hover:border-zinc-400 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-100"
            >
              #{tag}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
