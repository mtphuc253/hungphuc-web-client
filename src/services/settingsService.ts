
import axiosClient from "@/lib/axiosClient"
import axiosPublic from "@/lib/axiosPublic"
import { ApiResponse, Setting } from "@/types"

export const getSettings = async (): Promise<ApiResponse<Setting[]>> => {
  const response = await axiosPublic.get('/api/settings')
  return response.data.data
}

export const getSettingsPrive = async (): Promise<ApiResponse<Setting[]>> => {
  const response = await axiosPublic.get('/api/settings')
  return response.data
}

export const deleteSetting = async (key: string) => {
  const response = await axiosClient.delete(`/api/settings/${key}`)
  return response.data
}

export const createSetting = async (payload: { key: string; value: any }) => {
  const response = await axiosClient.post<ApiResponse<Setting>>('/api/settings', payload)
  return response.data
}


