import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getAllArticles, getAllProjects, projectPath } from "@/lib/site-content";
import { getEstimatePublicConfig } from "@/lib/estimate-server";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, projects, estimate] = await Promise.all([getAllArticles(), getAllProjects(), getEstimatePublicConfig()]);

  const latestArticle = articles.reduce<string | undefined>(
    (max, a) => (!max || a.updated_at > max ? a.updated_at : max),
    undefined
  );
  const latestProject = projects.reduce<string | undefined>(
    (max, p) => (!max || p.updated_at > max ? p.updated_at : max),
    undefined
  );

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1, lastModified: latestArticle },
    { url: `${SITE_URL}/gioi-thieu`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/thiet-ke-kien-truc`, changeFrequency: "weekly", priority: 0.9, lastModified: latestProject },
    { url: `${SITE_URL}/thi-cong-xay-dung`, changeFrequency: "weekly", priority: 0.9, lastModified: latestProject },
    { url: `${SITE_URL}/bang-gia`, changeFrequency: "monthly", priority: 0.8 },
    ...(estimate?.enabled ? [{ url: `${SITE_URL}/du-toan`, changeFrequency: "monthly" as const, priority: 0.9 }] : []),
    { url: `${SITE_URL}/tin-tuc`, changeFrequency: "daily", priority: 0.8, lastModified: latestArticle },
    { url: `${SITE_URL}/lien-lac`, changeFrequency: "yearly", priority: 0.6 },
  ];

  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE_URL}/tin-tuc/${a.slug}`,
    lastModified: a.updated_at || a.published_at || undefined,
    changeFrequency: "monthly",
    priority: 0.7,
    images: a.thumbnail_url ? [a.thumbnail_url] : undefined,
  }));

  const projectPages: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${SITE_URL}${projectPath(p)}`,
    lastModified: p.updated_at,
    changeFrequency: "monthly",
    priority: 0.8,
    images: p.featured_image ? [p.featured_image] : undefined,
  }));

  return [...staticPages, ...projectPages, ...articlePages];
}
