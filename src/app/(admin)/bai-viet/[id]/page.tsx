import type { Metadata } from "next";
import { ArticleEditor } from "../article-editor";

export const metadata: Metadata = { title: "Chỉnh sửa bài viết" };

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ArticleEditor id={id} />;
}
