// import axiosClient from "@/lib/axiosClient";
import axiosPublic from "@/lib/axiosPublic";
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
    const response = await axiosPublic.get("/api/banners");

    if (response.data.success && Array.isArray(response.data.data)) {
      const mappedBanners: Banner[] = response.data.data.map((banner: ApiBanner) => ({
        id: String(banner.id),
        title: banner.title,
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

export const createBanner = async (payload: { title: string; image_url: string; link_url?: string; order_index?: number }) => {
  const res = await axiosClient.post('/api/banners', payload)
  return res.data
}

export const deleteBanner = async (id: string) => {
  const res = await axiosClient.delete(`/api/banners/${id}`)
  return res.data
}

export const updateBanner = async (id: string, payload: { title?: string; image_url?: string; link_url?: string; order_index?: number }) => {
  const res = await axiosClient.put(`/api/banners/${id}`, payload)
  return res.data
}
