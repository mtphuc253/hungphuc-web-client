// Các tiền tố đường dẫn thuộc khu vực quản trị (route group `(admin)`).
// Dùng chung cho middleware, robots.txt và sitemap để không bỏ sót trang admin nào.
export const ADMIN_ROUTE_PREFIXES = [
  "/thong-ke",
  "/lien-he-khach-hang",
  "/quan-ly-du-an",
  "/bai-viet",
  "/bao-gia",
  "/tuy-chinh",
  "/khac",
  "/nguoi-dung",
  "/tai-khoan",
  "/du-toan-ai",
] as const;

export const isAdminPath = (pathname: string) =>
  ADMIN_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
