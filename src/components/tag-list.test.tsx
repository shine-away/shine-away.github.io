import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TagList } from "./tag-list";

const tags = [
  { tag: "nextjs", slug: "nextjs", count: 3 },
  { tag: "learning", slug: "learning", count: 1 },
];

describe("TagList", () => {
  it("renders label-only pill links in the provided order", () => {
    const html = renderToStaticMarkup(<TagList tags={tags} />);
    const text = html.replace(/<[^>]+>/g, "");

    expect(text).toBe("Tags#nextjs#learning");
    expect(html).toContain('href="/tags/nextjs"');
    expect(html).toContain('href="/tags/learning"');
    expect(html.indexOf("#nextjs")).toBeLessThan(html.indexOf("#learning"));
    expect(html).toContain("rounded-full");
    expect(html).toContain("border-zinc-200");
    expect(html).toContain("bg-zinc-50");
    expect(html).toContain("dark:bg-zinc-900");
    expect(html).toContain("focus-visible:outline-2");
  });

  it("wraps the list and hides the section when there are no tags", () => {
    const html = renderToStaticMarkup(<TagList tags={tags} />);

    expect(html).toContain("flex-wrap");
    expect(renderToStaticMarkup(<TagList tags={[]} />)).toBe("");
  });
});
