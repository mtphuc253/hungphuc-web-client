import type { Metadata } from 'next'
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/seo/json-ld"
import { projectService } from '@/services/projectService'
import { ConstructionProjects } from './components/construction-projects'

export const metadata: Metadata = pageMetadata({
  title: "Dự án thi công xây dựng",
  description: "Các công trình thi công xây dựng nhà phố, biệt thự, nhà xưởng trọn gói do Hưng Phúc thực hiện – đúng tiến độ, đảm bảo chất lượng và an toàn.",
  path: "/thi-cong-xay-dung",
  keywords: ["thi công xây dựng", "xây nhà trọn gói", "thi công biệt thự", "thi công nhà phố", "Hưng Phúc"],
})

async function getInitialProjects() {
  try {
    const response = await projectService.getProjects({
      page: 1,
      limit: 9,
      category: 'construction',
    });
    return { 
      initialProjects: response.data,
      initialMeta: response.meta || null
    };
  } catch (error) {
    console.error('Failed to fetch initial projects:', error);
    return { initialProjects: [], initialMeta: null };
  }
}

export default async function ConstructionProjectsPage() {
  const { initialProjects, initialMeta } = await getInitialProjects();

  return (
    <main className="min-h-screen bg-gray-50/50 py-12 sm:py-16">
      <JsonLd data={breadcrumbJsonLd([{ name: "Thi công xây dựng", path: "/thi-cong-xay-dung" }])} />
      <JsonLd
        data={itemListJsonLd(
          "Dự án thi công xây dựng – Hưng Phúc",
          initialProjects.map((p) => ({ name: p.title, path: `/thi-cong-xay-dung/${p.slug}`, image: p.featured_image }))
        )}
      />
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Dự án Thi công Xây dựng
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            Các công trình thi công chất lượng, đảm bảo tiến độ và an toàn lao động, minh chứng cho năng lực và uy
            tín của Hưng Phúc trong ngành.
          </p>
        </header>

        <ConstructionProjects 
          initialProjects={initialProjects} 
          initialMeta={initialMeta} 
        />
      </div>
    </main>
  )
}