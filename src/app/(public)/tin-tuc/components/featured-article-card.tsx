
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowUpRight } from "lucide-react";

interface FeaturedArticleCardProps {
  article: Article;
}

export function FeaturedArticleCard({ article }: FeaturedArticleCardProps) {
  return (
    <article className="group relative grid grid-cols-1 md:grid-cols-2 gap-8 items-center rounded-2xl border bg-card text-card-foreground shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl mb-12">
      <div className="relative w-full h-64 md:h-full min-h-[300px]">
        <Image
          src={article.thumbnail_url}
          alt={article.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      <div className="p-8">
        <div className="mb-4 flex items-center gap-4">
            <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground">Mới nhất</Badge>
            <Badge variant="outline">{article.category}</Badge>
        </div>
        <h2 className="mb-4 text-3xl font-bold leading-tight text-foreground">
          <Link
            href={`/tin-tuc/${article.slug}`}
            className="hover:text-primary transition-colors duration-300 stretched-link"
          >
            {article.title}
          </Link>
        </h2>
        {/* <p className="mb-6 text-muted-foreground line-clamp-3">
          {article.excerpt} // Assuming excerpt is available
        </p> */}
        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>{article.author_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(article.published_at)}</span>
          </div>
        </div>
        <div className="absolute top-6 right-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform -translate-x-2 translate-y-2 group-hover:translate-x-0 group-hover:translate-y-0">
            <ArrowUpRight className="h-8 w-8" />
        </div>
      </div>
    </article>
  );
}
