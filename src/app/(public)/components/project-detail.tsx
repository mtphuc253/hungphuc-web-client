import { cache } from "react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { Building, Calendar, ChevronRight, MapPin, Tag, UserRound } from "lucide-react";
import { projectService } from "@/services/projectService";
import { formatDate } from "@/lib/utils";
import { SectionTitle } from "@/components/ui/section-title";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, breadcrumbJsonLd, ORG_REF, pageMetadata, truncate } from "@/lib/seo";
import type { IProject } from "@/types";
import { ProjectCard } from "./project-card";

type Category = "architecture" | "construction";

const CATEGORY = {
  architecture: { label: "Thiết kế kiến trúc", path: "/thiet-ke-kien-truc" },
  construction: { label: "Thi công xây dựng", path: "/thi-cong-xay-dung" },
} as const;

const getProject = cache(async (slug: string): Promise<IProject | null> => {
  try {
    const { data } = await projectService.getProjectBySlug(slug);
    return data ?? null;
  } catch {
    return null;
  }
});

export async function projectMetadata(slug: string): Promise<Metadata> {
  const project = await getProject(slug);
  if (!project) return { title: "Không tìm thấy dự án", robots: { index: false, follow: true } };
  const cat = CATEGORY[project.category] ?? CATEGORY.architecture;
  const description =
    project.meta_description ||
    truncate(project.description || `${cat.label} ${project.subcategory || ""} ${project.location ? `tại ${project.location}` : ""} do Hưng Phúc thực hiện.`, 160);
  return pageMetadata({
    title: project.meta_title || project.title,
    description,
    path: `${cat.path}/${project.slug}`,
    image: project.featured_image || project.images?.[0]?.image_url,
    keywords: [project.subcategory, cat.label, project.location, "Hưng Phúc"].filter(Boolean) as string[],
  });
}

const fmt = (d?: string | null) => (d ? formatDate(d) : null);

export async function ProjectDetail({ slug, category }: { slug: string; category: Category }) {
  const project = await getProject(slug);
  if (!project) notFound();

  // Một dự án chỉ có 1 URL chuẩn -> tránh nội dung trùng lặp giữa 2 danh mục
  if (project.category !== category) {
    permanentRedirect(`${CATEGORY[project.category].path}/${project.slug}`);
  }

  const cat = CATEGORY[project.category];

  const [relatedProjectsRes, latestProjectsRes] = await Promise.all([
    project.subcategory
      ? projectService.getProjects({ subcategory: project.subcategory, limit: 6 }).catch(() => ({ data: [] as IProject[] }))
      : Promise.resolve({ data: [] as IProject[] }),
    projectService.getProjects({ category: project.category, limit: 4 }).catch(() => ({ data: [] as IProject[] })),
  ]);

  const relatedProjects = relatedProjectsRes.data.filter((p) => p.slug !== project.slug);
  const latestProjects = latestProjectsRes.data.filter((p) => p.slug !== project.slug);

  const projectDetails = [
    { icon: MapPin, label: "Địa điểm", value: project.location },
    { icon: UserRound, label: "Chủ đầu tư", value: project.client_name },
    { icon: Calendar, label: "Khởi công", value: fmt(project.start_date) },
    { icon: Calendar, label: "Hoàn thành", value: fmt(project.end_date) },
    { icon: Building, label: "Hạng mục", value: cat.label, isBadge: true },
    { icon: Tag, label: "Loại hình", value: project.subcategory, isBadge: true },
  ].filter((d) => d.value);

  const url = absoluteUrl(`${cat.path}/${project.slug}`);
  const images = [project.featured_image, ...(project.images || []).map((i) => i.image_url)].filter(Boolean) as string[];

  const projectLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    url,
    name: project.title,
    headline: project.meta_title || project.title,
    description: project.meta_description || truncate(project.description || "", 300),
    image: images.length ? images : undefined,
    genre: cat.label,
    about: project.subcategory || undefined,
    creator: ORG_REF,
    publisher: ORG_REF,
    dateCreated: project.start_date || undefined,
    datePublished: project.created_at,
    dateModified: project.updated_at,
    locationCreated: project.location ? { "@type": "Place", name: project.location, address: project.location } : undefined,
    inLanguage: "vi-VN",
    associatedMedia: (project.images || []).map((img, i) => ({
      "@type": "ImageObject",
      contentUrl: img.image_url,
      name: img.alt_text || `${project.title} - hình ${i + 1}`,
      caption: img.caption ? truncate(img.caption.replace(/<[^>]+>/g, " "), 200) : undefined,
    })),
  };

  return (
    <main className="py-12 sm:py-16 bg-gray-50/50">
      <JsonLd data={projectLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: cat.label, path: cat.path },
          { name: project.title, path: `${cat.path}/${project.slug}` },
        ])}
      />
      <div className="container mx-auto px-4">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link href="/" className="hover:text-primary">
                Trang chủ
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <li>
              <Link href={cat.path} className="hover:text-primary">
                {cat.label}
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <li aria-current="page" className="line-clamp-1 text-gray-700">
              {project.title}
            </li>
          </ol>
        </nav>

        <header className="mb-8 text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">{project.title}</h1>
          {project.description && (
            <p className="text-lg text-gray-600 text-left whitespace-pre-line">{project.description}</p>
          )}
        </header>

        {project.featured_image && (
          <div className="mb-12 rounded-lg overflow-hidden shadow-2xl aspect-[16/7] relative">
            <Image src={project.featured_image} alt={project.title} fill sizes="100vw" className="w-full h-full object-cover" priority />
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-12">
          <div className="w-full lg:w-2/3">
            <article>
              <div className="w-full max-w-6xl mx-auto py-4">
                <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
                  <div className="border-b border-border bg-muted/30 px-8 py-6">
                    <h2 className="text-2xl font-semibold text-foreground text-balance">Thông tin dự án</h2>
                    <p className="text-sm text-muted-foreground mt-1">Chi tiết thông tin cơ bản của dự án</p>
                  </div>
                  <dl className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-3">
                    {projectDetails.map((detail) => (
                      <div
                        key={detail.label}
                        className="group flex items-start gap-4 p-4 rounded-lg border border-border/50 bg-card hover:bg-muted/20 transition-colors duration-200"
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          <div className="w-10 h-10 rounded-lg bg-primary/5 border border-border/50 flex items-center justify-center">
                            <detail.icon className="w-5 h-5 text-primary/70" aria-hidden />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <dt className="text-sm font-medium text-muted-foreground mb-1">{detail.label}</dt>
                          <dd>
                            {detail.isBadge ? (
                              <Badge variant="secondary" className="font-medium text-sm px-3 py-1 bg-primary/10 text-primary border-primary/20">
                                {detail.value}
                              </Badge>
                            ) : (
                              <span className="text-base font-semibold text-foreground leading-relaxed">{detail.value}</span>
                            )}
                          </dd>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              {project.images?.length > 0 && (
                <section className="space-y-12 mt-8" aria-label="Hình ảnh dự án">
                  <h2 className="sr-only">Hình ảnh dự án {project.title}</h2>
                  {project.images.map((image, index) => (
                    <figure key={image.id ?? index} className="space-y-4">
                      <div className="rounded-lg overflow-hidden shadow-lg aspect-video relative">
                        <Image
                          src={image.image_url}
                          alt={image.alt_text || `${project.title} - hình ${index + 1}`}
                          fill
                          sizes="(max-width: 1024px) 100vw, 66vw"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {image.caption && (
                        <figcaption
                          className="prose prose-lg max-w-none bg-white p-4 rounded-md shadow-sm border"
                          dangerouslySetInnerHTML={{ __html: image.caption }}
                        />
                      )}
                    </figure>
                  ))}
                </section>
              )}
            </article>
          </div>

          <aside className="w-full lg:w-1/3" aria-label="Dự án liên quan">
            <div className="sticky top-36 space-y-4">
              {relatedProjects.length > 0 && (
                <div className="-mt-9">
                  <SectionTitle>Dự án liên quan</SectionTitle>
                  <div className="mt-8 space-y-6">
                    {relatedProjects.slice(0, 5).map((related) => (
                      <Link
                        key={related.slug}
                        href={`${CATEGORY[related.category]?.path ?? cat.path}/${related.slug}`}
                        className="flex items-center gap-4 group p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-24 h-20 flex-shrink-0 relative rounded-md overflow-hidden bg-gray-100">
                          {related.featured_image && (
                            <Image src={related.featured_image} alt="" fill className="object-cover" sizes="96px" />
                          )}
                        </div>
                        <span className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-3">
                          {related.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {latestProjects.length > 0 && (
          <section className="mt-16 pt-12 border-t" aria-label="Dự án mới nhất">
            <SectionTitle>Dự án {cat.label.toLowerCase()} mới nhất</SectionTitle>
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestProjects.slice(0, 3).map((latest) => (
                <ProjectCard key={latest.slug} project={latest} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
