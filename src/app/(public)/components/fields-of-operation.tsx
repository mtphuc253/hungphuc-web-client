import Image from "next/image"
import { SectionTitle } from "@/components/ui/section-title"

const fields = [
  {
    title: "Xây dựng",
    description: "Xây dựng nhà các loại; công trình đường sắt, đường bộ, công nghiệp, công ích; đường dây, trạm biến thế 35KV; nạo vét kênh, sông, mương, rạch; phá dỡ, san lấp mặt bằng, trang trí nội thất, xử lý nước cấp – nước thải.",
    imageUrl: "https://res.cloudinary.com/dizk1uwv3/image/upload/v1758531624/Hungphuc/linh-vuc-xay-dung.jpg",
  },
  {
    title: "Lắp đặt hệ thống",
    description: "Lắp đặt hệ thống điện, cấp thoát nước, lò sưởi, điều hoà, phòng cháy – chữa cháy, chống sét, cơ điện lạnh, máy móc công nghiệp.",
    imageUrl: "https://res.cloudinary.com/dizk1uwv3/image/upload/v1758531623/Hungphuc/lap-dat-he-thong-dien.webp",
  },
  {
    title: "Thiết kế",
    description: "Thiết kế kiến trúc, xây dựng dân dụng, công nghiệp, cầu đường bộ, quy hoạch, công trình thuỷ lợi, xử lý nước cấp – nước thải.",
    imageUrl: "https://res.cloudinary.com/dizk1uwv3/image/upload/v1758531624/Hungphuc/linh-vuc-thiet-ke-xay-dung.jpg",
  },
  {
    title: "Giám sát",
    description: "Giám sát thi công xây dựng, hoàn thiện công trình dân dụng, công nghiệp, cấp thoát nước, điện, cơ điện công trình dân dụng và công nghiệp, giao thông cầu đường bộ.",
    imageUrl: "https://res.cloudinary.com/dizk1uwv3/image/upload/v1758531623/Hungphuc/linh-vuc-giam-sat.jpg",
  },
  {
    title: "Khảo sát",
    description: "Khảo sát địa chất, địa hình.",
    imageUrl: "https://res.cloudinary.com/dizk1uwv3/image/upload/v1758531623/Hungphuc/linh-vuc-khao-sat.jpg",
  },
  {
    title: "Kiểm định & Quản lý dự án",
    description: "Kiểm định chất lượng công trình, thẩm tra thiết kế, quản lý dự án, lập dự án đầu tư, tư vấn đấu thầu, tư vấn tài chính – kế toán.",
    imageUrl: "https://res.cloudinary.com/dizk1uwv3/image/upload/v1758531623/Hungphuc/linh-vuc-kiem-dinh-va-quan-ly-du-an.webp",
  },
];

function FieldCard({ title, description, imageUrl }: { title: string; imageUrl: string; description: string; }) {
  return (
    <div className="relative rounded-lg shadow-lg overflow-hidden group h-80 transform transition-transform duration-500 hover:-translate-y-2 hover:shadow-2xl">
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes="(max-width: 768px) 100vw, 400px"
        style={{ objectFit: "cover" }}
        className="transition-transform duration-500 group-hover:scale-110"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-base mt-2 line-clamp-3 duration-300">{description}</p>
      </div>
    </div>
  )
}

export function FieldsOfOperation() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <SectionTitle>Lĩnh vực hoạt động</SectionTitle>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {fields.map((field) => (
            <FieldCard key={field.title} {...field} />
          ))}
        </div>
      </div>
    </section>
  );
}
