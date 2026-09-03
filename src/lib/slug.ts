/**
 * URL-safe slug for tags, post filenames, and other path segments.
 *
 * Keeps ASCII alphanumerics and Hangul syllables. A few symbols that carry
 * meaning in technology names are spelled out first so that, for example,
 * "C++" and "C#" do not both collapse to "c".
 *
 * Note: slugs are the grouping key for tags, so different spellings that
 * normalize to the same slug (e.g. "Next.js" and "next js") are intentionally
 * merged and share one page.
 */
const SYMBOL_WORDS: [RegExp, string][] = [
  [/\+\+/g, "-plus-plus-"],
  [/\+/g, "-plus-"],
  [/#/g, "-sharp-"],
  [/&/g, "-and-"],
  [/@/g, "-at-"],
];

export function slugify(value: string): string {
  let working = value.toLowerCase().trim();

  for (const [pattern, replacement] of SYMBOL_WORDS) {
    working = working.replace(pattern, replacement);
  }

  const slug = working
    .replace(/[^a-z0-9가-힣]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untagged";
}
