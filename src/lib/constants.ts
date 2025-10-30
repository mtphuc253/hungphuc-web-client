import { Building, Calculator, DraftingCompass, FolderKanban, InfoIcon, LayoutDashboard, MoreHorizontal, Newspaper, Users } from "lucide-react"

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: "/api/auth/login",
  LOGOUT: "/api/auth/logout",
  REFRESH: "/api/auth/refresh",

  // Public endpoints
  BANNERS: "/api/banners",
  CONTACT: "/api/contact",
} as const

// Navigation items for public site
export const PUBLIC_NAV_ITEMS = [
  { label: "TRANG CHỦ", href: "/" },
  { label: "GIỚI THIỆU", href: "/gioi-thieu" },
  // { label: "BẢNG GIÁ", href: "/bang-gia" },
  { label: "THIẾT KẾ KIẾN TRÚC", href: "/thiet-ke-kien-truc" },
  { label: "THI CÔNG XÂY DỰNG", href: "/thi-cong-xay-dung" },
  { label: "TIN TỨC", href: "/tin-tuc" },
  { label: "LIÊN LẠC", href: "/lien-lac" },
] as const

export const ADMIN_NAV_ITEMS = [
  { href: "/thong-ke", label: "Thống kê", icon: LayoutDashboard },
  { href: "/lien-he-khach-hang", label: "Liên hệ khách hàng", icon: Users },
  { href: "/quan-ly-du-an/thiet-ke-kien-truc", label: "Thiết kế kiến trúc", icon: DraftingCompass },
  { href: "/quan-ly-du-an/thi-cong-xay-dung", label: "Thi công xây dựng", icon: Building },
  { href: "/bai-viet", label: "Bài viết", icon: Newspaper },
  { href: "/bao-gia", label: "Báo giá", icon: Calculator },
  { href: "/tuy-chinh", label: "Thông  tin chung", icon: InfoIcon },
  { href: "/khac", label: "Khác", icon: MoreHorizontal }
] as const


// Company information
export const COMPANY_INFO = {
  name: "HƯNG PHÚC",
  fullName: "Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc",
  director: "Mai Tấn Trinh",
  motto: "UY TÍN, CHẤT LƯỢNG, HIỆU QUẢ & PHÁT TRIỂN",
} as const
