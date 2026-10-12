import Link from "next/link";
import { collectTags, getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { PostList } from "@/components/post-list";
import { TagList } from "@/components/tag-list";

const RECENT_COUNT = 5;

export default function Home() {
  const allPosts = getAllPosts();
  const posts = allPosts.slice(0, RECENT_COUNT);
  const tags = collectTags(allPosts);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">{siteConfig.title}</h1>
        <p className="text-zinc-500">{siteConfig.description}</p>
      </section>

      <TagList tags={tags} />

      <section className="flex flex-col gap-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-medium text-zinc-500">Recent posts</h2>
          <Link
            href="/blog"
            className="text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            All posts →
          </Link>
        </div>
        <PostList posts={posts} headingLevel={3} />
      </section>
    </div>
  );
}
