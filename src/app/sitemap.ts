import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";
import { siteConfig } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const latest = posts[0]?.date;

  return [
    { url: `${siteConfig.url}/`, lastModified: latest },
    { url: `${siteConfig.url}/blog/`, lastModified: latest },
    ...posts.map((post) => ({
      url: `${siteConfig.url}/blog/${post.slug}/`,
      lastModified: post.date || undefined,
    })),
    ...getAllTags().map(({ slug }) => ({
      url: `${siteConfig.url}/tags/${slug}/`,
      lastModified: latest,
    })),
  ];
}
