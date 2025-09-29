
import Link from "next/link";
import Image from "next/image";
import { Article } from "@/types";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Calendar, User } from "lucide-react";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
      <Link href={`/tin-tuc/${article.slug}`} className="block overflow-hidden">
        <Image
          src={article.thumbnail_url}
          alt={article.title}
          width={400}
          height={225}
          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="mb-2">
          <Badge variant="outline">{article.category}</Badge>
        </div>
        <h3 className="mb-2 text-lg font-semibold leading-snug">
          <Link
            href={`/tin-tuc/${article.slug}`}
            className="hover:text-primary"
          >
            {article.title}
          </Link>
        </h3>
        <div className="mt-auto flex items-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span>{article.author_name}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(article.published_at)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
