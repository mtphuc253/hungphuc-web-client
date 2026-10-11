import type { Metadata } from "next"
import { absoluteUrl, breadcrumbJsonLd, ORG_REF, pageMetadata } from "@/lib/seo"
import { JsonLd } from "@/components/seo/json-ld"
import { DirectorWelcome } from "./components/DirectorWelcome"
import { CompanyInfo } from "./components/CompanyInfo"


export const metadata: Metadata = pageMetadata({
  title: "Giới thiệu công ty",
  description: "Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc – đơn vị uy tín trong thiết kế kiến trúc, thi công xây dựng và tư vấn giám sát công trình tại TP.HCM. Tìm hiểu tầm nhìn, sứ mệnh và đội ngũ.",
  path: "/gioi-thieu",
  keywords: ["giới thiệu công ty xây dựng", "Hưng Phúc", "công ty tư vấn xây dựng", "thiết kế xây dựng", "Mai Tấn Trinh"],
})

const GioiThieuPage = () => {
  return (
    <main className="min-h-screen">
      <h1 className="sr-only">Giới thiệu Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc</h1>
      <JsonLd data={breadcrumbJsonLd([{ name: "Giới thiệu", path: "/gioi-thieu" }])} />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "AboutPage",
          url: absoluteUrl("/gioi-thieu"),
          name: "Giới thiệu Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc",
          about: ORG_REF,
          mainEntity: ORG_REF,
          inLanguage: "vi-VN",
        }}
      />
      <DirectorWelcome />
      <CompanyInfo />
    </main>
  )
}

export default GioiThieuPage
