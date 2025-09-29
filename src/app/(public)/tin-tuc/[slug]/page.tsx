import { articleService } from "@/services/articleService";
import { formatDate } from "@/lib/utils";
import { Calendar, User } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArticleCard } from "../components/article-card";
import { SectionTitle } from "@/components/ui/section-title";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params;
  try {
    const { data: article } = await articleService.getArticleBySlug(slug);
    if (!article) {
      return {
        title: "Bài viết không tồn tại",
      };
    }
    return {
      title: article.title,
      description: article.description,
      keywords: article.keywords,
      alternates: {
        canonical: article.canonical_url,
      },
    };
  } catch (error) {
    console.error("[generateMetadata]", error);
    return {
      title: "Lỗi",
      description: "Đã có lỗi xảy ra khi tải bài viết.",
    };
  }
}

export default async function ArticleDetailPage(props: Props) {
  const { slug } = await props.params;
  const { data: article } = await articleService.getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const [relatedArticlesRes, latestArticlesRes] = await Promise.all([
    articleService.getArticles({ category: article.category, limit: 6 }), // Fetch 6
    articleService.getArticles({ page: 1, limit: 4 }), // Fetch 4
  ]);

  // Filter out the current article from both lists
  const relatedArticles = relatedArticlesRes.data.filter(a => a.slug !== article.slug);
  const latestArticles = latestArticlesRes.data.filter(a => a.slug !== article.slug);

  return (
    <main className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content */}
          <div className="w-full lg:w-2/3">
            <article>
              <header className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                  {article.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>{article.author_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                </div>
              </header>

              {article.thumbnail_url && (
                <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={article.thumbnail_url}
                    alt={article.title}
                    width={1200}
                    height={630}
                    className="w-full object-cover"
                    priority
                  />
                </div>
              )}

              <div
                className="prose lg:prose-xl max-w-none mx-auto"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </article>

            {/* Author Signature */}
            <div className="mt-16 pt-8 border-t text-right">
              <p className="text-xl font-semibold italic">{article.author_name}</p>
              <p className="text-sm text-gray-500">Tác giả</p>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-1/3">
            <div className="sticky top-32 space-y-8">
              <SectionTitle>Bài viết liên quan</SectionTitle>
              <div className="space-y-6">
                {relatedArticles.length > 0 ? (
                  relatedArticles.slice(0, 5).map((related) => ( // Ensure max 5 are shown
                    <div key={related.slug} className="flex items-center gap-4 group">
                      <div className="w-24 h-24 flex-shrink-0">
                        <Link href={`/tin-tuc/${related.slug}`}>
                          <Image 
                            src={related.thumbnail_url} 
                            alt={related.title} 
                            width={96} 
                            height={96} 
                            className="rounded-md object-cover w-full h-full" 
                          />
                        </Link>
                      </div>
                      <div>
                        <Link href={`/tin-tuc/${related.slug}`} className="font-semibold text-base leading-snug group-hover:text-primary transition-colors line-clamp-3">
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
        <div className="mt-16 pt-12 border-t">
          <SectionTitle>Bài viết mới nhất</SectionTitle>
          <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {latestArticles.slice(0, 3).map((latest) => ( // Ensure max 3 are shown
              <ArticleCard key={latest.slug} article={latest} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}