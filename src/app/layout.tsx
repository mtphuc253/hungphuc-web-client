// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import TokenRefreshProvider from "@/components/layout/TokenRefreshProvider";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_LEGAL_NAME, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} – Thiết kế kiến trúc & Thi công xây dựng trọn gói`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_LEGAL_NAME, url: SITE_URL }],
  creator: SITE_LEGAL_NAME,
  publisher: SITE_LEGAL_NAME,
  category: "construction",
  formatDetection: { telephone: true, email: true, address: true },
  alternates: {
    canonical: "/",
    types: { "text/plain": [{ url: "/llms.txt", title: "llms.txt" }] },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "vi_VN",
    url: "/",
    title: `${SITE_NAME} – Thiết kế kiến trúc & Thi công xây dựng trọn gói`,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: SITE_LEGAL_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} – Thiết kế kiến trúc & Thi công xây dựng trọn gói`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#1808AA",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <StoreProvider>
          <TokenRefreshProvider>
            {children}
            <Toaster position="top-right" />
          </TokenRefreshProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
