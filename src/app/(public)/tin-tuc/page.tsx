import type { Metadata } from "next";
import { articleService } from "@/services/articleService";
import { type ArticleCategory } from "@/types";
import { ArticleCard } from "./components/article-card";
import { ArticleFilters } from "./components/article-filters";
import { Pagination } from "./components/pagination";
import { FeaturedArticleCard } from "./components/featured-article-card";

export const metadata: Metadata = {
  title: "Tin tức & Cẩm nang Xây dựng | Công ty Hưng Phúc",
  description: "Cập nhật tin tức, cẩm nang, và kiến thức mới nhất về ngành xây dựng, thiết kế, thi công và pháp lý từ Hưng Phúc.",
  keywords: [
    "tin tức xây dựng",
    "cẩm nang xây dựng",
    "kiến thức xây dựng",
    "xu hướng thiết kế",
    "vật liệu mới",
    "quy định xây dựng",
  ],
  openGraph: {
    title: "Tin tức & Cẩm nang Xây dựng | Công ty Hưng Phúc",
    description: "Cập nhật tin tức, cẩm nang, và kiến thức mới nhất về ngành xây dựng, thiết kế, thi công và pháp lý từ Hưng Phúc.",
    url: "https://hungphuc.com.vn/tin-tuc",
    type: "website",
    images: [
      {
        url: "https://res.cloudinary.com/dizk1uwv3/image/upload/v1759057998/Hungphuc/nhan-su-hung-phuc-khao-sat-cong-trinh.jpg",
        width: 1200,
        height: 630,
        alt: "Tin tức & Cẩm nang Xây dựng Hưng Phúc",
      },
    ],
  },
};

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

  const { data: articles, meta } = await articleService.getArticles({
    page,
    limit: String(limit),
    title,
    category,
  });

  const featuredArticle =
    isMainFirstPage && articles.length > 0 ? articles[0] : null;
  const gridArticles =
    isMainFirstPage && articles.length > 0
      ? articles.slice(1)
      : articles;

  return (
    <main className="min-h-screen bg-background py-12">
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
