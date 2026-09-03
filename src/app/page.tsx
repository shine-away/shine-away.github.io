import Link from "next/link";
import { getAllPosts } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { PostList } from "@/components/post-list";

const RECENT_COUNT = 5;

export default function Home() {
  const posts = getAllPosts().slice(0, RECENT_COUNT);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold">{siteConfig.title}</h1>
        <p className="text-zinc-500">{siteConfig.description}</p>
      </section>

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
