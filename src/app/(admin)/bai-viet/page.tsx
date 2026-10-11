import { Suspense } from "react";
import type { Metadata } from "next";
import { LoadingBlock } from "@/components/admin/primitives";
import { ArticleList } from "./article-list";

export const metadata: Metadata = { title: "Bài viết" };

export default function ArticlesPage() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <ArticleList />
    </Suspense>
  );
}
