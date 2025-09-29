import axiosClient from "@/lib/axiosClient";
import type { Banner } from "@/types";

interface ApiBanner {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  link_url?: string;
  order_index: number;
}

export const getBanners = async (): Promise<Banner[]> => {
  try {
    const response = await axiosClient.get("/api/banners");

    if (response.data.success && Array.isArray(response.data.data)) {
      const mappedBanners = response.data.data.map((banner: ApiBanner) => ({
        id: banner.id,
        title: banner.title,
        description: banner.description || "",
        imageUrl: banner.image_url,
        link: banner.link_url || "",
        order: banner.order_index,
        isActive: true, // API does not provide isActive, assume true
      }));
      
      const sortedBanners = mappedBanners.sort((a: any, b: any) => a.order - b.order);
      return sortedBanners;
    } else {
      throw new Error("API không trả dữ liệu hợp lệ");
    }
  } catch (err) {
    console.error("Error fetching banners:", err);
    throw new Error("Không thể tải banner từ API");
  }
};
