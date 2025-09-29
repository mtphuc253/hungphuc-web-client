/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ApiResponse<T = any> {
  statusCode: number
  success: boolean
  message: string
  data: T
}

export interface User {
  id: string
  name: string
  email: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    id: string
    name: string
    email: string
    role: string
    accessToken: string
    refreshToken: string
  }
}

export interface RefreshResponse {
  statusCode: number
  success: boolean
  message: string
  data: {
    accessToken: string
    user: User
  }
}

export interface LogoutResponse {
  statusCode: number
  success: boolean
  message: string
  data: null
}

export interface Banner {
  id: string
  title: string
  imageUrl: string
  link?: string
  order: number
  isActive: boolean
}

export interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string;
}

export interface ContactForm {
  name: string
  email: string
  phone: string
  message: string
}

export interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

export interface ContactFormPayload {
  name: string;
  email: string;
  phone: string;
  address: string;
  message: string;
}

export interface ApiListResponse<T = any> extends ApiResponse<T[]> {
  meta?: {
    page: number;
    limit: number;
    totalPages: number;
    totalRecords: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ApiMeta {
  page: number;
  limit: number;
  totalPages: number;
  totalRecords?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  thumbnail_url: string;
  category: string;
  published_at: string;
  updated_at: string;
  author_id: string;
  author_name: string;
}

export interface ArticleDetail extends Article {
  description: string;
  content: string;
  keywords: string;
  canonical_url: string;
  is_published: boolean;
  created_at: string;
}

export const ArticleCategories = [
  'Cẩm nang xây dựng', 
  'Pháp lý xây dựng', 
  'Chi phí & báo giá', 
  'Thi công & kỹ thuật', 
  'Thiết kế & kiến trúc', 
  'Vật liệu & công nghệ mới', 
  'Tin tức ngành'
] as const;

export type ArticleCategory = typeof ArticleCategories[number];

export interface IProjectImage {
  id: string;
  image_url: string;
  caption: string;
  alt_text: string;
  created_at: string;
}

export interface IProject {
  id: string;
  title: string;
  slug: string;
  category: 'construction' | 'architecture';
  subcategory: string;
  description: string;
  location: string;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
  status: 'published' | 'archived';
  meta_title: string;
  meta_description: string;
  client_name?: string;
  featured_image: string;
  images: IProjectImage[];
}