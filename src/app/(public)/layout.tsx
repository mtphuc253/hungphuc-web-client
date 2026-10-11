import type React from "react";
import { Bai_Jamjuree } from "next/font/google";
import { Header } from "@/components/layout/header";
import { Ticker } from "@/components/layout/ticker";
import { Footer } from "@/components/layout/footer";
import { Masthead } from "@/components/layout/masthead";
import { FloatingContactButtons } from "@/components/layout/FloatingContactButtons";
import SettingsProvider from "@/components/layout/SettingsProvider";
import { AttributionTracker } from "@/components/layout/AttributionTracker";
import { JsonLd } from "@/components/seo/json-ld";
import { cn } from "@/lib/utils";
import { getSiteSettings, organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bai-jamjuree",
});

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();

  return (
    <SettingsProvider>
      <div className={cn("min-h-screen bg-background font-sans antialiased", baiJamjuree.variable)}>
        <AttributionTracker />
        <JsonLd data={organizationJsonLd(settings)} />
        <JsonLd data={websiteJsonLd(settings)} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:shadow"
        >
          Bỏ qua điều hướng
        </a>
        <Masthead />
        <div className="sticky top-0 z-50">
          <Header />
          <Ticker />
        </div>
        <div id="main-content">{children}</div>
        <Footer />
        <FloatingContactButtons />
      </div>
    </SettingsProvider>
  );
}
