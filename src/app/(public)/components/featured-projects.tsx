import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionTitle } from '@/components/ui/section-title'
import { ProjectCard } from './project-card'
import { IProject } from '@/types'
import { ArrowRight } from 'lucide-react'

interface FeaturedProjectsProps {
  architectureProjects: IProject[]
  constructionProjects: IProject[]
}

export function FeaturedProjects({ architectureProjects, constructionProjects }: FeaturedProjectsProps) {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionTitle>Dự án nổi bật</SectionTitle>

        {/* Architectural Design Projects */}
        {architectureProjects.length > 0 && (
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Thiết kế Kiến trúc</h3>
              <Button asChild variant="outline" className="group">
                <Link href="/thiet-ke-kien-truc">
                  Xem tất cả <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {architectureProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}

        {/* Construction Projects */}
        {constructionProjects.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-800">Thi công Xây dựng</h3>
              <Button asChild variant="outline" className="group">
                <Link href="/thi-cong-xay-dung">
                  Xem tất cả <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {constructionProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
