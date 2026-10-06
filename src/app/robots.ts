import type { MetadataRoute } from "next"
import { SITE_URL } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/privacy", "/terms"],
      // Signed-in app pages and auth endpoints have nothing to index
      disallow: ["/dashboard", "/stars", "/feed", "/pins", "/settings", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
