import { apiCall } from "@/lib/axiosClient";
import type { Partner } from "@/types";

export const getPartners = async (): Promise<Partner[]> => {
  try {
    const response = await apiCall.get("/api/partners");

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
