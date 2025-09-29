import type { Metadata } from 'next'
import { projectService } from '@/services/projectService'
import { ConstructionProjects } from './components/construction-projects'

export const metadata: Metadata = {
  title: 'Dự án Thi công Xây dựng | Công ty Xây dựng Hưng Phúc',
  description: 'Các công trình thi công chất lượng, đảm bảo tiến độ và an toàn lao động, minh chứng cho năng lực và uy tín của Hưng Phúc trong ngành.',
  keywords: [
    'thi công xây dựng',
    'dự án xây dựng',
    'công ty xây dựng',
    'xây dựng nhà phố',
    'xây dựng biệt thự',
    'Hưng Phúc',
  ],
  openGraph: {
    title: 'Dự án Thi công Xây dựng | Công ty Xây dựng Hưng Phúc',
    description: 'Các công trình thi công chất lượng, đảm bảo tiến độ và an toàn lao động, minh chứng cho năng lực và uy tín của Hưng Phúc trong ngành.',
    url: 'https://hungphuc.com.vn/thi-cong-xay-dung',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dizk1uwv3/image/upload/v1758531623/Hungphuc/linh-vuc-giam-sat.jpg',
        width: 1200,
        height: 630,
        alt: 'Dự án Thi công Xây dựng Hưng Phúc',
      },
    ],
  },
}

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