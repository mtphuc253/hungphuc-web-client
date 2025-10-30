// import axiosClient from "@/lib/axiosClient";
import axiosPublic from "@/lib/axiosPublic";
import axiosClient from "@/lib/axiosClient";
import uploadService from '@/services/uploadService'
import type { Partner } from "@/types";

export const getPartners = async (): Promise<Partner[]> => {
  try {
    const response = await axiosPublic.get("/api/partners");

    if (response.data.success && Array.isArray(response.data.data)) {
      const mappedPartners = response.data.data.map((partner: any) => ({
        id: partner.id,
        name: partner.name,
        logoUrl: partner.logo_url,
        websiteUrl: partner.website_url || "",
      }));
      return mappedPartners;
    } else {
      console.error("API did not return valid partner data.", response.data);
      return []; // Return empty array on invalid data structure
    }
  } catch (err) {
    console.error("Error fetching partners:", err);
    return []; // Return empty array on API call failure
  }
};

export const createPartner = async (payload: { name: string; logo_url: string; website_url?: string }) => {
  const res = await axiosClient.post('/api/partners', payload)
  return res.data
}

export const deletePartner = async (id: string) => {
  const res = await axiosClient.delete(`/api/partners/${id}`)
  return res.data
}

export const uploadPartnerLogo = async (file: File) => {
  // helper that uploads via uploadService and returns URL
  const uploadRes = await uploadService.uploadImage(file)
  return uploadRes?.data?.url || uploadRes?.url || uploadRes?.data || null
}

