import axiosClient from "@/lib/axiosClient"
import axiosPublic from "@/lib/axiosPublic"
import { ApiListResponse, ApiResponse, Contact, ContactFormPayload, ContactLog, ContactStatus } from "@/types"

export const contactService = {
  async getContacts(params: {
    page?: number
    limit?: number
    search?: string
    status?: ContactStatus
    sort?: "asc" | "desc"
  }) {
    const res = await axiosClient.get<ApiListResponse<Contact>>("/api/contacts", { params })
    return res.data
  },

  async getContactById(id: string) {
    const res = await axiosClient.get<ApiResponse<Contact>>(`/api/contacts/${id}`)
    return res.data
  },

  async sendContact(payload: ContactFormPayload) {
    const res = await axiosPublic.post("/api/contacts", payload)

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Gửi thông tin thất bại")
    }

    return res.data
  },

  async updateContactStatus(id: string, status: ContactStatus) {
    const res = await axiosClient.put(`/api/contacts/${id}`, { status })
    return res.data
  },

  async markAsViewed(id: string) {
    return await axiosClient.put(`/api/contacts/${id}`, { is_viewed: true })
  },

  async addContactLog(contactId: string, note: string) {
    const res = await axiosClient.post<ApiResponse<ContactLog>>(
      `/api/contacts/${contactId}/logs`,
      { note },
    )
    return res.data
  },

  async deleteContactLog(logId: string) {
    const res = await axiosClient.delete<ApiResponse<null>>(`/api/contacts/logs/${logId}`)
    return res.data
  },
}
