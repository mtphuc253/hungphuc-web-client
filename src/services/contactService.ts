import axiosClient from "@/lib/axiosClient"
import { ContactFormPayload } from "@/types"

export const contactService = {
  async sendContact(payload: ContactFormPayload) {
    const res = await axiosClient.post("/api/contacts", payload)

    if (!res.data?.success) {
      throw new Error(res.data?.message || "Gửi thông tin thất bại")
    }

    return res.data
  },
}
