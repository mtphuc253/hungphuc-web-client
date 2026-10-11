import type { Metadata } from 'next'
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/seo/json-ld"
import { projectService } from '@/services/projectService'
import { ArchitectureProjectList } from './components/architecture-project-list'

export const metadata: Metadata = pageMetadata({
  title: "Dự án thiết kế kiến trúc",
  description: "Bộ sưu tập dự án thiết kế kiến trúc nhà phố, biệt thự, công trình thương mại do Hưng Phúc thực hiện – sáng tạo, tối ưu công năng và chi phí.",
  path: "/thiet-ke-kien-truc",
  keywords: ["thiết kế kiến trúc", "thiết kế nhà phố", "thiết kế biệt thự", "mẫu nhà đẹp", "Hưng Phúc"],
})

async function getInitialProjects() {
  try {
    const response = await projectService.getProjects({
      page: 1,
      limit: 9,
      category: 'architecture',
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

export default async function ArchitectureProjectsPage() {
  const { initialProjects, initialMeta } = await getInitialProjects();

  return (
    <main className="min-h-screen bg-gray-50/50 py-12 sm:py-16">
      <JsonLd data={breadcrumbJsonLd([{ name: "Thiết kế kiến trúc", path: "/thiet-ke-kien-truc" }])} />
      <JsonLd
        data={itemListJsonLd(
          "Dự án thiết kế kiến trúc – Hưng Phúc",
          initialProjects.map((p) => ({ name: p.title, path: `/thiet-ke-kien-truc/${p.slug}`, image: p.featured_image }))
        )}
      />
      <div className="container mx-auto px-4">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Dự án Thiết kế Kiến trúc
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
            Khám phá những ý tưởng thiết kế sáng tạo, độc đáo và tối ưu không gian sống, thể hiện qua từng dự án
            kiến trúc mà Hưng Phúc đã thực hiện.
          </p>
        </header>

        <ArchitectureProjectList 
          initialProjects={initialProjects}
          initialMeta={initialMeta}
        />
      </div>
    </main>
  )
}