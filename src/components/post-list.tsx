import Link from "next/link";
import type { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/date";

interface PostListProps {
  posts: PostMeta[];
  /**
   * Heading level for post titles. Use 3 when the list sits under a section
   * heading (e.g. "Recent posts") so the document outline stays ordered.
   */
  headingLevel?: 2 | 3;
}

export function PostList({ posts, headingLevel = 2 }: PostListProps) {
  if (posts.length === 0) {
    return <p className="text-sm text-zinc-500">No posts yet.</p>;
  }

  const Heading = headingLevel === 3 ? "h3" : "h2";

  return (
    <ul className="flex flex-col gap-8">
      {posts.map((post) => (
        <li key={post.slug}>
          <article className="flex flex-col gap-1">
            <time
              dateTime={post.date || undefined}
              className="font-mono text-xs text-zinc-400"
            >
              {formatDate(post.date)}
            </time>
            <Heading className="text-base font-medium">
              <Link
                href={`/blog/${post.slug}`}
                className="text-zinc-900 transition-colors hover:text-zinc-500 dark:text-zinc-100 dark:hover:text-zinc-400"
              >
                {post.title}
              </Link>
            </Heading>
            {post.summary && (
              <p className="text-sm text-zinc-500">{post.summary}</p>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
