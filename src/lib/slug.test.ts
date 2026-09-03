import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it("lowercases and keeps ascii alphanumerics", () => {
    expect(slugify("Learning")).toBe("learning");
  });

  it("collapses punctuation and spaces into single dashes", () => {
    expect(slugify("Next.js")).toBe("next-js");
    expect(slugify("hello   world")).toBe("hello-world");
    expect(slugify("a/b_c")).toBe("a-b-c");
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("  ...meta...  ")).toBe("meta");
  });

  it("keeps hangul so korean tags stay readable", () => {
    expect(slugify("일상 기록")).toBe("일상-기록");
  });

  it("spells out symbols that would otherwise collide", () => {
    expect(slugify("C++")).toBe("c-plus-plus");
    expect(slugify("C#")).toBe("c-sharp");
    expect(slugify("C")).toBe("c");
    expect(slugify("R&D")).toBe("r-and-d");
  });

  it("falls back when nothing routable remains", () => {
    expect(slugify("")).toBe("untagged");
    expect(slugify("///")).toBe("untagged");
  });
});
