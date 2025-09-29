import axiosClient from '@/lib/axiosClient'
import { ApiListResponse, ApiResponse, IProject } from '@/types'

interface GetProjectsParams {
  page?: number
  limit?: number
  category?: 'construction' | 'architecture' | ''
  subcategory?: string
}

export const projectService = {
  async getProjects({
    page = 1,
    limit = 10,
    category = '',
    subcategory = '',
  }: GetProjectsParams): Promise<ApiListResponse<IProject>> {
    const response = await axiosClient.get('api/projects', {
      params: { page, limit, category, subcategory },
    })
    return response.data
  },

  async getProjectBySlug(slug: string): Promise<ApiResponse<IProject>> {
    const response = await axiosClient.get(`api/projects/slug/${slug}`)
    return response.data
  },
}
