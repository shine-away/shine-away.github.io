import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllTags, getPostsByTagSlug, getTagBySlug } from "@/lib/posts";
import { PostList } from "@/components/post-list";

export const dynamicParams = false;

export function generateStaticParams() {
  return getAllTags().map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/tags/[tag]">): Promise<Metadata> {
  const { tag } = await params;
  const info = getTagBySlug(tag);

  if (!info) return {};

  return {
    title: `#${info.tag}`,
    description: `Posts tagged “${info.tag}”.`,
    alternates: { canonical: `/tags/${info.slug}` },
  };
}

export default async function TagPage({ params }: PageProps<"/tags/[tag]">) {
  const { tag } = await params;
  const info = getTagBySlug(tag);

  if (!info) {
    notFound();
  }

  const posts = getPostsByTagSlug(info.slug);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">
        <span className="text-zinc-400">#</span>
        {info.tag}
      </h1>
      <PostList posts={posts} />
    </div>
  );
}
