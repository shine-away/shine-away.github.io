import { describe, expect, it } from "vitest";
import { formatDate, toRfc822 } from "./date";

describe("formatDate", () => {
  it("formats an ISO date", () => {
    expect(formatDate("2026-09-02")).toBe("September 2, 2026");
  });

  it("does not shift the day regardless of machine time zone", () => {
    const original = process.env.TZ;
    // A zone well behind UTC would roll the date back a day if the formatter
    // used local time instead of UTC.
    process.env.TZ = "America/Los_Angeles";
    try {
      expect(formatDate("2026-01-01")).toBe("January 1, 2026");
    } finally {
      process.env.TZ = original;
    }
  });

  it("returns an empty string for missing dates", () => {
    expect(formatDate("")).toBe("");
  });

  it("passes through unparseable values", () => {
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});

describe("toRfc822", () => {
  it("converts an ISO date to an RFC 822 string", () => {
    expect(toRfc822("2026-09-02")).toBe("Wed, 02 Sep 2026 00:00:00 GMT");
  });

  it("returns null for missing dates", () => {
    expect(toRfc822("")).toBeNull();
  });

  it("returns null instead of 'Invalid Date' for malformed input", () => {
    expect(toRfc822("2026/13/45")).toBeNull();
    expect(toRfc822("nonsense")).toBeNull();
  });
});
