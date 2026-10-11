import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, PhoneCall } from "lucide-react";
import { JsonLd } from "@/components/seo/json-ld";
import { absoluteUrl, apiGet, breadcrumbJsonLd, ORG_REF, pageMetadata, stripHtml, truncate } from "@/lib/seo";
import { slugify } from "@/components/admin/format";

export const revalidate = 300;

interface PricingDetail {
  id: string;
  title: string;
  content: string | null;
}
interface PricingCategory {
  id: string;
  title: string;
  description: string | null;
  details: PricingDetail[];
}

const getPricing = async () =>
  (await apiGet<{ data: PricingCategory[] }>("/api/pricings/categories"))?.data ?? [];

export const metadata: Metadata = pageMetadata({
  title: "Bảng giá thiết kế & thi công xây dựng mới nhất",
  description:
    "Bảng giá thiết kế kiến trúc, xây nhà phần thô và trọn gói mới nhất của Hưng Phúc. Đơn giá minh bạch, chi tiết theo từng hạng mục – liên hệ để nhận báo giá chính xác cho công trình của bạn.",
  path: "/bang-gia",
  keywords: ["bảng giá xây dựng", "đơn giá thiết kế nhà", "giá xây nhà trọn gói", "giá xây nhà phần thô", "báo giá xây dựng"],
});

export default async function PricingPage() {
  const categories = await getPricing();

  const serviceLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "Thiết kế kiến trúc & thi công xây dựng",
    serviceType: "Thiết kế và thi công xây dựng",
    provider: ORG_REF,
    areaServed: { "@type": "Country", name: "Việt Nam" },
    url: absoluteUrl("/bang-gia"),
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Bảng giá Hưng Phúc",
      itemListElement: categories.map((c) => ({
        "@type": "OfferCatalog",
        name: c.title,
        description: c.description ? truncate(c.description, 300) : undefined,
        itemListElement: c.details.map((d) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: d.title,
            description: d.content ? truncate(stripHtml(d.content), 300) : undefined,
          },
        })),
      })),
    },
  };

  return (
    <main className="min-h-screen bg-gray-50/50 py-12 sm:py-16">
      <JsonLd data={breadcrumbJsonLd([{ name: "Bảng giá", path: "/bang-gia" }])} />
      {categories.length > 0 && <JsonLd data={serviceLd} />}

      <div className="container mx-auto px-4">
        <nav aria-label="Breadcrumb" className="mb-6 text-sm text-gray-500">
          <ol className="flex items-center gap-1">
            <li>
              <Link href="/" className="hover:text-primary">
                Trang chủ
              </Link>
            </li>
            <ChevronRight className="h-3.5 w-3.5" aria-hidden />
            <li aria-current="page" className="text-gray-700">
              Bảng giá
            </li>
          </ol>
        </nav>

        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">Bảng giá thiết kế & thi công</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-gray-600">
            Đơn giá tham khảo được cập nhật thường xuyên. Mỗi công trình có đặc thù riêng – hãy liên hệ để Hưng Phúc khảo sát và gửi báo giá
            chi tiết, minh bạch.
          </p>
        </header>

        {categories.length === 0 ? (
          <p className="py-20 text-center text-gray-500">Bảng giá đang được cập nhật. Vui lòng liên hệ để nhận báo giá.</p>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-40 lg:self-start" aria-label="Danh mục bảng giá">
              <ul className="flex gap-2 overflow-x-auto rounded-lg border bg-white p-2 lg:flex-col">
                {categories.map((c) => (
                  <li key={c.id}>
                    <a
                      href={`#${slugify(c.title)}`}
                      className="block whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary lg:whitespace-normal"
                    >
                      {c.title}
                    </a>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="space-y-12">
              {categories.map((c) => (
                <section key={c.id} id={slugify(c.title)} className="scroll-mt-40 rounded-lg border bg-white p-6 shadow-sm sm:p-8">
                  <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{c.title}</h2>
                  {c.description && <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-600">{c.description}</p>}
                  <div className="mt-6 space-y-8">
                    {c.details.map((d) => (
                      <div key={d.id}>
                        <h3 className="mb-3 text-xl font-semibold text-primary">{d.title}</h3>
                        {d.content && (
                          <div
                            className="prose prose-slate max-w-none prose-table:text-sm prose-th:bg-gray-50 prose-img:rounded-lg"
                            dangerouslySetInnerHTML={{ __html: d.content }}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              <div className="flex flex-col items-center gap-4 rounded-lg bg-primary px-6 py-10 text-center text-white sm:flex-row sm:justify-between sm:text-left">
                <div>
                  <p className="text-2xl font-bold">Cần báo giá chính xác cho công trình của bạn?</p>
                  <p className="mt-1 text-white/80">Kỹ sư Hưng Phúc sẽ khảo sát và tư vấn miễn phí.</p>
                </div>
                <Link
                  href="/lien-lac"
                  className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 font-semibold text-primary hover:bg-gray-100"
                >
                  <PhoneCall className="h-5 w-5" aria-hidden /> Nhận báo giá
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
