import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { IProject } from '@/types'

interface ProjectCardProps {
  project: IProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  const categoryPath =
    project.category === 'construction' ? 'thi-cong-xay-dung' : 'thiet-ke-kien-truc'

  return (
    <Link href={`/${categoryPath}/${project.slug}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden rounded-lg border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <div className="relative w-full pt-[66.66%]">
          {/* Aspect ratio 3:2 */}
          <Image
            src={project.featured_image || '/placeholder.svg'}
            alt={project.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="absolute top-0 left-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute top-3 right-3">
            <span className="inline-block rounded-md bg-gray-900/80 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
              {project.subcategory}
            </span>
          </div>
        </div>
        <CardContent className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 text-xl font-bold leading-tight text-gray-900 transition-colors duration-300 group-hover:text-primary">
            {project.title}
          </h3>
          <p className="flex-1 text-base text-gray-600 line-clamp-3">{project.description}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
