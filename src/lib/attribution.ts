// Ghi nhận nguồn truy cập lần đầu (first-touch) để gắn vào dự toán / liên hệ.
const KEY = "hp_attribution";
const PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;

export type Attribution = Partial<Record<(typeof PARAMS)[number] | "referrer" | "landing_page", string>>;

/** Gọi khi khách vào trang: chỉ lưu lần đầu, trừ khi URL có UTM mới (chiến dịch mới) */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const url = new URL(window.location.href);
    const fromUrl: Attribution = {};
    PARAMS.forEach((p) => {
      const v = url.searchParams.get(p);
      if (v) fromUrl[p] = v.slice(0, 200);
    });
    const existing = window.localStorage.getItem(KEY);
    if (existing && Object.keys(fromUrl).length === 0) return;

    const ref = document.referrer && !document.referrer.startsWith(window.location.origin) ? document.referrer : "";
    const data: Attribution = {
      ...fromUrl,
      referrer: ref.slice(0, 300),
      landing_page: (url.pathname + url.search).slice(0, 300),
    };
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* localStorage bị chặn -> bỏ qua */
  }
}

export function getAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}
