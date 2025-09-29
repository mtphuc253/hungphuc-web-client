"use client"

import Link from "next/link"
import Image from "next/image"
import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { PUBLIC_NAV_ITEMS } from "@/lib/constants"
import { MapPin, Phone, Mail, ArrowUpRight } from "lucide-react"
import Script from "next/script"

export function Footer() {
  const settings = useSelector((state: RootState) => state.settings.settings)

  const quickLinks = PUBLIC_NAV_ITEMS.slice(0, 5)
  const operationLinks = [
    { label: "Thiết Kế Kiến Trúc", href: "/architecture" },
    { label: "Thi Công Xây Dựng", href: "/construction" },
    { label: "Tư Vấn Đầu Tư", href: "/consulting" },
    { label: "Sửa Chữa & Cải Tạo", href: "/renovation" },
    { label: "Xin Phép Xây Dựng", href: "/licensing" },
  ]

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc",
    alternateName: "HPHC CO.,LTD",
    url: "https://www.yourwebsite.com", // Replace with your actual domain
    logo: "https://res.cloudinary.com/dizk1uwv3/image/upload/v1758561417/Hungphuc/logo-hung-phuc-ngang.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: settings?.phone || "",
      contactType: "customer service",
      email: settings?.email || "",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: settings?.address || "",
      addressLocality: "Thành phố Hồ Chí Minh", // Or more specific locality
      addressRegion: "VN-SG",
      postalCode: "700000",
      addressCountry: "VN",
    },
  }

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <footer className="relative text-white min-h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://res.cloudinary.com/dizk1uwv3/image/upload/v1758531624/Hungphuc/linh-vuc-xay-dung.jpg')",
          }}
          aria-hidden="true"
        />

        {/* Enhanced gradient overlays */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
          aria-hidden="true"
        />

        {/* Subtle pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
          aria-hidden="true"
        />

        <div className="relative container mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
            <div className="space-y-8 lg:col-span-1">
              <Link href="/" className="inline-block group" aria-label="Về trang chủ Hưng Phúc">
                <div className="relative overflow-hidden rounded-lg bg-white backdrop-blur-sm p-4 transition-all duration-300 group-hover: group-hover:scale-105">
                  <Image
                    src="https://res.cloudinary.com/dizk1uwv3/image/upload/v1758561417/Hungphuc/logo-hung-phuc-ngang.png"
                    alt="Hưng Phúc Logo"
                    width={200}
                    height={64}
                    priority
                  />
                </div>
              </Link>

              <address className="space-y-5 not-italic">
                <div className="flex items-start group cursor-pointer">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <MapPin className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-200 font-medium mb-1">Địa chỉ</p>
                    <p className="text-gray-200 leading-relaxed">{settings?.address || "Loading..."}</p>
                  </div>
                </div>

                <div className="flex items-center group cursor-pointer">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Phone className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-200 font-medium mb-1">Điện thoại</p>
                    <a
                      href={`tel:${settings?.phone}`}
                      className="text-gray-200 hover:text-white transition-colors text-lg font-medium"
                    >
                      {settings?.phone || "Loading..."}
                    </a>
                  </div>
                </div>

                <div className="flex items-center group cursor-pointer">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300">
                    <Mail className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-200 font-medium mb-1">Email</p>
                    <a href={`mailto:${settings?.email}`} className="text-gray-200 hover:text-white transition-colors">
                      {settings?.email || "Loading..."}
                    </a>
                  </div>
                </div>
              </address>
            </div>

            <nav className="space-y-6" aria-labelledby="quick-links-heading">
              <div className="relative">
                <h3 id="quick-links-heading" className="text-2xl font-bold text-white mb-2">
                  Liên kết nhanh
                </h3>
                <div className="w-12 h-1 bg-white rounded-full" />
              </div>
              <ul className="space-y-4">
                {quickLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center text-gray-300 hover:text-white transition-all duration-300"
                    >
                      <ArrowUpRight
                        className="w-4 h-4 mr-3 text-gray-100 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                        aria-hidden="true"
                      />
                      <span className="group-hover:translate-x-2 transition-transform duration-300">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <nav className="space-y-6" aria-labelledby="operations-heading">
              <div className="relative">
                <h3 id="operations-heading" className="text-2xl font-bold text-white mb-2">
                  Lĩnh vực hoạt động
                </h3>
                <div className="w-12 h-1 bg-white rounded-full" />
              </div>
              <ul className="space-y-4">
                {operationLinks.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="group flex items-center text-gray-300 hover:text-white transition-all duration-300"
                    >
                      <ArrowUpRight
                        className="w-4 h-4 mr-3 text-gray-100 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                        aria-hidden="true"
                      />
                      <span className="group-hover:translate-x-2 transition-transform duration-300">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="space-y-6" aria-labelledby="location-heading">
              <div className="relative">
                <h3 id="location-heading" className="text-2xl font-bold text-white mb-2">
                  Vị trí
                </h3>
                <div className="w-12 h-1 bg-white rounded-full" />
              </div>
              <div className="relative group">
                <div
                  className="absolute inset-0 bg-primary/20 rounded-xl blur-xl group-hover:blur-2xl transition-all duration-300"
                  aria-hidden="true"
                />
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-2xl border border-white/20 group-hover:border-white/40 transition-all duration-300">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.673895423586!2d106.67605357570379!3d10.836248858086057!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528bd0c313e31%3A0x468be354b1419881!2zQ8O0bmcgVHkgVG5oaCBUxrAgVuG6pW4gxJDhuqd1IFTGsCBYw6J5IEThu7FuZyBIxrBuZyBQaMO6Yw!5e0!3m2!1svi!2s!4v1758714103859!5m2!1svi!2s"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen={true}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="rounded-xl"
                    title="Vị trí Công ty Hưng Phúc trên Google Maps"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative border-t border-white/20">
          <div
            className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-800/90 to-slate-900/90"
            aria-hidden="true"
          />
          <div className="relative container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <p className="text-gray-400 text-center md:text-left">
                Copyright © 2025 <span className="text-white font-semibold">HPHC CO.,LTD</span> All rights reserved.
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Chính sách bảo mật
                </Link>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Điều khoản sử dụng
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
