import { cache } from "react";
import { articleService } from "@/services/articleService";
import { formatDate } from "@/lib/utils";
import { Calendar, ChevronRight, Clock, FolderOpen, User } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "../components/article-card";
import { SectionTitle } from "@/components/ui/section-title";
import { JsonLd } from "@/components/seo/json-ld";
import {
  absoluteUrl,
  demoteH1,
  externalCanonical,
  breadcrumbJsonLd,
  DEFAULT_OG_IMAGE,
  ORG_REF,
  pageMetadata,
  stripHtml,
  truncate,
  WEBSITE_REF,
} from "@/lib/seo";
import type { ArticleDetail } from "@/types";

type Props = {
  params: Promise<{ slug: string }>;
};

// Dùng chung kết quả giữa generateMetadata và page trong cùng 1 request
const getArticle = cache(async (slug: string): Promise<ArticleDetail | null> => {
  try {
    const { data } = await articleService.getArticleBySlug(slug);
    return data ?? null;
  } catch {
    return null; // 404 hoặc lỗi mạng -> trang 404
  }
});

const keywordList = (k: unknown): string[] =>
  Array.isArray(k) ? (k as string[]) : typeof k === "string" && k ? k.split(",").map((s) => s.trim()) : [];

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  const article = await getArticle(slug);
  if (!article) {
    return { title: "Không tìm thấy bài viết", robots: { index: false, follow: true } };
  }
  const meta = pageMetadata({
    title: article.title,
    description: article.description || truncate(stripHtml(article.content), 160),
    path: `/tin-tuc/${article.slug}`,
    image: article.thumbnail_url,
    keywords: keywordList(article.keywords),
    type: "article",
    publishedTime: article.published_at,
    modifiedTime: article.updated_at,
    authors: [article.author_name || "Ban biên tập Hưng Phúc"],
    section: article.category,
  });
  // Bài đăng lại từ nguồn khác -> canonical trỏ về bản gốc
  const canonical = externalCanonical(article.canonical_url);
  if (canonical) meta.alternates = { canonical };
  return meta;
}

export default async function ArticleDetailPage(props: Props) {
  const { slug } = await props.params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const [relatedArticlesRes, latestArticlesRes] = await Promise.all([
    articleService.getArticles({ category: article.category, limit: 6 }).catch(() => ({ data: [] })),
    articleService.getArticles({ page: 1, limit: 4 }).catch(() => ({ data: [] })),
  ]);

  const relatedArticles = relatedArticlesRes.data.filter((a) => a.slug !== article.slug);
  const latestArticles = latestArticlesRes.data.filter((a) => a.slug !== article.slug);
  const authorName = article.author_name || "Ban biên tập Hưng Phúc";

  const plain = stripHtml(article.content);
  const words = plain ? plain.split(/\s+/).length : 0;
  const readMinutes = Math.max(1, Math.round(words / 220));
  const url = absoluteUrl(`/tin-tuc/${article.slug}`);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: truncate(article.title, 110),
    description: article.description || truncate(plain, 160),
    image: [article.thumbnail_url || DEFAULT_OG_IMAGE],
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: article.author_name
      ? { "@type": "Person", name: article.author_name, worksFor: ORG_REF }
      : { "@type": "Organization", name: authorName, parentOrganization: ORG_REF },
    publisher: ORG_REF,
    isPartOf: WEBSITE_REF,
    articleSection: article.category,
    keywords: keywordList(article.keywords).slice(0, 10).join(", ") || undefined,
    wordCount: words,
    timeRequired: `PT${readMinutes}M`,
    inLanguage: "vi-VN",
  };

  return (
    <main className="py-12 bg-white">
      <JsonLd data={articleLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Tin tức", path: "/tin-tuc" },
          { name: article.category, path: `/tin-tuc?category=${encodeURIComponent(article.category)}` },
          { name: article.title, path: `/tin-tuc/${article.slug}` },
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
              <Link href="/tin-tuc" className="hover:text-primary">
                Tin tức
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <li>
              <Link href={`/tin-tuc?category=${encodeURIComponent(article.category)}`} className="hover:text-primary">
                {article.category}
              </Link>
            </li>
          </ol>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            <article>
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">{article.title}</h1>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" aria-hidden />
                    <span>{authorName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" aria-hidden />
                    <time dateTime={article.published_at}>{formatDate(article.published_at)}</time>
                  </div>
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4" aria-hidden />
                    <span>{article.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" aria-hidden />
                    <span>{readMinutes} phút đọc</span>
                  </div>
                </div>
                {article.description && <p className="mt-5 text-lg leading-relaxed text-gray-700">{article.description}</p>}
              </header>

              {article.thumbnail_url && (
                <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={article.thumbnail_url}
                    alt={article.title}
                    width={1200}
                    height={630}
                    sizes="(max-width: 1024px) 100vw, 66vw"
                    className="w-full object-cover"
                    priority
                  />
                </div>
              )}

              <div
                className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg prose-img:mx-auto"
                dangerouslySetInnerHTML={{ __html: demoteH1(article.content) }}
              />
            </article>

            {/* Author Signature */}
            {article.author_name && (
              <div className="mt-16 pt-8 border-t text-right">
                <p className="text-xl font-semibold italic">{article.author_name}</p>
                <p className="text-sm text-gray-500">Tác giả</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3" aria-label="Bài viết liên quan">
            <div className="sticky top-32 space-y-8">
              <SectionTitle>Bài viết liên quan</SectionTitle>
              <div className="space-y-6">
                {relatedArticles.length > 0 ? (
                  relatedArticles.slice(0, 5).map((related) => (
                    <div key={related.slug} className="flex items-center gap-4 group">
                      <div className="w-24 h-24 flex-shrink-0 overflow-hidden rounded-md bg-gray-100">
                        {related.thumbnail_url && (
                          <Link href={`/tin-tuc/${related.slug}`} tabIndex={-1} aria-hidden>
                            <Image
                              src={related.thumbnail_url}
                              alt=""
                              width={96}
                              height={96}
                              className="object-cover w-full h-full"
                            />
                          </Link>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/tin-tuc/${related.slug}`}
                          className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-3"
                        >
                          {related.title}
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">Không có bài viết liên quan.</p>
                )}
              </div>
            </div>
          </aside>
        </div>

        {/* Latest Articles */}
        {latestArticles.length > 0 && (
          <section className="mt-16 pt-12 border-t" aria-label="Bài viết mới nhất">
            <SectionTitle>Bài viết mới nhất</SectionTitle>
            <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {latestArticles.slice(0, 3).map((latest) => (
                <ArticleCard key={latest.slug} article={latest} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
