
import { projectService } from '@/services/projectService'
import { formatDate } from '@/lib/utils'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ProjectCard } from '../../components/project-card'
import { SectionTitle } from '@/components/ui/section-title'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Building, Tag } from 'lucide-react'

type Props = {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { data: project } = await projectService.getProjectBySlug(params.slug)
    if (!project) {
      return {
        title: 'Dự án không tồn tại',
      }
    }
    const categoryPath = project.category === 'construction' ? 'thi-cong-xay-dung' : 'thiet-ke-kien-truc'
    return {
      title: project.meta_title || project.title,
      description: project.meta_description || project.description,
      alternates: {
        canonical: `/${categoryPath}/${project.slug}`,
      },
    }
  } catch (error) {
    console.error('[generateMetadata]', error)
    return {
      title: 'Lỗi',
      description: 'Đã có lỗi xảy ra khi tải dự án.',
    }
  }
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = params
  const { data: project } = await projectService.getProjectBySlug(slug)

  if (!project) {
    notFound()
  }

  const [relatedProjectsRes, latestProjectsRes] = await Promise.all([
    projectService.getProjects({ subcategory: project.subcategory, limit: 6 }),
    projectService.getProjects({ category: 'architecture', limit: 4 }),
  ])

  const relatedProjects = relatedProjectsRes.data.filter((p) => p.slug !== project.slug)
  const latestProjects = latestProjectsRes.data.filter((p) => p.slug !== project.slug)

  const projectDetails = [
    { icon: MapPin, label: 'Địa điểm', value: project.location },
    { icon: Calendar, label: 'Bắt đầu', value: formatDate(project.start_date) },
    { icon: Calendar, label: 'Hoàn thành', value: formatDate(project.end_date) },
    {
      icon: Building,
      label: 'Hạng mục',
      value: project.category === 'construction' ? 'Thi công xây dựng' : 'Thiết kế kiến trúc',
      isBadge: true,
    },
    { icon: Tag, label: 'Loại hình', value: project.subcategory, isBadge: true },
  ]

  return (
    <main className="py-12 sm:py-16 bg-gray-50/50">
      <div className="container mx-auto px-4">
        <header className="mb-8 text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            {project.title}
          </h1>
          <p className="text-lg text-gray-600 text-left">{project.description}</p>
        </header>

        {project.featured_image && (
          <div className="mb-12 rounded-lg overflow-hidden shadow-2xl aspect-[16/7] relative">
            <Image
              src={project.featured_image}
              alt={project.title}
              fill
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            <article>
              {/* Project Details */}
              <div className="w-full max-w-6xl mx-auto py-4">
                <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="border-b border-border bg-muted/30 px-8 py-6">
                    <h2 className="text-2xl font-semibold text-foreground text-balance">Thông tin dự án</h2>
                    <p className="text-sm text-muted-foreground mt-1">Chi tiết thông tin cơ bản của dự án xây dựng</p>
                  </div>

                  {/* Content Grid */}
                  <div className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                      {projectDetails.map((detail, index) => (
                        <div
                          key={index}
                          className="group flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/20 transition-colors duration-200"
                        >
                          {/* Icon */}
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-10 h-10 rounded-lg bg-primary/5 border border-border/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-200">
                              <detail.icon className="w-5 h-5 text-primary/70" />
                            </div>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-muted-foreground mb-1">{detail.label}</p>
                            {detail.isBadge ? (
                              <Badge
                                variant="secondary"
                                className="font-medium text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                              >
                                {detail.value}
                              </Badge>
                            ) : (
                              <p className="text-base font-semibold text-foreground leading-relaxed text-pretty">
                                {detail.value}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Image Gallery */}
              <div className="space-y-12">
                {project.images?.map((image, index) => (
                  <div key={image.id} className="space-y-4">
                    <div className="rounded-lg overflow-hidden shadow-lg aspect-video relative">
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || `Hình ảnh ${index + 1} của dự án`}
                        fill
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {image.caption && (
                      <div
                        className="prose prose-lg max-w-none bg-white p-4 rounded-md shadow-sm border"
                        dangerouslySetInnerHTML={{ __html: image.caption }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3">
            <div className="sticky top-36 space-y-4">
              {relatedProjects.length > 0 && (
                <div className='-mt-9'>
                  <SectionTitle>Dự án liên quan</SectionTitle>
                  <div className="mt-8 space-y-6">
                    {relatedProjects.slice(0, 5).map((related) => {
                      const categoryPath = related.category === 'construction' ? 'thi-cong-xay-dung' : 'thiet-ke-kien-truc'
                      return (
                        <Link
                          key={related.slug}
                          href={`/${categoryPath}/${related.slug}`}
                          className="flex items-center gap-4 group p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="w-24 h-20 flex-shrink-0 relative rounded-md overflow-hidden">
                            <Image
                              src={related.featured_image || '/placeholder.svg'}
                              alt={related.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <h4 className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-3">
                            {related.title}
                          </h4>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Latest Projects */}
        {latestProjects.length > 0 && (
          <div className="mt-16 pt-12 border-t">
            <SectionTitle>Dự án mới nhất</SectionTitle>
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestProjects.slice(0, 3).map((latest) => (
                <ProjectCard key={latest.slug} project={latest} />
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
