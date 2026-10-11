import { apiGet } from "./seo";
import type { EstimatePublicConfig } from "@/types/estimate";

/** Server component / route handler: cấu hình dự toán công khai (cache 60s) */
export async function getEstimatePublicConfig(): Promise<EstimatePublicConfig | null> {
  const res = await apiGet<{ data: EstimatePublicConfig }>("/api/estimate/config", 60);
  return res?.data ?? null;
}
