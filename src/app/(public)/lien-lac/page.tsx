
import type { Metadata } from "next"
import ContactInfo from "./components/contact-info"
import ContactForm from "./components/contact-form"

export const metadata: Metadata = {
  title: 'Liên hệ | Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc',
  description: 'Liên hệ với Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc để được tư vấn và hỗ trợ về các dự án xây dựng, thiết kế kiến trúc và các dịch vụ liên quan.',
  keywords: [
    "liên hệ công ty xây dựng",
    "Hưng Phúc",
    "tư vấn xây dựng",
    "hỗ trợ dự án",
    "địa chỉ công ty Hưng Phúc",
  ],
  openGraph: {
    title: 'Liên hệ | Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc',
    description: 'Liên hệ với Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc để được tư vấn và hỗ trợ về các dự án xây dựng, thiết kế kiến trúc và các dịch vụ liên quan.',
    url: 'https://hungphuc.com.vn/lien-lac',
    type: 'website',
    images: [
      {
        url: 'https://res.cloudinary.com/dizk1uwv3/image/upload/v1758176175/Hungphuc/banner-kien-tao-khong-gian-song-xanh-hien-dai.png',
        width: 1200,
        height: 630,
        alt: 'Liên hệ Công ty Xây dựng Hưng Phúc',
      },
    ],
  },
}

const ContactPage = () => {
  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-contact-hero/10">
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
