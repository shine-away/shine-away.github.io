import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { PostList } from "@/components/post-list";

export const metadata: Metadata = {
  title: "Blog",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-xl font-semibold">Blog</h1>
      <PostList posts={posts} />
    </div>
  );
}
