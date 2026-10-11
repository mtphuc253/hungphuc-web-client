import type { Metadata } from "next";
import { ArticleEditor } from "../article-editor";

export const metadata: Metadata = { title: "Viết bài mới" };

export default function NewArticlePage() {
  return <ArticleEditor />;
}
