import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/date";
import { slugify } from "@/lib/slug";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) return {};

  const ogImage = `/og/blog/${post.slug}/image.png`;

  return {
    title: post.title,
    description: post.summary,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.summary,
      url: `/blog/${post.slug}`,
      publishedTime: post.date || undefined,
      tags: post.tags,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.summary,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // The filename (including extension) comes from the content directory, so a
  // single dynamic import covers both .md and .mdx sources.
  const { default: Post } = await import(`@content/posts/${post.file}`);

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-2">
        <time
          dateTime={post.date || undefined}
          className="font-mono text-xs text-zinc-400"
        >
          {formatDate(post.date)}
        </time>
        <h1 className="text-2xl font-semibold">{post.title}</h1>
        {post.tags.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}>
                <Link
                  href={`/tags/${slugify(tag)}`}
                  className="font-mono text-xs text-zinc-400 transition-colors hover:text-zinc-700 dark:hover:text-zinc-200"
                >
                  #{tag}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </header>

      <div className="prose prose-zinc max-w-none dark:prose-invert">
        <Post />
      </div>

      <Link
        href="/blog"
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
      >
        ← Back to blog
      </Link>
    </article>
  );
}
