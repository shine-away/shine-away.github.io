/**
 * Formats a frontmatter date (e.g. "2026-09-02") for display.
 *
 * `new Date("2026-09-02")` is parsed as UTC midnight, so formatting without an
 * explicit time zone would shift the day depending on the build machine's zone
 * (local dev vs. UTC CI). Pinning to UTC keeps output deterministic.
 */
export function formatDate(date: string): string {
  if (!date) return "";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return date;

  return parsed.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Converts a frontmatter date to an RFC 822 string for RSS `pubDate`.
 * Returns null for missing or unparseable input so the feed can omit the field
 * instead of emitting "Invalid Date", which feed readers reject.
 */
export function toRfc822(date: string): string | null {
  if (!date) return null;

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;

  return parsed.toUTCString();
}
