import axiosClient from "@/lib/axiosClient";
import {
  ApiListResponse,
  ApiResponse,
  Article,
  ArticleDetail,
  Category,
} from "@/types";

interface GetArticlesParams {
  page?: number | string;
  limit?: number | string;
  title?: string;
  category?: string;
}

export const articleService = {
  async getArticles(
    params: GetArticlesParams = {}
  ): Promise<ApiListResponse<Article>> {
    const res = await axiosClient.get("/api/articles", { params });
    return res.data;
  },

  async getArticleBySlug(slug: string): Promise<ApiResponse<ArticleDetail>> {
    const res = await axiosClient.get(`/api/articles/${slug}`);
    return res.data;
  },

  async getCategories(): Promise<ApiListResponse<Category>> {
    const res = await axiosClient.get("/api/categories");
    return res.data;
  },
};
