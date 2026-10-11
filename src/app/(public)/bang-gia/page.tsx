import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, PhoneCall, Sparkles } from "lucide-react";
import { EstimateSection } from "@/components/estimate/estimate-section";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, breadcrumbJsonLd, ORG_REF, pageMetadata } from "@/lib/seo";
import { getEstimatePublicConfig } from "@/lib/estimate-server";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Dự toán chi phí xây nhà bằng AI – miễn phí",
  description:
    "Ước tính chi phí xây nhà theo đơn giá hiện hành của Hưng Phúc. Nhập thông tin công trình hoặc mô tả bằng lời để AI hỗ trợ lập dự toán.",
  path: "/bang-gia",
  keywords: ["dự toán chi phí xây nhà", "báo giá xây nhà", "dự toán AI", "giá xây nhà trọn gói"],
});

export default async function PricingPage() {
  const config = await getEstimatePublicConfig();

  return (
    <main className="min-h-screen bg-gray-50">
      <JsonLd data={breadcrumbJsonLd([{ name: "Dự toán AI", path: "/bang-gia" }])} />
      {config?.enabled && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "Dự toán chi phí xây nhà Hưng Phúc",
            url: absoluteUrl("/bang-gia"),
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            inLanguage: "vi-VN",
            isAccessibleForFree: true,
            offers: { "@type": "Offer", price: 0, priceCurrency: "VND" },
            provider: ORG_REF,
          }}
        />
      )}

      {config?.enabled ? (
        <EstimateSection config={config} headingLevel="h1" id="cong-cu-du-toan" />
      ) : (
        <section className="bg-[#0d0a3a] px-4 py-24 text-center text-white">
          <Sparkles className="mx-auto h-10 w-10 text-indigo-300" aria-hidden />
          <h1 className="mt-5 text-3xl font-bold sm:text-4xl">Công cụ dự toán AI đang được cập nhật</h1>
          <p className="mx-auto mt-3 max-w-2xl text-indigo-100">
            Vui lòng liên hệ Hưng Phúc để được tư vấn và nhận báo giá cho công trình của bạn.
          </p>
        </section>
      )}

      <section className="bg-white px-4 py-12 sm:py-16">
        <div className="container mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 rounded-2xl bg-primary px-6 py-8 text-center text-white sm:flex-row sm:px-10 sm:py-10 sm:text-left">
          <div>
            <p className="text-2xl font-bold sm:text-3xl">Muốn được tư vấn trực tiếp?</p>
            <p className="mt-2 max-w-2xl text-white/85">
              Gửi thông tin công trình, đội ngũ Hưng Phúc sẽ liên hệ để khảo sát và tư vấn báo giá chi tiết.
            </p>
          </div>
          <Link
            href="/lien-lac"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-primary transition hover:bg-gray-100"
          >
            <PhoneCall className="h-5 w-5" aria-hidden />
            Liên hệ tư vấn
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </main>
  );
}
