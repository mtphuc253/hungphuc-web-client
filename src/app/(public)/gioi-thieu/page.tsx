import type { Metadata } from "next"
import { DirectorWelcome } from "./components/DirectorWelcome"
import { CompanyInfo } from "./components/CompanyInfo"


export const metadata: Metadata = {
  title: 'Giới thiệu | Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc',
  description: 'Tìm hiểu về Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc, đơn vị uy tín trong lĩnh vực thiết kế, thi công, và tư vấn xây dựng tại Việt Nam.',
  keywords: [
    "giới thiệu công ty xây dựng",
    "Hưng Phúc",
    "công ty tư vấn xây dựng",
    "thiết kế xây dựng",
    "quản lý dự án",
    "Mai Tấn Trinh",
  ],
  openGraph: {
    title: 'Giới thiệu | Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc',
    description: 'Tìm hiểu về Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc, đơn vị uy tín trong lĩnh vực thiết kế, thi công, và tư vấn xây dựng tại Việt Nam.',
    url: 'https://hungphuc.com.vn/gioi-thieu',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dizk1uwv3/image/upload/v1758176175/Hungphuc/banner-kien-tao-khong-gian-song-xanh-hien-dai.png',
        width: 1200,
        height: 630,
        alt: 'Giới thiệu Công ty Xây dựng Hưng Phúc',
      },
    ],
  },
}

const GioiThieuPage = () => {
  return (
    <main className="min-h-screen">
      <DirectorWelcome />
      <CompanyInfo />
    </main>
  )
}

export default GioiThieuPage
