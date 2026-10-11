// Danh sách khoá cài đặt website (bảng Settings) mà giao diện public & admin sử dụng.
// Admin chỉnh tại /tuy-chinh; site public đọc qua GET /api/settings.

export type SettingFieldType = "text" | "textarea" | "image" | "url" | "email" | "tel" | "list";

export interface SettingField {
  key: string;
  label: string;
  type: SettingFieldType;
  placeholder?: string;
  hint?: string;
  max?: number;
}

export interface SettingGroup {
  id: string;
  title: string;
  description: string;
  fields: SettingField[];
}

export const SETTING_GROUPS: SettingGroup[] = [
  {
    id: "brand",
    title: "Thương hiệu",
    description: "Tên công ty, logo và khẩu hiệu hiển thị trên website",
    fields: [
      { key: "vnName", label: "Tên công ty (tiếng Việt)", type: "text", placeholder: "CÔNG TY TNHH TƯ VẤN ĐẦU TƯ XÂY DỰNG HƯNG PHÚC" },
      { key: "engName", label: "Tên tiếng Anh", type: "text", placeholder: "HUNG PHUC CONSTRUCTION INVESTMENT CONSULTANCY CO., LTD" },
      { key: "abbname", label: "Tên viết tắt / thương hiệu", type: "text", placeholder: "HƯNG PHÚC" },
      { key: "slogan", label: "Khẩu hiệu", type: "text", placeholder: "Uy tín, chất lượng, hiệu quả & phát triển" },
      { key: "tax_code", label: "Mã số thuế", type: "text" },
      { key: "logo_url", label: "Logo", type: "image", hint: "Nên dùng PNG nền trong suốt, chiều ngang ≥ 400px" },
    ],
  },
  {
    id: "contact",
    title: "Thông tin liên hệ",
    description: "Hiển thị ở header, footer, trang Liên hệ, nút gọi nhanh và dữ liệu Google (JSON-LD)",
    fields: [
      { key: "phone", label: "Hotline", type: "tel", placeholder: "0903 938 463" },
      { key: "email", label: "Email", type: "email", placeholder: "lienhe@hungphuc.vn" },
      { key: "address", label: "Địa chỉ", type: "textarea", placeholder: "Số nhà, đường, phường, thành phố" },
      { key: "working_hours", label: "Giờ làm việc", type: "text", placeholder: "Thứ 2 – Thứ 7: 7:30 – 17:30" },
      { key: "google_map_url", label: "Link Google Maps", type: "url", placeholder: "https://maps.app.goo.gl/...", hint: "Dùng để khách bấm chỉ đường" },
    ],
  },
  {
    id: "social",
    title: "Mạng xã hội",
    description: "Liên kết fanpage, kênh video… (dùng cho footer và dữ liệu cấu trúc sameAs)",
    fields: [
      { key: "facebook_url", label: "Facebook", type: "url", placeholder: "https://facebook.com/..." },
      { key: "zalo_url", label: "Zalo", type: "url", placeholder: "https://zalo.me/0903938463" },
      { key: "youtube_url", label: "YouTube", type: "url", placeholder: "https://youtube.com/@..." },
      { key: "tiktok_url", label: "TikTok", type: "url", placeholder: "https://tiktok.com/@..." },
    ],
  },
  {
    id: "ticker",
    title: "Thanh thông báo chạy chữ",
    description: "Các thông điệp chạy ở đầu trang website",
    fields: [{ key: "ticker_messages", label: "Thông điệp", type: "list" }],
  },
  {
    id: "seo",
    title: "SEO mặc định",
    description: "Áp dụng cho trang chủ và các trang không có cấu hình SEO riêng",
    fields: [
      { key: "seo_title", label: "Tiêu đề trang chủ", type: "text", max: 65, placeholder: "Hưng Phúc – Thiết kế & thi công xây dựng trọn gói tại TP.HCM" },
      { key: "seo_description", label: "Mô tả trang chủ", type: "textarea", max: 160 },
      { key: "seo_keywords", label: "Từ khoá", type: "text", placeholder: "thiết kế nhà, xây nhà trọn gói, thi công biệt thự", hint: "Cách nhau bằng dấu phẩy" },
      { key: "og_image", label: "Ảnh chia sẻ mặc định (Open Graph)", type: "image", hint: "Kích thước khuyến nghị 1200×630" },
    ],
  },
];

// estimate_config do trang "Dự toán AI" quản lý riêng
export const KNOWN_SETTING_KEYS = [...SETTING_GROUPS.flatMap((g) => g.fields.map((f) => f.key)), "estimate_config"];

/** ticker_messages lưu dạng chuỗi phân tách bởi dấu phẩy (định dạng Ticker đang đọc) */
export const parseList = (v?: string) =>
  (v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
export const joinList = (list: string[]) =>
  list
    .map((s) => s.replace(/,/g, " ").trim())
    .filter(Boolean)
    .join(", ");
