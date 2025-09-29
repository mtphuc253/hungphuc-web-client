import type { Metadata } from 'next'
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

export const metadata: Metadata = {
  title: 'Trang chủ | Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc',
  description: 'Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc - Uy tín, chất lượng, hiệu quả trong lĩnh vực thiết kế, thi công, và giám sát xây dựng.',
  openGraph: {
    title: 'Trang chủ | Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc',
    description: 'Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc - Uy tín, chất lượng, hiệu quả trong lĩnh vực thiết kế, thi công, và giám sát xây dựng.',
    url: 'https://hungphuc.com.vn',
    images: [
      {
        url: 'https://res.cloudinary.com/dizk1uwv3/image/upload/v1758176175/Hungphuc/banner-kien-tao-khong-gian-song-xanh-hien-dai.png',
        width: 1200,
        height: 630,
        alt: 'Công ty Xây dựng Hưng Phúc',
      },
    ],
  },
}

export default async function HomePage() {
  const [
    banners, 
    partners, 
    architectureProjects, 
    constructionProjects, 
    latestArticles
  ] = await Promise.all([
    getBanners(),
    getPartners(),
    projectService.getProjects({ category: 'architecture', limit: 4 }),
    projectService.getProjects({ category: 'construction', limit: 4 }),
    articleService.getArticles({ limit: 3 }),
  ])

  return (
    <div>
      <BannerCarousel banners={banners} />
      <CompanyIntroduction />
      <FieldsOfOperation />
      <FeaturedProjects 
        architectureProjects={architectureProjects.data} 
        constructionProjects={constructionProjects.data} 
      />
      <ConstructionProcess />
      <Partners partners={partners} />
      <LatestArticles articles={latestArticles.data} />
    </div>
  )
}