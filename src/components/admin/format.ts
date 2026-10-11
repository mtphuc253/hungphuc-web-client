import type { BadgeTone } from "./primitives";
import type { ContactStatus, ProjectCategory, UserRole } from "@/types/admin";

export const CONTACT_STATUS: Record<ContactStatus, { label: string; tone: BadgeTone }> = {
  new: { label: "Mới", tone: "blue" },
  in_progress: { label: "Đang xử lý", tone: "amber" },
  resolved: { label: "Đã xử lý", tone: "green" },
  archived: { label: "Lưu trữ", tone: "slate" },
};

export const PROJECT_CATEGORY: Record<ProjectCategory, { label: string; slug: string; publicPath: string }> = {
  architecture: {
    label: "Thiết kế kiến trúc",
    slug: "thiet-ke-kien-truc",
    publicPath: "/thiet-ke-kien-truc",
  },
  construction: {
    label: "Thi công xây dựng",
    slug: "thi-cong-xay-dung",
    publicPath: "/thi-cong-xay-dung",
  },
};

export const ROLE_LABEL: Record<UserRole, { label: string; tone: BadgeTone; description: string }> = {
  admin: { label: "Quản trị viên", tone: "violet", description: "Toàn quyền, bao gồm quản lý tài khoản" },
  editor: { label: "Biên tập viên", tone: "indigo", description: "Quản lý nội dung, cài đặt và liên hệ" },
  staff: { label: "Nhân viên", tone: "slate", description: "Đăng bài, quản lý dự án và xử lý liên hệ" },
};

export const ARTICLE_CATEGORIES = [
  "Cẩm nang xây dựng",
  "Pháp lý xây dựng",
  "Chi phí & báo giá",
  "Thi công & kỹ thuật",
  "Thiết kế & kiến trúc",
  "Vật liệu & công nghệ mới",
  "Tin tức ngành",
] as const;

const pad = (n: number) => String(n).padStart(2, "0");

export function fmtDate(value?: string | Date | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

export function fmtDateTime(value?: string | Date | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return `${pad(d.getHours())}:${pad(d.getMinutes())} · ${fmtDate(d)}`;
}

export function timeAgo(value?: string | Date | null) {
  if (!value) return "—";
  const d = new Date(value);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)} ngày trước`;
  return fmtDate(d);
}

/** yyyy-mm-dd cho input[type=date] */
export function toDateInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** yyyy-mm-ddThh:mm cho input[type=datetime-local] */
export function toDateTimeInput(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return `${toDateInput(value)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

/** Slug tiếng Việt giống backend */
export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .slice(0, 180);
}

export function stripHtml(html?: string | null) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}

export function wordCount(html?: string | null) {
  const text = stripHtml(html);
  return text ? text.split(" ").length : 0;
}
