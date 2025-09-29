import type { Metadata } from 'next'
import { projectService } from '@/services/projectService'
import { ArchitectureProjectList } from './components/architecture-project-list'

export const metadata: Metadata = {
  title: 'Dự án Thiết kế Kiến trúc | Công ty Xây dựng Hưng Phúc',
  description: 'Khám phá các dự án thiết kế kiến trúc sáng tạo và độc đáo do Hưng Phúc thực hiện, từ nhà phố, biệt thự đến các công trình thương mại.',
  keywords: [
    'thiết kế kiến trúc',
    'dự án kiến trúc',
    'công ty thiết kế',
    'kiến trúc nhà phố',
    'thiết kế biệt thự',
    'Hưng Phúc',
  ],
  openGraph: {
    title: 'Dự án Thiết kế Kiến trúc | Công ty Xây dựng Hưng Phúc',
    description: 'Khám phá các dự án thiết kế kiến trúc sáng tạo và độc đáo do Hưng Phúc thực hiện.',
    url: 'https://hungphuc.com.vn/thiet-ke-kien-truc',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dizk1uwv3/image/upload/v1758176175/Hungphuc/banner-kien-tao-khong-gian-song-xanh-hien-dai.png',
        width: 1200,
        height: 630,
        alt: 'Dự án Thiết kế Kiến trúc Hưng Phúc',
      },
    ],
  },
}

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