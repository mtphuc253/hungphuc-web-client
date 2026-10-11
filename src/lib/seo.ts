// Tiện ích SEO dùng chung cho các trang public (chạy phía server).
import type { Metadata } from "next";

/** Domain chính thức của website. Đặt NEXT_PUBLIC_SITE_URL trong .env khi đổi domain. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hungphuc.vercel.app").replace(/\/$/, "");
export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export const SITE_NAME = "Hưng Phúc";
export const SITE_LEGAL_NAME = "Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc";
export const DEFAULT_DESCRIPTION =
  "Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc – thiết kế kiến trúc, thi công xây dựng nhà phố, biệt thự, nhà xưởng trọn gói tại TP.HCM. Uy tín, chất lượng, hiệu quả.";
export const DEFAULT_OG_IMAGE =
  "https://res.cloudinary.com/dizk1uwv3/image/upload/v1758176175/Hungphuc/banner-kien-tao-khong-gian-song-xanh-hien-dai.png";
export const LOGO_URL =
  "https://res.cloudinary.com/dizk1uwv3/image/upload/v1758561417/Hungphuc/logo-hung-phuc-ngang.png";

/**
 * Canonical do người dùng nhập chỉ hợp lệ khi trỏ tới NGUỒN BÊN NGOÀI (bài đăng lại).
 * Canonical trỏ về một domain "hungphuc" khác domain chính (ví dụ domain cũ) là sai
 * và khiến Google bỏ index trang -> bỏ qua để dùng canonical tự sinh.
 */
export function externalCanonical(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const own = new URL(SITE_URL).host;
    if (u.host === own || /hungphuc/i.test(u.host)) return null;
    return u.toString();
  } catch {
    return null;
  }
}

/** Mỗi trang chỉ nên có 1 thẻ H1 (tiêu đề) -> hạ H1 trong nội dung HTML thành H2 */
export const demoteH1 = (html?: string | null) => (html || "").replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");

export const absoluteUrl = (path = "/") => (path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

export type SiteSettings = Record<string, string>;

/** Đọc bảng Settings từ backend, cache 5 phút (ISR). Không bao giờ throw. */
export async function getSiteSettings(): Promise<SiteSettings> {
  if (!API_URL) return {};
  try {
    const res = await fetch(`${API_URL}/api/settings`, { next: { revalidate: 300 }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return {};
    const json = await res.json();
    const rows: { key: string; value: string }[] = Array.isArray(json?.data) ? json.data : [];
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return {};
  }
}

/** Fetch JSON từ backend có cache, trả null nếu lỗi (dùng cho sitemap, llms.txt, JSON-LD) */
export async function apiGet<T>(path: string, revalidate = 300): Promise<T | null> {
  if (!API_URL) return null;
  try {
    // Timeout để build không bị treo khi backend đang khởi động lại
    const res = await fetch(`${API_URL}${path}`, { next: { revalidate }, signal: AbortSignal.timeout(15000) });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export const stripHtml = (html?: string | null) =>
  (html || "")
    .replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<\/(p|h[1-6]|li|blockquote|div|br)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n+/g, "\n\n")
    .trim();

export const truncate = (text: string, max = 160) => {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  return cut.slice(0, cut.lastIndexOf(" ") > 80 ? cut.lastIndexOf(" ") : cut.length) + "…";
};

/** Metadata chuẩn cho 1 trang: canonical + Open Graph + Twitter */
export function pageMetadata({
  title,
  description,
  path,
  image,
  keywords,
  type = "website",
  noindex,
  absoluteTitle,
  publishedTime,
  modifiedTime,
  authors,
  section,
}: {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  keywords?: string[] | string | null;
  type?: "website" | "article";
  noindex?: boolean;
  absoluteTitle?: boolean;
  publishedTime?: string | null;
  modifiedTime?: string | null;
  authors?: string[];
  section?: string;
}): Metadata {
  const img = image || DEFAULT_OG_IMAGE;
  const desc = truncate(description || DEFAULT_DESCRIPTION, 165);
  const ogTitle = absoluteTitle ? title : `${title} | ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description: desc,
    keywords: (Array.isArray(keywords) ? keywords.slice(0, 10) : keywords) || undefined,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url: path,
      siteName: SITE_NAME,
      locale: "vi_VN",
      title: ogTitle,
      description: desc,
      images: [{ url: img, width: 1200, height: 630, alt: title }],
      ...(type === "article"
        ? {
            publishedTime: publishedTime || undefined,
            modifiedTime: modifiedTime || undefined,
            authors,
            section,
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: desc,
      images: [img],
    },
  };
}

/* ----------------------------- JSON-LD builders ----------------------------- */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

const socialLinks = (s: SiteSettings) =>
  ["facebook_url", "zalo_url", "youtube_url", "tiktok_url"].map((k) => s[k]).filter((v): v is string => !!v && /^https?:\/\//.test(v));

export function organizationJsonLd(s: SiteSettings) {
  const phone = s.phone?.replace(/[^\d+]/g, "");
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "GeneralContractor"],
    "@id": ORG_ID,
    name: s.abbname ? `${s.abbname}` : SITE_NAME,
    legalName: s.vnName || SITE_LEGAL_NAME,
    alternateName: s.engName || undefined,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: s.logo_url || LOGO_URL },
    image: s.og_image || DEFAULT_OG_IMAGE,
    description: s.seo_description || DEFAULT_DESCRIPTION,
    slogan: s.slogan || "Uy tín, chất lượng, hiệu quả & phát triển",
    email: s.email || undefined,
    telephone: phone ? (phone.startsWith("+") ? phone : `+84${phone.replace(/^0/, "")}`) : undefined,
    taxID: s.tax_code || undefined,
    address: s.address
      ? {
          "@type": "PostalAddress",
          streetAddress: s.address,
          addressLocality: "Thành phố Hồ Chí Minh",
          addressCountry: "VN",
        }
      : undefined,
    areaServed: { "@type": "Country", name: "Việt Nam" },
    hasMap: s.google_map_url || undefined,
    knowsAbout: [
      "Thiết kế kiến trúc",
      "Thi công xây dựng",
      "Xây nhà trọn gói",
      "Thiết kế biệt thự",
      "Thiết kế nhà phố",
      "Giám sát công trình",
    ],
    sameAs: socialLinks(s).length ? socialLinks(s) : undefined,
    contactPoint: phone
      ? [
          {
            "@type": "ContactPoint",
            telephone: phone.startsWith("+") ? phone : `+84${phone.replace(/^0/, "")}`,
            contactType: "customer service",
            areaServed: "VN",
            availableLanguage: ["Vietnamese"],
          },
        ]
      : undefined,
  };
}

export function websiteJsonLd(s: SiteSettings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: s.abbname || SITE_NAME,
    alternateName: s.vnName || SITE_LEGAL_NAME,
    description: s.seo_description || DEFAULT_DESCRIPTION,
    inLanguage: "vi-VN",
    publisher: { "@id": ORG_ID },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/tin-tuc?title={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Trang chủ", path: "/" }, ...items].map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function itemListJsonLd(name: string, items: { name: string; path: string; image?: string | null }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: absoluteUrl(it.path),
      name: it.name,
      image: it.image || undefined,
    })),
  };
}

export const ORG_REF = { "@id": ORG_ID };
export const WEBSITE_REF = { "@id": WEBSITE_ID };
