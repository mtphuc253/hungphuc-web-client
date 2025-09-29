import Image from "next/image"
import { COMPANY_INFO } from "@/lib/constants"
import { CheckCircle2 } from "lucide-react"

export function CompanyIntroduction() {
  return (
    <section 
      className="py-20 bg-gray-50"
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23d1d5db' fill-opacity='0.3' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E\")" }}
    >
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Company Information */}
          <div className="space-y-6">
            <div className="relative pb-4 mb-4">
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 text-balance">
                {COMPANY_INFO.fullName}
              </h2>
              <span className="absolute bottom-0 left-0 w-1/3 h-1 bg-primary rounded-full"></span>
            </div>

            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p className="text-lg">là đơn vị hoạt động chính trong lĩnh vực:</p>

              <ul className="space-y-2 text-base">
                <li className="flex items-start p-2 rounded-lg transition-colors hover:bg-gray-200">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Thiết kế Quy hoạch;</span>
                </li>
                <li className="flex items-start p-2 rounded-lg transition-colors hover:bg-gray-200">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Tư vấn lập dự án, Lập Báo cáo kinh tế kỹ thuật đầu tư xây dựng công trình;</span>
                </li>
                <li className="flex items-start p-2 rounded-lg transition-colors hover:bg-gray-200">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Tư vấn thiết kế và lập tổng dự toán công trình;</span>
                </li>
                <li className="flex items-start p-2 rounded-lg transition-colors hover:bg-gray-200">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Thẩm tra thiết kế và tổng dự toán công trình;</span>
                </li>
                <li className="flex items-start p-2 rounded-lg transition-colors hover:bg-gray-200">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Tư vấn đấu thầu;</span>
                </li>
                <li className="flex items-start p-2 rounded-lg transition-colors hover:bg-gray-200">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Tư vấn giám sát thi công xây dựng công trình;</span>
                </li>
                <li className="flex items-start p-2 rounded-lg transition-colors hover:bg-gray-200">
                  <CheckCircle2 className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                  <span>Quản lý, điều hành dự án.</span>
                </li>
              </ul>

              <div className="space-y-4 pt-4">
                <p>
                  Là đơn vị tư vấn quy tụ đội ngũ Kiến trúc sư và Kỹ sư các chuyên ngành nhiều kinh nghiệm, giàu lòng
                  yêu nghề, tinh thần trách nhiệm cao và nhiệt huyết với công việc, luôn hoàn thành công việc được giao
                  với chất lượng và hiệu quả tốt.
                </p>

                <div className="bg-primary/10 p-4 rounded-lg border-l-4 border-primary">
                  <p className="font-semibold text-primary-dark">
                    Với phương châm &quot;{COMPANY_INFO.motto}&quot;, Chúng tôi luôn tin tưởng sẽ làm hài lòng Quý khách hàng khi
                    sử dụng các dịch vụ của Công ty TNHH Tư vấn xây dựng.
                  </p>
                </div>

                <p>
                  Bằng Tâm thư này, Công ty chúng tôi cảm ơn sự quan tâm của Quý khách hàng đối với đơn vị chúng tôi
                  trong thời gian qua và rất mong nhận được sự quan tâm hợp tác trong thời gian tới để Công ty chúng tôi
                  có điều kiện đóng góp một phần công sức và trí tuệ của mình vào sự thành công của những dự án mà Quý
                  khách hàng làm chủ đầu tư.
                </p>

                <div className="flex justify-end pt-4 animate-fade-in-right animate-delay-500">
                  <div className="text-right">
                    <p className="font-medium">Xin trân trọng kính chào!</p>
                    <div className="text-right pt-4">
                      <p className="font-semibold">Giám đốc</p>
                      <p className="text-lg font-bold text-primary">{COMPANY_INFO.director}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Image */}
          <div className="relative">
            <div className="relative h-96 lg:h-[600px] rounded-xl overflow-hidden shadow-2xl transition-transform duration-500 hover:scale-105">
              <Image
                src="https://res.cloudinary.com/dizk1uwv3/image/upload/v1758202947/Cong-ty-Hung-phuc.jpg"
                alt="Công ty Hưng Phúc"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}