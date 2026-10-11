import type { Metadata } from 'next'
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, getSiteSettings, pageMetadata } from "@/lib/seo"
import { getBanners } from "@/services/bannerService"
import { getPartners } from "@/services/partnersService"
import { projectService } from "@/services/projectService"
import { articleService } from "@/services/articleService"
import { BannerCarousel } from "./components/banner-carousel"
import { ConstructionProcess } from "./components/construction-process"
import { FieldsOfOperation } from "./components/fields-of-operation"
import { Partners } from "./components/partners"
import { FeaturedProjects } from "./components/featured-projects"
import { LatestArticles } from "./components/latest-articles"
import { CompanyIntroduction } from "./gioi-thieu/components/company-introduction"
import { EstimateSection } from "@/components/estimate/estimate-section"
import { getEstimatePublicConfig } from "@/lib/estimate-server"

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSiteSettings()
  return pageMetadata({
    title: s.seo_title || "Hưng Phúc – Thiết kế kiến trúc & Thi công xây dựng trọn gói tại TP.HCM",
    absoluteTitle: true,
    description: s.seo_description || DEFAULT_DESCRIPTION,
    keywords: s.seo_keywords ? s.seo_keywords.split(",").map((k) => k.trim()).filter(Boolean) : [
      "công ty xây dựng",
      "thiết kế kiến trúc",
      "thi công xây dựng",
      "xây nhà trọn gói",
      "thiết kế biệt thự",
      "Hưng Phúc",
    ],
    path: "/",
    image: s.og_image || DEFAULT_OG_IMAGE,
  })
}

export default async function HomePage() {
  const [
    banners, 
    partners, 
    architectureProjects, 
    constructionProjects, 
    latestArticles,
    estimateConfig,
  ] = await Promise.all([
    getBanners().catch(() => []),
    getPartners(),
    projectService.getProjects({ category: 'architecture', limit: 4 }).catch(() => ({ data: [] })),
    projectService.getProjects({ category: 'construction', limit: 4 }).catch(() => ({ data: [] })),
    articleService.getArticles({ limit: 3 }).catch(() => ({ data: [] })),
    getEstimatePublicConfig(),
  ])

  return (
    <main>
      <h1 className="sr-only">
        Hưng Phúc – Công ty TNHH Tư vấn Đầu tư Xây dựng: thiết kế kiến trúc, thi công xây dựng nhà phố, biệt thự trọn gói
      </h1>
      <BannerCarousel banners={banners} />
      {estimateConfig?.enabled && <EstimateSection config={estimateConfig} />}
      <CompanyIntroduction />
      <FieldsOfOperation />
      <FeaturedProjects 
        architectureProjects={architectureProjects.data} 
        constructionProjects={constructionProjects.data} 
      />
      <ConstructionProcess />
      <Partners partners={partners} />
      <LatestArticles articles={latestArticles.data} />
    </main>
  )
}