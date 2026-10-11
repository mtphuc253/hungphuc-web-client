import type { Metadata } from "next";
import { breadcrumbJsonLd, itemListJsonLd, pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/seo/json-ld"
import { articleService } from "@/services/articleService";
import { type ArticleCategory } from "@/types";
import { ArticleCard } from "./components/article-card";
import { ArticleFilters } from "./components/article-filters";
import { Pagination } from "./components/pagination";
import { FeaturedArticleCard } from "./components/featured-article-card";

const BASE_META = {
  title: "Tin tức & Cẩm nang xây dựng",
  description: "Cập nhật tin tức, cẩm nang, chi phí, pháp lý và kinh nghiệm thiết kế – thi công xây dựng mới nhất từ đội ngũ kỹ sư, kiến trúc sư Hưng Phúc.",
  path: "/tin-tuc",
  keywords: ["tin tức xây dựng", "cẩm nang xây dựng", "kinh nghiệm xây nhà", "chi phí xây nhà", "pháp lý xây dựng"],
};

export async function generateMetadata({ searchParams }: NewsPageProps): Promise<Metadata> {
  const { page, title, category } = await searchParams;
  const pageNum = Number(page) > 1 ? Number(page) : 1;
  const qs = new URLSearchParams();
  if (category) qs.set("category", category);
  if (pageNum > 1) qs.set("page", String(pageNum));
  const path = `/tin-tuc${qs.toString() ? `?${qs}` : ""}`;
  const heading = category ? `${category}` : BASE_META.title;
  return pageMetadata({
    ...BASE_META,
    title: pageNum > 1 ? `${heading} – Trang ${pageNum}` : heading,
    description: category ? `Bài viết chuyên mục ${category}: ${BASE_META.description}` : BASE_META.description,
    path,
    // Trang kết quả tìm kiếm không nên được index
    noindex: !!title,
  });
}

interface NewsPageProps {
  searchParams: Promise<{
    page?: string;
    limit?: string;
    title?: string;
    category?: ArticleCategory;
  }>;
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const params = await searchParams; // ✅ phải await
  const page = params.page ?? "1";
  const title = params.title;
  const category = params.category;

  const isMainFirstPage = page === "1" && !title && !category;
  const limit = isMainFirstPage ? 10 : 9; // 1 featured + 9 grid on first page, 9 on others

  const { data: articles, meta } = await articleService
    .getArticles({ page, limit: String(limit), title, category })
    .catch(() => ({ data: [] as Awaited<ReturnType<typeof articleService.getArticles>>["data"], meta: undefined }));

  const featuredArticle =
    isMainFirstPage && articles.length > 0 ? articles[0] : null;
  const gridArticles =
    isMainFirstPage && articles.length > 0
      ? articles.slice(1)
      : articles;

  return (
    <main className="min-h-screen bg-background py-12">
      <JsonLd data={breadcrumbJsonLd([{ name: "Tin tức", path: "/tin-tuc" }])} />
      <JsonLd
        data={itemListJsonLd(
          "Tin tức & Cẩm nang xây dựng – Hưng Phúc",
          articles.map((a) => ({ name: a.title, path: `/tin-tuc/${a.slug}`, image: a.thumbnail_url }))
        )}
      />
      <div className="container mx-auto px-4">
        <header className="mb-8 border-b pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Tin tức & Cẩm nang
          </h1>
          <p className="mt-3 text-lg leading-8 text-gray-600 max-w-2xl">
            Khám phá kiến thức, xu hướng và kinh nghiệm mới nhất trong ngành xây dựng, 
            được cập nhật liên tục bởi đội ngũ chuyên gia của chúng tôi.
          </p>
        </header>

        <div className="mt-8 mb-12">
          <ArticleFilters />
        </div>

        {articles.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-xl text-gray-500">
              Không tìm thấy bài viết nào phù hợp.
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {featuredArticle && (
              <FeaturedArticleCard article={featuredArticle} />
            )}

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {gridArticles.map((article) => (
                <ArticleCard
                  key={article.id ?? article.slug ?? article.title} // ✅ đảm bảo key duy nhất
                  article={article}
                />
              ))}
            </div>
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <Pagination totalPages={meta.totalPages} />
        )}
      </div>
    </main>
  );
}
