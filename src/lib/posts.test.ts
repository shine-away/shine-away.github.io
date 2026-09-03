import { describe, expect, it } from "vitest";
import {
  assertUniqueSlugs,
  collectTags,
  parsePost,
  sortPosts,
  type PostMeta,
} from "./posts";

function post(overrides: Partial<PostMeta> & { slug: string }): PostMeta {
  return {
    file: `${overrides.slug}.mdx`,
    title: "",
    date: "",
    summary: "",
    tags: [],
    ...overrides,
  };
}

describe("parsePost", () => {
  it("reads frontmatter fields", () => {
    const raw = [
      "---",
      'title: "Hello, world"',
      'date: "2026-09-02"',
      'summary: "A summary."',
      'tags: ["meta", "nextjs"]',
      "---",
      "",
      "Body text.",
    ].join("\n");

    expect(parsePost("hello-world.mdx", raw)).toEqual({
      slug: "hello-world",
      file: "hello-world.mdx",
      title: "Hello, world",
      date: "2026-09-02",
      summary: "A summary.",
      tags: ["meta", "nextjs"],
    });
  });

  it("keeps the source filename so .md posts can be imported", () => {
    expect(parsePost("plain.md", "body").file).toBe("plain.md");
  });

  it("slugifies filenames with spaces or capitals", () => {
    const parsed = parsePost("My First Post.mdx", "body");

    expect(parsed.slug).toBe("my-first-post");
    expect(parsed.file).toBe("My First Post.mdx");
  });

  it("falls back to the filename and empty values", () => {
    expect(parsePost("untitled.md", "no frontmatter here")).toEqual({
      slug: "untitled",
      file: "untitled.md",
      title: "untitled",
      date: "",
      summary: "",
      tags: [],
    });
  });

  it("coerces non-string tag values that YAML produces", () => {
    const raw = ["---", "tags: [2026, true, meta]", "---", ""].join("\n");
    expect(parsePost("a.mdx", raw).tags).toEqual(["2026", "true", "meta"]);
  });

  it("drops empty and null tag entries", () => {
    const raw = ["---", 'tags: ["", "  ", null, "meta"]', "---", ""].join("\n");
    expect(parsePost("a.mdx", raw).tags).toEqual(["meta"]);
  });

  it("ignores a non-array tags value", () => {
    const raw = ["---", 'tags: "meta"', "---", ""].join("\n");
    expect(parsePost("a.mdx", raw).tags).toEqual([]);
  });

  it("accepts an unquoted date, which YAML parses as a Date object", () => {
    const raw = ["---", "date: 2026-09-02", "---", ""].join("\n");
    expect(parsePost("a.mdx", raw).date).toBe("2026-09-02");
  });

  it("reduces a timestamp to a UTC date-only string", () => {
    const raw = ["---", "date: 2026-09-02 13:45:00", "---", ""].join("\n");
    expect(parsePost("a.mdx", raw).date).toBe("2026-09-02");
  });

  it("keeps a quoted date string as written", () => {
    const raw = ["---", 'date: "2026-09-02"', "---", ""].join("\n");
    expect(parsePost("a.mdx", raw).date).toBe("2026-09-02");
  });

  it("ignores a date value that is neither string nor date", () => {
    const raw = ["---", "date: 2026", "---", ""].join("\n");
    expect(parsePost("a.mdx", raw).date).toBe("");
  });
});

describe("sortPosts", () => {
  it("orders newest first", () => {
    const sorted = sortPosts([
      post({ slug: "old", date: "2026-01-01" }),
      post({ slug: "new", date: "2026-09-02" }),
      post({ slug: "mid", date: "2026-05-05" }),
    ]);

    expect(sorted.map((p) => p.slug)).toEqual(["new", "mid", "old"]);
  });

  it("breaks ties by slug for stable output", () => {
    const sorted = sortPosts([
      post({ slug: "b", date: "2026-01-01" }),
      post({ slug: "a", date: "2026-01-01" }),
    ]);

    expect(sorted.map((p) => p.slug)).toEqual(["a", "b"]);
  });

  it("does not mutate the input", () => {
    const input = [
      post({ slug: "old", date: "2026-01-01" }),
      post({ slug: "new", date: "2026-09-02" }),
    ];
    sortPosts(input);
    expect(input.map((p) => p.slug)).toEqual(["old", "new"]);
  });
});

describe("assertUniqueSlugs", () => {
  it("passes for distinct slugs", () => {
    expect(() =>
      assertUniqueSlugs([post({ slug: "a" }), post({ slug: "b" })]),
    ).not.toThrow();
  });

  it("throws naming both conflicting files", () => {
    const posts = [
      post({ slug: "my-post", file: "My Post.mdx" }),
      post({ slug: "my-post", file: "my-post.mdx" }),
    ];

    expect(() => assertUniqueSlugs(posts)).toThrow();

    let message = "";
    try {
      assertUniqueSlugs(posts);
    } catch (error) {
      message = (error as Error).message;
    }

    expect(message).toContain('Duplicate post slug "my-post"');
    expect(message).toContain("My Post.mdx");
    expect(message).toContain("my-post.mdx");
  });
});

describe("collectTags", () => {
  it("counts tags and sorts by frequency", () => {
    const tags = collectTags([
      post({ slug: "a", tags: ["meta", "nextjs"] }),
      post({ slug: "b", tags: ["nextjs"] }),
    ]);

    expect(tags).toEqual([
      { tag: "nextjs", slug: "nextjs", count: 2 },
      { tag: "meta", slug: "meta", count: 1 },
    ]);
  });

  it("groups spellings that share a slug", () => {
    const tags = collectTags([
      post({ slug: "a", tags: ["Next.js"] }),
      post({ slug: "b", tags: ["next js"] }),
    ]);

    expect(tags).toEqual([{ tag: "Next.js", slug: "next-js", count: 2 }]);
  });

  it("keeps symbol-bearing tags distinct", () => {
    const tags = collectTags([post({ slug: "a", tags: ["C++", "C#", "C"] })]);

    expect(tags.map((t) => t.slug).sort()).toEqual([
      "c",
      "c-plus-plus",
      "c-sharp",
    ]);
  });

  it("returns an empty list when no post has tags", () => {
    expect(collectTags([post({ slug: "a" })])).toEqual([]);
  });
});
