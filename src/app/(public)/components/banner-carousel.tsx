"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, MoveRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Banner } from "@/types"

interface BannerCarouselProps {
  banners: Banner[];
}

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length === 0) return
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [banners.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-[600px] bg-gray-200 flex items-center justify-center">
        <div className="text-lg text-gray-600">{"Không có banner để hiển thị"}</div>
      </div>
    )
  }

  return (
    <section className="relative w-full h-[680px] overflow-hidden" aria-roledescription="carousel" aria-label="Công trình tiêu biểu">
      <div className="relative w-full h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            aria-hidden={index !== currentIndex}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={banner.imageUrl}
              alt={banner.title || "Công trình do Hưng Phúc thiết kế và thi công"}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
            />
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0 flex items-end pb-24">
              <div className="container mx-auto px-4 md:px-8 lg:px-16">
                <div className="max-w-4xl text-white space-y-6">
                  {banner.title && (
                    <p className="text-3xl md:text-4xl lg:text-5xl font-bold leading-snug animate-fade-in-down">
                      {banner.title}
                    </p>
                  )}
                  <Button asChild size="lg" className="animate-fade-in-up animation-delay-500 bg-white text-primary border border-primary hover:bg-gray-100">
                    <Link href={banner.link || "/gioi-thieu"} tabIndex={index === currentIndex ? 0 : -1}>
                      Tìm hiểu thêm <MoveRight className="ml-2 h-5 w-5" aria-hidden />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white h-12 w-12"
        onClick={goToPrevious}
        aria-label="Banner trước"
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white h-12 w-12"
        onClick={goToNext}
        aria-label="Banner tiếp theo"
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white scale-125" : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Chuyển tới banner ${index + 1}`}
            aria-current={index === currentIndex}
          />
        ))}
      </div>
    </section>
  )
}
