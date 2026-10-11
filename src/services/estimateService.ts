import axiosPublic from "@/lib/axiosPublic";
import axiosClient from "@/lib/axiosClient";
import type { Attribution } from "@/lib/attribution";
import type {
  EstimateAdminConfig,
  EstimateParams,
  EstimateRecord,
  EstimateResponse,
  EstimateStats,
  ParseResponse,
} from "@/types/estimate";
import type { PageMeta } from "@/types/admin";

export interface AiInfo {
  provider: "gemini" | "anthropic" | "none";
  model: string | null;
  dailyLimit: number;
  usedToday: number;
}

export const estimateApi = {
  async parse(description: string) {
    const res = await axiosPublic.post<{ data: ParseResponse }>("/api/estimate/parse", { description });
    return res.data.data;
  },
  async calculate(params: EstimateParams, sourceText: string | null, attribution: Attribution | null) {
    const res = await axiosPublic.post<{ data: EstimateResponse }>(
      "/api/estimate",
      { params, sourceText, attribution },
      { timeout: 90_000 }
    );
    return res.data.data;
  },
  async lead(id: string, body: { name: string; phone: string; email?: string; note?: string }) {
    const res = await axiosPublic.post(`/api/estimate/${id}/lead`, body);
    return res.data;
  },

  // ---------- Admin ----------
  async getConfig() {
    const res = await axiosClient.get<{ data: { config: EstimateAdminConfig; aiEnabled: boolean; ai: AiInfo } }>("/api/estimate/admin/config");
    return res.data.data;
  },
  async saveConfig(config: EstimateAdminConfig) {
    const res = await axiosClient.put<{ data: { config: EstimateAdminConfig; aiEnabled: boolean; ai: AiInfo } }>("/api/estimate/admin/config", { config });
    return res.data.data;
  },
  async list(params: { page?: number; limit?: number; withLead?: string }) {
    const res = await axiosClient.get<{ data: EstimateRecord[]; meta: PageMeta; stats: EstimateStats }>("/api/estimate/admin/list", { params });
    return res.data;
  },
  async remove(id: string) {
    await axiosClient.delete(`/api/estimate/admin/${id}`);
  },
};

// BIGINT từ Postgres được trả về dạng chuỗi -> ép sang số
export function formatMoney(value: number | string) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  if (n >= 1e9) return `${(n / 1e9).toLocaleString("vi-VN", { maximumFractionDigits: 2 })} tỷ`;
  return `${Math.round(n / 1e6).toLocaleString("vi-VN")} triệu`;
}
