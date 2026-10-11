// Lấy toàn bộ nội dung public (bài viết, dự án, bảng giá) phục vụ sitemap.xml & llms.txt
import { apiGet } from "./seo";

export interface PublicArticle {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  published_at: string | null;
  updated_at: string;
}

export interface PublicProject {
  id: string;
  title: string;
  slug: string;
  category: "architecture" | "construction";
  subcategory: string | null;
  location: string | null;
  description: string | null;
  meta_description: string | null;
  featured_image: string | null;
  updated_at: string;
}

type ListRes<T> = { data: T[]; meta?: { totalPages: number } };

async function fetchAll<T>(path: string, max = 2000): Promise<T[]> {
  const out: T[] = [];
  let page = 1;
  let totalPages = 1;
  do {
    const sep = path.includes("?") ? "&" : "?";
    const res = await apiGet<ListRes<T>>(`${path}${sep}page=${page}&limit=100`, 3600);
    if (!res) break;
    out.push(...res.data);
    totalPages = res.meta?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages && out.length < max);
  return out;
}

export const getAllArticles = () => fetchAll<PublicArticle>("/api/articles");
export const getAllProjects = () => fetchAll<PublicProject>("/api/projects");

export const projectPath = (p: Pick<PublicProject, "category" | "slug">) =>
  `${p.category === "construction" ? "/thi-cong-xay-dung" : "/thiet-ke-kien-truc"}/${p.slug}`;
