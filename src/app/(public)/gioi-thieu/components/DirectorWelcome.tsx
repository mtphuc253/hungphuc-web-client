import { SectionTitle } from "@/components/ui/section-title"
import Image from "next/image"

export function DirectorWelcome() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/abstract-geometric-light-blue.png')] opacity-5"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100/40 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-slate-100/40 to-transparent rounded-full blur-3xl"></div>

      <div className="container mx-auto px-4 relative">
        <SectionTitle>Lời chào từ Tổng Giám đốc</SectionTitle>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16 items-start">
          {/* Content - Now takes more space (3/5) */}
          <div className="lg:col-span-3 space-y-8 animate-fade-in-up">
            <div className="prose prose-lg max-w-none text-slate-700 leading-relaxed">
              <div className="space-y-6">
                <p className="text-xl leading-relaxed font-medium text-slate-800 border-l-4 border-primary pl-6 bg-white/60 backdrop-blur-sm rounded-r-lg py-4 shadow-sm">
                  Trước hết, cho phép tôi thay mặt Công ty TNHH Tư vấn Đầu tư Xây dựng Hưng Phúc gửi lời chào trân trọng
                  và lời cảm ơn chân thành đến Quý vị đã quan tâm, tin tưởng và đồng hành cùng chúng tôi trong suốt thời
                  gian qua.
                </p>

                <p className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-slate-200/50">
                  Trải qua quá trình hình thành và phát triển, Hưng Phúc đã không ngừng nỗ lực để khẳng định vị thế của
                  mình trong lĩnh vực tư vấn, thiết kế và quản lý dự án xây dựng. Với đội ngũ kiến trúc sư, kỹ sư giàu
                  kinh nghiệm, nhiệt huyết và trách nhiệm, chúng tôi luôn lấy{" "}
                  <span className="font-semibold text-primary">&quot;Uy tín – Chất lượng – Hiệu quả – Phát triển&quot;</span> làm
                  kim chỉ nam cho mọi hoạt động.
                </p>

                <p className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-slate-200/50">
                  Chúng tôi tin rằng mỗi công trình không chỉ là sản phẩm xây dựng mà còn là tâm huyết, trí tuệ và niềm
                  tin mà Hưng Phúc cùng Quý khách hàng kiến tạo nên. Vì vậy, sự hài lòng của Quý khách hàng chính là
                  thành công lớn nhất của chúng tôi.
                </p>

                <p className="bg-white/60 backdrop-blur-sm rounded-lg p-6 shadow-sm border border-slate-200/50">
                  Trong chặng đường sắp tới, Hưng Phúc mong muốn tiếp tục nhận được sự hợp tác, đồng hành và tin tưởng
                  của Quý khách hàng, Quý đối tác để cùng nhau tạo nên những công trình bền vững, góp phần xây dựng một
                  tương lai phát triển thịnh vượng.
                </p>
              </div>

              <div className="flex justify-end pt-4 animate-fade-in-right animate-delay-500">
                <div className="text-right">
                  <p className="font-medium">Xin trân trọng kính chào!</p>
                  <div className="text-right pt-4">
                    <p className="font-semibold">Tổng Giám đốc</p>
                    <p className="text-lg font-bold text-primary">Mai Tấn Trinh</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Director Image - Now smaller (2/5) with professional background */}
          <div className="lg:col-span-2 relative flex justify-center items-center animate-slide-in-right">
            <div className="relative w-full max-w-sm">
              {/* Professional background decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-3xl transform rotate-3 shadow-2xl"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 via-blue-500/10 to-transparent rounded-3xl transform -rotate-2"></div>
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-blue-500/5 to-transparent rounded-3xl blur-xl"></div>

              {/* Geometric decoration */}
              <div className="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary to-blue-600 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-tr from-slate-600 to-slate-400 rounded-full opacity-15 blur-xl"></div>

              {/* Main image container */}
              <div className="relative bg-gradient-to-b from-slate-100 to-slate-200 rounded-3xl p-8 shadow-2xl border border-slate-300/50">
                <div className="relative w-full h-[400px] lg:h-[500px]">
                  <Image
                    src="https://res.cloudinary.com/dizk1uwv3/image/upload/v1759039284/Hungphuc/giam-doc-hung-phuc.png"
                    alt="Tổng Giám đốc Mai Tấn Trinh"
                    fill
                    className="object-contain object-bottom drop-shadow-2xl"
                    sizes="(max-width: 768px) 80vw, (max-width: 1024px) 40vw, 400px"
                    priority
                  />
                </div>

                {/* Professional badge */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-slate-200/50">
                  <p className="text-sm font-semibold text-slate-800 text-center">Mai Tấn Trinh</p>
                  <p className="text-xs text-slate-600 text-center">Tổng Giám đốc</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
