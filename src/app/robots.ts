import type { MetadataRoute } from "next";
import { getPublicBaseUrl } from "@/lib/public-links";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getPublicBaseUrl();

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/app", "/login"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
