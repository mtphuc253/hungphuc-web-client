import { apiCall } from "@/lib/axiosClient";
import type { Banner } from "@/types";

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const response = await apiCall.get("/api/banners");

    if (response.data.success && Array.isArray(response.data.data)) {
      const mappedBanners = response.data.data.map((banner: any) => ({
        id: banner.id,
        title: banner.title,
        description: banner.description || "",
        imageUrl: banner.image_url,
        link: banner.link_url || "",
        order: banner.order_index,
        isActive: true, // API does not provide isActive, assume true
      }));
      
      const sortedBanners = mappedBanners.sort((a, b) => a.order - b.order);
      return sortedBanners;
    } else {
      throw new Error("API không trả dữ liệu hợp lệ");
    }
  } catch (err) {
    console.error("Error fetching banners:", err);
    throw new Error("Không thể tải banner từ API");
  }
};
