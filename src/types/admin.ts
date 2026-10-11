export type UserRole = "admin" | "editor" | "staff";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
  article_count?: number;
  last_login_at?: string | null;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  totalRecords?: number;
}

export interface ApiEnvelope<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: PageMeta;
}

export interface AdminArticle {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_url: string | null;
  category: string;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  author_id: string | null;
  author_name: string | null;
}

export interface AdminArticleDetail extends AdminArticle {
  content: string;
  keywords: string | string[] | null;
  canonical_url: string | null;
}

export interface ArticlePayload {
  title: string;
  slug?: string;
  description?: string;
  content: string;
  thumbnail_url?: string | null;
  category: string;
  keywords?: string[];
  canonical_url?: string;
  is_published: boolean;
  published_at?: string | null;
}

export type ProjectCategory = "architecture" | "construction";
export type ProjectStatus = "published" | "archived";

export interface ProjectImage {
  id?: string;
  image_url: string;
  caption?: string | null;
  alt_text?: string | null;
}

export interface AdminProject {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: ProjectCategory;
  subcategory: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  client_name: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
  image_count?: number;
  images?: ProjectImage[];
}

export type ProjectPayload = Partial<Omit<AdminProject, "id" | "created_at" | "updated_at" | "image_count">> & {
  title: string;
  category: ProjectCategory;
};

export type ContactStatus = "new" | "in_progress" | "resolved" | "archived";

export interface AdminContactLog {
  id: string;
  contact_id: string;
  user_id: string | null;
  note: string;
  created_at: string;
  user_name?: string | null;
  user_email?: string | null;
}

export interface AdminContact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  message: string | null;
  status: ContactStatus;
  source: string | null;
  assigned_to: string | null;
  assigned_to_name?: string | null;
  created_at: string;
  is_viewed_by_me?: boolean;
  log_count?: number;
  logs?: AdminContactLog[];
  viewers?: { id: string; name: string; email: string; viewed_at: string }[];
}

export interface AdminBanner {
  id: string;
  title: string | null;
  image_url: string;
  link_url: string | null;
  order_index: number;
  created_at: string;
}

export interface AdminPartner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  created_at: string;
}

export interface PricingDetail {
  id: string;
  category_id: string;
  title: string;
  content: string | null;
  created_at: string;
}

export interface PricingCategory {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  details: PricingDetail[];
}

export interface SettingRow {
  id: string;
  key: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface StatsOverview {
  contacts: {
    total: number;
    this_month: number;
    last_month: number;
    last_7_days: number;
    unviewed: number;
    byStatus: Record<ContactStatus, number>;
  };
  articles: { total: number; published: number; drafts: number; this_month: number };
  projects: {
    total: number;
    architecture: number;
    construction: number;
    published: number;
    archived: number;
  };
  misc: {
    partners: number;
    banners: number;
    users: number;
    pricing_categories: number;
    project_images: number;
    estimates_30_days: number;
    estimate_leads_30_days: number;
  };
  timeline: { month: string; contacts: number; articles: number }[];
  articlesByCategory: { category: string; count: number }[];
  recentContacts: Pick<
    AdminContact,
    "id" | "name" | "phone" | "email" | "status" | "created_at" | "is_viewed_by_me"
  >[];
  recentArticles: Pick<
    AdminArticle,
    | "id"
    | "title"
    | "slug"
    | "thumbnail_url"
    | "is_published"
    | "published_at"
    | "updated_at"
    | "category"
    | "author_name"
  >[];
}
