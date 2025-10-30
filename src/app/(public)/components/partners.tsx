import Image from "next/image";
import Link from "next/link";
import type { Partner } from "@/types";
import { SectionTitle } from "@/components/ui/section-title";

interface PartnersProps {
  partners: Partner[];
}

export function Partners({ partners }: PartnersProps) {
  if (!partners || partners.length === 0) return null;

  return (
    <section
      className="py-20 bg-white"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      }}
    >
      <div className="container mx-auto px-4">
        <SectionTitle>Đối tác của chúng tôi</SectionTitle>

        <div className="relative">
          {/* Gradient trái */}
          <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10" />
          {/* Gradient phải */}
          <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10" />

          {/* Container cho animation */}
          <div className="relative overflow-x-hidden group">
            <div
              className="flex items-start [animation:marquee_15s_linear_infinite] group-hover:[animation-play-state:paused]"
            >
              {[...partners, ...partners].map((partner, index) => (
                <div
                  key={`${partner.id}-${index}`}
                  className="flex-shrink-0 mx-8 text-center"
                >
                  <Link
                    href={partner.websiteUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block transition-transform duration-300 ease-in-out transform hover:scale-105"
                    aria-label={`Link to ${partner.name}`}
                  >
                    <div className="relative h-24 w-48">
                      <Image
                        src={partner.logoUrl}
                        alt={partner.name}
                        fill
                        sizes="(max-width: 768px) 150px, 200px"
                        style={{ objectFit: "contain" }}
                      />
                    </div>
                    <p className="mt-4 text-sm font-medium text-gray-700 w-48">
                      {partner.name}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
