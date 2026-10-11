import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EstimateSection } from "@/components/estimate/estimate-section";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, breadcrumbJsonLd, ORG_REF, pageMetadata } from "@/lib/seo";
import { getEstimatePublicConfig } from "@/lib/estimate-server";

export const revalidate = 60;

export const metadata: Metadata = pageMetadata({
  title: "Dự toán chi phí xây nhà online bằng AI – miễn phí",
  description:
    "Tính chi phí xây nhà phố, biệt thự, nhà cấp 4 trong 3 phút: diện tích quy đổi từng hạng mục theo đơn giá thực tế của Hưng Phúc, trợ lý AI giải thích và kỹ sư xác nhận miễn phí.",
  path: "/du-toan",
  keywords: ["dự toán chi phí xây nhà", "tính chi phí xây nhà", "chi phí xây nhà phố", "báo giá xây nhà trọn gói", "dự toán AI"],
});

export default async function EstimatePage() {
  const config = await getEstimatePublicConfig();
  // Công cụ đang tắt (chưa nhập đơn giá) -> chuyển sang trang liên hệ thay vì 404
  if (!config?.enabled) redirect("/lien-lac");

  return (
    <main>
      <JsonLd data={breadcrumbJsonLd([{ name: "Dự toán chi phí xây nhà", path: "/du-toan" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Dự toán chi phí xây nhà Hưng Phúc",
          url: absoluteUrl("/du-toan"),
          applicationCategory: "BusinessApplication",
          operatingSystem: "Web",
          inLanguage: "vi-VN",
          isAccessibleForFree: true,
          offers: { "@type": "Offer", price: 0, priceCurrency: "VND" },
          provider: ORG_REF,
        }}
      />
      <EstimateSection config={config} headingLevel="h1" id="cong-cu-du-toan" />
    </main>
  );
}
