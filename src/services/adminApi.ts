import axiosClient from "@/lib/axiosClient";
import type {
  AdminArticle,
  AdminArticleDetail,
  AdminBanner,
  AdminContact,
  AdminContactLog,
  AdminPartner,
  AdminProject,
  AdminUser,
  ApiEnvelope,
  ArticlePayload,
  ContactStatus,
  PricingCategory,
  PricingDetail,
  ProjectCategory,
  ProjectPayload,
  SettingRow,
  StatsOverview,
  UserRole,
} from "@/types/admin";

/** Lấy thông báo lỗi thân thiện từ lỗi axios */
export function getErrorMessage(error: unknown, fallback = "Đã có lỗi xảy ra"): string {
  const err = error as { response?: { data?: { message?: string } }; message?: string };
  return err?.response?.data?.message || err?.message || fallback;
}

type Query = Record<string, string | number | undefined | null>;

const clean = (params?: Query) =>
  Object.fromEntries(
    Object.entries(params || {}).filter(([, v]) => v !== undefined && v !== null && v !== "")
  );

async function get<T>(url: string, params?: Query) {
  const res = await axiosClient.get<ApiEnvelope<T>>(url, { params: clean(params) });
  return res.data;
}
async function post<T>(url: string, body?: unknown) {
  const res = await axiosClient.post<ApiEnvelope<T>>(url, body);
  return res.data;
}
async function put<T>(url: string, body?: unknown) {
  const res = await axiosClient.put<ApiEnvelope<T>>(url, body);
  return res.data;
}
async function del<T = null>(url: string) {
  const res = await axiosClient.delete<ApiEnvelope<T>>(url);
  return res.data;
}

export const adminApi = {
  // ---------- Auth / profile ----------
  getProfile: () => get<AdminUser>("/api/auth/profile"),
  updateProfile: (body: { name: string; email: string; password?: string; currentPassword?: string }) =>
    put<AdminUser>("/api/auth/profile", body),

  // ---------- Stats ----------
  getStats: () => get<StatsOverview>("/api/stats/overview"),

  // ---------- Upload ----------
  async uploadImage(file: File, onProgress?: (percent: number) => void): Promise<string> {
    const form = new FormData();
    form.append("file", file);
    const res = await axiosClient.post("/api/upload/image", form, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });
    const url = res.data?.data?.url || res.data?.url;
    if (!url) throw new Error("Không nhận được đường dẫn ảnh từ máy chủ");
    return url;
  },

  // ---------- Articles ----------
  getArticles: (params: Query) => get<AdminArticle[]>("/api/articles", params),
  getArticle: (id: string) => get<AdminArticleDetail>(`/api/articles/id/${id}`),
  createArticle: (body: ArticlePayload) => post<AdminArticleDetail>("/api/articles", body),
  updateArticle: (id: string, body: Partial<ArticlePayload>) =>
    put<AdminArticleDetail>(`/api/articles/${id}`, body),
  deleteArticle: (id: string) => del(`/api/articles/${id}`),

  // ---------- Projects ----------
  getProjects: (params: Query) => get<AdminProject[]>("/api/projects", params),
  getProject: (id: string) => get<AdminProject>(`/api/projects/${id}`),
  getSubcategories: (category?: ProjectCategory) =>
    get<{ subcategory: string; count: number }[]>("/api/projects/subcategories", { category }),
  createProject: (body: ProjectPayload) => post<AdminProject>("/api/projects", body),
  updateProject: (id: string, body: Partial<ProjectPayload>) => put<AdminProject>(`/api/projects/${id}`, body),
  deleteProject: (id: string) => del(`/api/projects/${id}`),

  // ---------- Contacts ----------
  getContacts: (params: Query) => get<AdminContact[]>("/api/contacts", params),
  getContact: (id: string) => get<AdminContact>(`/api/contacts/${id}`),
  updateContact: (id: string, body: Partial<AdminContact>) => put<AdminContact>(`/api/contacts/${id}`, body),
  bulkContactStatus: (ids: string[], status: ContactStatus) =>
    put<{ updated: number }>("/api/contacts/bulk/status", { ids, status }),
  deleteContact: (id: string) => del(`/api/contacts/${id}`),
  addContactLog: (id: string, note: string) => post<AdminContactLog>(`/api/contacts/${id}/logs`, { note }),
  deleteContactLog: (logId: string) => del(`/api/contacts/logs/${logId}`),
  getUnviewedCount: () => get<{ count: number }>("/api/contacts/stats/unviewed-count"),

  // ---------- Banners ----------
  getBanners: () => get<AdminBanner[]>("/api/banners"),
  createBanner: (body: Partial<AdminBanner>) => post<AdminBanner>("/api/banners", body),
  updateBanner: (id: string, body: Partial<AdminBanner>) => put<AdminBanner>(`/api/banners/${id}`, body),
  reorderBanners: (ids: string[]) => put<AdminBanner[]>("/api/banners/reorder", { ids }),
  deleteBanner: (id: string) => del(`/api/banners/${id}`),

  // ---------- Partners ----------
  getPartners: () => get<AdminPartner[]>("/api/partners"),
  createPartner: (body: Partial<AdminPartner>) => post<AdminPartner>("/api/partners", body),
  updatePartner: (id: string, body: Partial<AdminPartner>) => put<AdminPartner>(`/api/partners/${id}`, body),
  deletePartner: (id: string) => del(`/api/partners/${id}`),

  // ---------- Pricing ----------
  getPricing: () => get<PricingCategory[]>("/api/pricings/categories"),
  createPricingCategory: (body: { title: string; description?: string }) =>
    post<PricingCategory>("/api/pricings/categories", body),
  updatePricingCategory: (id: string, body: { title: string; description?: string }) =>
    put<PricingCategory>(`/api/pricings/categories/${id}`, body),
  deletePricingCategory: (id: string) => del(`/api/pricings/categories/${id}`),
  createPricingDetail: (body: { category_id: string; title: string; content?: string }) =>
    post<PricingDetail>("/api/pricings/details", body),
  updatePricingDetail: (id: string, body: { title: string; content?: string }) =>
    put<PricingDetail>(`/api/pricings/details/${id}`, body),
  deletePricingDetail: (id: string) => del(`/api/pricings/details/${id}`),

  // ---------- Settings ----------
  getSettings: () => get<SettingRow[]>("/api/settings"),
  saveSettings: (settings: Record<string, string>) => put<SettingRow[]>("/api/settings", { settings }),
  deleteSetting: (key: string) => del(`/api/settings/${encodeURIComponent(key)}`),

  // ---------- Users ----------
  getUsers: (search?: string) => get<AdminUser[]>("/api/users", { search }),
  createUser: (body: { name: string; email: string; password: string; role: UserRole }) =>
    post<AdminUser>("/api/users", body),
  updateUser: (id: string, body: Partial<{ name: string; email: string; password: string; role: UserRole }>) =>
    put<AdminUser>(`/api/users/${id}`, body),
  deleteUser: (id: string) => del(`/api/users/${id}`),
};
