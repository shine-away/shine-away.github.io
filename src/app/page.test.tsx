import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { collectTags, getAllPosts } from "@/lib/posts";
import Home from "./page";

describe("Home", () => {
  it("places every collected tag between the introduction and recent posts", () => {
    const html = renderToStaticMarkup(<Home />);
    const introIndex = html.indexOf("<h1");
    const tagsIndex = html.indexOf(">Tags</h2>");
    const recentPostsIndex = html.indexOf(">Recent posts</h2>");

    expect(introIndex).toBeGreaterThanOrEqual(0);
    expect(tagsIndex).toBeGreaterThan(introIndex);
    expect(recentPostsIndex).toBeGreaterThan(tagsIndex);

    let previousTagIndex = tagsIndex;
    for (const { tag, slug } of collectTags(getAllPosts())) {
      const linkIndex = html.indexOf(`href="/tags/${slug}"`);

      expect(linkIndex).toBeGreaterThan(previousTagIndex);
      expect(html).toContain(`#${tag}</a>`);
      previousTagIndex = linkIndex;
    }
  });
});
