
import type { Metadata } from "next"
import { absoluteUrl, breadcrumbJsonLd, ORG_REF, pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/seo/json-ld"
import ContactInfo from "./components/contact-info"
import ContactForm from "./components/contact-form"

export const metadata: Metadata = pageMetadata({
  title: "Liên hệ tư vấn thiết kế & xây dựng",
  description: "Liên hệ Hưng Phúc để được tư vấn miễn phí về thiết kế kiến trúc, thi công xây dựng nhà phố, biệt thự, nhà xưởng. Hotline, email, địa chỉ văn phòng và form gửi yêu cầu.",
  path: "/lien-lac",
  keywords: ["liên hệ công ty xây dựng", "tư vấn xây nhà", "Hưng Phúc", "báo giá xây dựng"],
})

const ContactPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-contact-hero/10">
      <h1 className="sr-only">Liên hệ Công ty Xây dựng Hưng Phúc</h1>
      <JsonLd data={breadcrumbJsonLd([{ name: "Liên hệ", path: "/lien-lac" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ContactPage",
          url: absoluteUrl("/lien-lac"),
          name: "Liên hệ Hưng Phúc",
          about: ORG_REF,
          mainEntity: ORG_REF,
          inLanguage: "vi-VN",
        }}
      />
     <section className="py-4">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-5 gap-12 max-w-7xl mx-auto">
            {/* Contact Info - Left Side */}
            <div className="lg:col-span-2">
              <ContactInfo />
            </div>

            {/* Contact Form - Right Side */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ContactPage
