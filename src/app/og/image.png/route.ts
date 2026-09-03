import { renderOgImage } from "@/lib/og";
import { siteConfig } from "@/lib/site";

// Required for `output: export` — route handlers must be prerendered.
export const dynamic = "force-static";

export function GET() {
  return renderOgImage({
    title: siteConfig.title,
    subtitle: siteConfig.description,
  });
}
