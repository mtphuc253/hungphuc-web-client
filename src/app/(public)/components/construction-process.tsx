import { SectionTitle } from "@/components/ui/section-title" 
import { Briefcase, PencilRuler, Handshake, FileText, Wrench, Building, ArrowRight } from "lucide-react"

const processSteps = [
  {
    step: "01",
    title: "Tiếp Nhận Thông Tin",
    description: [
      "Nhận đăng ký dịch vụ, kiểm tra quy hoạch, xin giấy phép.",
      "Lên phương án sơ bộ, gửi báo giá, chốt dự thảo hợp đồng.",
    ],
    icon: FileText,
  },
  {
    step: "02",
    title: "Tư Vấn & Báo Giá",
    description: [
      "Tư vấn nhu cầu, giải pháp thiết kế thi công.",
      "Đưa checklist phương án, báo giá thiết kế, khái toán thi công.",
    ],
    icon: Briefcase,
  },
  {
    step: "03",
    title: "Ký Kết Hợp Đồng",
    description: ["Soạn thảo, chỉnh sửa hợp đồng.", "Ký kết, nhận tiền cọc, khởi động dự án."],
    icon: Handshake,
  },
  {
    step: "04",
    title: "Thiết Kế Bản Vẽ",
    description: [
      "Thiết kế bản vẽ thi công chi tiết (mặt bằng, công năng, phối cảnh).",
      "Ước tính chi phí, tối ưu vật tư.",
      "Liên tục trao đổi với khách hàng để điều chỉnh.",
    ],
    icon: PencilRuler,
  },
  {
    step: "05",
    title: "Tổ Chức Thi Công",
    description: [
      "Chuẩn bị: định vị, mặt bằng, vật tư.",
      "Phần thô: móng, kết cấu, tường, mái.",
      "Hoàn thiện: sơn, trần, cửa, kính, ốp lát.",
      "Điện nước và thiết bị.",
    ],
    icon: Wrench,
  },
  {
    step: "06",
    title: "Nghiệm Thu & Bàn Giao",
    description: [
      "Bàn giao công trình.",
      "Khắc phục sự cố phát sinh tại chỗ.",
      "Thanh lý hợp đồng.",
      "Phổ biến bảo hành.",
      "Đưa công trình vào sử dụng.",
    ],
    icon: Building,
  },
]

export function ConstructionProcess() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(112,26,117,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(112,26,117,0.03)_1px,transparent_1px)] bg-[size:60px_60px] animate-pulse" />
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />

      <div className="container mx-auto px-4 relative">
        <SectionTitle>Quy trình tiếp nhận dịch vụ thi công</SectionTitle>

        <div className="mt-20 relative">
          {/* Desktop timeline */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-3 gap-8">
              {processSteps.map((item, index) => (
                <div key={item.step} className="relative">
                  {index < processSteps.length - 1 && index % 3 !== 2 && (
                    <div className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  )}

                  <div className="group relative" style={{ animationDelay: `${index * 0.2}s` }}>
                    {/* Outer glow effect */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition-all duration-500 animate-pulse"></div>

                    {/* Main border gradient */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-75 group-hover:opacity-100 transition-all duration-300"></div>

                    {/* Card content */}
                    <div className="relative bg-card border-2 border-transparent rounded-xl p-8 h-full transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-3 hover:scale-105">
                      <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-card-foreground to-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-2xl group-hover:animate-pulse-glow transition-all duration-300 border-4 border-background">
                        {item.step}
                      </div>

                      <div className="flex justify-center mb-8 mt-4">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-md group-hover:blur-lg transition-all duration-300"></div>
                          <div className="relative w-24 h-24 bg-gradient-to-br from-muted to-muted/50 rounded-3xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-500 group-hover:animate-float border-2 border-border group-hover:border-primary/30">
                            <item.icon className="w-12 h-12 text-primary group-hover:text-primary group-hover:scale-110 transition-all duration-300" />
                          </div>
                        </div>
                      </div>

                      <h3 className="text-2xl font-bold text-card-foreground mb-6 text-center text-balance group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                        {item.title}
                      </h3>

                      <div className="space-y-4">
                        {item.description.map((desc, i) => (
                          <div key={i} className="flex items-start gap-4 group/item">
                            <div className="w-3 h-3 bg-gradient-to-r from-primary to-secondary rounded-full mt-2 flex-shrink-0 group-hover:animate-pulse transition-all duration-300 shadow-lg" />
                            <p className="text-muted-foreground leading-relaxed group-hover:text-card-foreground transition-all duration-300 text-sm">
                              {desc}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:hidden space-y-12">
            {processSteps.map((item, index) => (
              <div key={item.step} className="relative">
                {/* Vertical connecting line */}
                {index < processSteps.length - 1 && (
                  <div className="absolute left-8 top-full w-0.5 h-12 bg-gradient-to-b from-primary to-secondary opacity-50"></div>
                )}

                {/* Enhanced mobile card */}
                <div className="group relative" style={{ animationDelay: `${index * 0.15}s` }}>
                  <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-2xl blur-sm opacity-30 group-hover:opacity-60 transition-all duration-500"></div>
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary rounded-xl opacity-75 group-hover:opacity-100 transition-all duration-300"></div>

                  <div className="relative bg-card border-2 border-transparent rounded-xl p-6 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2">
                    <div className="flex items-start gap-6">
                      {/* Step number */}
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl shadow-2xl group-hover:animate-pulse-glow flex-shrink-0 border-4 border-background">
                        {item.step}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-card-foreground mb-4 group-hover:bg-gradient-to-r group-hover:from-primary group-hover:to-secondary group-hover:bg-clip-text group-hover:text-transparent transition-all duration-500">
                          {item.title}
                        </h3>

                        <div className="space-y-3">
                          {item.description.map((desc, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="w-2 h-2 bg-gradient-to-r from-primary to-secondary rounded-full mt-2 flex-shrink-0" />
                              <p className="text-muted-foreground leading-relaxed text-sm group-hover:text-card-foreground transition-colors duration-300">
                                {desc}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Icon */}
                      <div className="w-16 h-16 bg-gradient-to-br from-muted to-muted/50 rounded-2xl flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-500 border-2 border-border group-hover:border-primary/30 flex-shrink-0">
                        <item.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-all duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-24 flex justify-center items-center gap-4">
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full animate-pulse" />
          <div className="w-4 h-4 bg-gradient-to-r from-primary to-secondary rounded-full animate-pulse" />
          <div className="w-16 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  )
}
