import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    unoptimized: true,
  },
  // Pin the workspace root so a lockfile in a parent directory is not picked up.
  turbopack: {
    root: import.meta.dirname,
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
  options: {
    remarkPlugins: [["remark-gfm", {}]],
    rehypePlugins: [
      [
        "rehype-pretty-code",
        {
          theme: { dark: "github-dark", light: "github-light" },
          // Token colors are applied from --shiki-light / --shiki-dark in
          // globals.css instead of inline backgrounds.
          keepBackground: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
