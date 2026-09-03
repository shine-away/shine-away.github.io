import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { slugify } from "./slug";

const POSTS_DIR = path.join(process.cwd(), "content", "posts");

export interface PostMeta {
  /** URL segment; slugified so filenames with spaces or capitals stay routable. */
  slug: string;
  /** Source filename including extension, used to import the MDX module. */
  file: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
}

export interface TagInfo {
  /** Original tag as written in frontmatter, used for display. */
  tag: string;
  /** URL-safe segment used in /tags/[tag]. */
  slug: string;
  count: number;
}

interface Frontmatter {
  title?: unknown;
  date?: unknown;
  summary?: unknown;
  tags?: unknown;
}

/**
 * YAML happily produces numbers, booleans, and nulls (e.g. `tags: [2026]`), so
 * coerce every entry to a trimmed string before it reaches slugify.
 */
function normalizeTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((tag) => tag !== null && tag !== undefined)
    .map((tag) => String(tag).trim())
    .filter((tag) => tag.length > 0);
}

/**
 * Dates arrive either as strings ("2026-09-02") or, when written without
 * quotes, as Date objects because YAML parses timestamps eagerly. Both are
 * accepted and reduced to a UTC date-only string, which matches how formatDate
 * renders and keeps string sorting correct.
 */
function normalizeDate(value: unknown): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? ""
      : value.toISOString().slice(0, 10);
  }

  return typeof value === "string" ? value : "";
}

/** Maps a content file and its raw text to post metadata. Pure. */
export function parsePost(fileName: string, raw: string): PostMeta {
  const data = matter(raw).data as Frontmatter;
  const base = fileName.replace(/\.mdx?$/, "");

  return {
    slug: slugify(base),
    file: fileName,
    title: typeof data.title === "string" ? data.title : base,
    date: normalizeDate(data.date),
    summary: typeof data.summary === "string" ? data.summary : "",
    tags: normalizeTags(data.tags),
  };
}

/** Newest first; ties broken by slug so ordering is stable. Pure. */
export function sortPosts(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return a.slug.localeCompare(b.slug);
  });
}

/**
 * Two files can normalize to the same URL (e.g. "My Post.mdx" and
 * "my-post.mdx"), which would silently drop one page. Fail loudly instead. Pure.
 */
export function assertUniqueSlugs(posts: PostMeta[]): void {
  const seen = new Map<string, string>();

  for (const post of posts) {
    const existing = seen.get(post.slug);
    if (existing) {
      throw new Error(
        `Duplicate post slug "${post.slug}" from "${existing}" and "${post.file}". ` +
          `Rename one of the files in content/posts.`,
      );
    }
    seen.set(post.slug, post.file);
  }
}

/** Aggregates tags by URL slug, keeping the first spelling for display. Pure. */
export function collectTags(posts: PostMeta[]): TagInfo[] {
  const bySlug = new Map<string, TagInfo>();

  for (const post of posts) {
    for (const tag of post.tags) {
      const slug = slugify(tag);
      const existing = bySlug.get(slug);

      if (existing) {
        existing.count += 1;
      } else {
        bySlug.set(slug, { tag, slug, count: 1 });
      }
    }
  }

  return Array.from(bySlug.values()).sort(
    (a, b) => b.count - a.count || a.tag.localeCompare(b.tag),
  );
}

function readPosts(): PostMeta[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const posts = fs
    .readdirSync(POSTS_DIR)
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) =>
      parsePost(file, fs.readFileSync(path.join(POSTS_DIR, file), "utf-8")),
    );

  assertUniqueSlugs(posts);

  return sortPosts(posts);
}

// Content never changes within a production build, so read the directory once.
// In dev the cache is skipped so edits to MDX files show up immediately.
let cached: PostMeta[] | null = null;

export function getAllPosts(): PostMeta[] {
  if (process.env.NODE_ENV !== "production") return readPosts();
  cached ??= readPosts();
  return cached;
}

export function getPostSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}

export function getPostBySlug(slug: string): PostMeta | null {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
}

export function getAllTags(): TagInfo[] {
  return collectTags(getAllPosts());
}

export function getTagBySlug(slug: string): TagInfo | null {
  return getAllTags().find((tag) => tag.slug === slug) ?? null;
}

export function getPostsByTagSlug(slug: string): PostMeta[] {
  return getAllPosts().filter((post) =>
    post.tags.some((tag) => slugify(tag) === slug),
  );
}
