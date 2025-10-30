// import axiosClient from '@/lib/axiosClient'
import axiosPublic from '@/lib/axiosPublic'
import { ApiListResponse, ApiResponse, IProject } from '@/types'

interface GetProjectsParams {
  page?: number
  limit?: number
  category?: 'construction' | 'architecture' | ''
  subcategory?: string
  q?: string
}

export const projectService = {
  async getProjects({
    page = 1,
    limit = 10,
    category = '',
    subcategory = '',
    q = '',
  }: GetProjectsParams): Promise<ApiListResponse<IProject>> {
    // keep sending `title` as the HTTP query param for backwards compatibility,
    // but the TypeScript API uses `q` (search query) so we can remove the
    // redundant `title` type while preserving the current backend contract.
    const response = await axiosPublic.get('/api/projects', {
      params: { page, limit, category, subcategory, title: q },
    })
    return response.data
  },

  async getProjectBySlug(slug: string): Promise<ApiResponse<IProject>> {
    const response = await axiosPublic.get(`/api/projects/slug/${slug}`)
    return response.data
  },

  async getProjectById(id: string): Promise<ApiResponse<IProject>> {
    const response = await axiosPublic.get(`api/projects/${id}`)
    return response.data
  }
}
