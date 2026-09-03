import { ImageResponse } from "next/og";
import { siteConfig } from "./site";

export const OG_SIZE = { width: 1200, height: 630 };

interface OgImageOptions {
  /** Large headline: post title, or the site title on the default card. */
  title: string;
  /** Smaller line above the title, e.g. a formatted date. */
  eyebrow?: string;
  /** Smaller line below the title, e.g. the site description. */
  subtitle?: string;
}

/**
 * Shared card used by the /og/*.png routes.
 *
 * These are exposed as route handlers with a literal ".png" segment rather than
 * the `opengraph-image` convention: under `output: export` the convention emits
 * an extensionless file, which static hosts (including GitHub Pages) serve
 * without an image Content-Type, and OG scrapers then ignore it.
 */
export function renderOgImage({ title, eyebrow, subtitle }: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 96,
          background: "#09090b",
          color: "#fafafa",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {eyebrow ? (
            <div style={{ fontSize: 28, color: "#a1a1aa" }}>{eyebrow}</div>
          ) : null}
          <div style={{ fontSize: 64, fontWeight: 600 }}>{title}</div>
          {subtitle ? (
            <div style={{ fontSize: 32, color: "#a1a1aa" }}>{subtitle}</div>
          ) : null}
        </div>
        <div style={{ fontSize: 28, color: "#a1a1aa" }}>{siteConfig.title}</div>
      </div>
    ),
    OG_SIZE,
  );
}
