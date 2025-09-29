import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SectionTitle } from '@/components/ui/section-title'
import { ArticleCard } from '../tin-tuc/components/article-card'
import { Article } from '@/types'
import { ArrowRight } from 'lucide-react'

interface LatestArticlesProps {
  articles: Article[]
}

export function LatestArticles({ articles }: LatestArticlesProps) {
  if (!articles || articles.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <SectionTitle>Tin tức mới nhất</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
        <div className="mt-12 text-center">
          <Button asChild size="lg" className="group">
            <Link href="/tin-tuc">
              Xem tất cả tin tức <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
