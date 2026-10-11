import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { ADMIN_ROUTE_PREFIXES } from "@/lib/admin-routes";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", "/auth/", ...ADMIN_ROUTE_PREFIXES.map((p) => `${p}`), "/tin-tuc?title="];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // Cho phép các bot AI đọc nội dung public (có llms.txt hướng dẫn)
      { userAgent: ["GPTBot", "ClaudeBot", "Claude-Web", "PerplexityBot", "Google-Extended", "CCBot"], allow: "/", disallow },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
