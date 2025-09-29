import { SectionTitle } from "@/components/ui/section-title"
import Image from "next/image"

const companyDetails = [
  { label: "Mã số thuế", value: "0309536290" },
  { label: "Địa chỉ Thuế", value: "Số 90/10 An Nhơn, Phường Gò Vấp, TP Hồ Chí Minh, Việt Nam" },
  { label: "Địa chỉ", value: "Số 90/10 An Nhơn, Phường Gò Vấp, TP Hồ Chí Minh, Việt Nam" },
  { label: "Tình trạng", value: "Đang hoạt động" },
  { label: "Tên quốc tế", value: "HUNG PHUC CONSTRUCTION INVESTMENT CONSULTANT COMPANY LIMITED" },
  { label: "Tên viết tắt", value: "HPHC CO.,LTD" },
  { label: "Người đại diện", value: "MAI TẤN TRINH" },
]

export function CompanyInfo() {
  return (
    <section className="py-20 sm:py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dizk1uwv3/image/upload/v1758531623/Hungphuc/linh-vuc-giam-sat.jpg')] opacity-3"></div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-16">
          {/* Main Content - Takes 3/4 of the space */}
          <div className="xl:col-span-3 space-y-16">
            {/* About Us Section */}
            <div className="animate-fade-in-up">
              <SectionTitle>Về chúng tôi</SectionTitle>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed text-slate-700 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
                    Kể từ khi chính thức thành lập vào ngày{" "}
                    <span className="font-semibold text-primary">04 tháng 01 năm 2010</span>, Công ty TNHH Tư vấn Đầu tư
                    Xây dựng Hưng Phúc đã không ngừng khẳng định vị thế là một đơn vị tư vấn uy tín trong lĩnh vực xây
                    dựng tại Việt Nam.
                  </p>
                  <p className="text-lg leading-relaxed text-slate-700 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
                    Trụ sở đặt tại Quận Gò Vấp, TP. Hồ Chí Minh – nơi khởi nguồn cho những ý tưởng kiến tạo, Hưng Phúc
                    là ngôi nhà chung của đội ngũ kiến trúc sư và kỹ sư giàu kinh nghiệm, đầy tâm huyết và luôn tận tụy
                    với nghề.
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-blue-500/5 rounded-2xl transform rotate-3"></div>
                  <Image
                    src="https://res.cloudinary.com/dizk1uwv3/image/upload/v1758176175/Hungphuc/banner-kien-tao-khong-gian-song-xanh-hien-dai.png"
                    alt="Văn phòng Hưng Phúc"
                    width={400}
                    height={300}
                    className="relative rounded-2xl shadow-xl hover-lift object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Fields of Operation */}
            <div className="animate-fade-in-up">
              <SectionTitle>Lĩnh vực hoạt động</SectionTitle>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                <div className="space-y-6">
                  <p className="text-lg leading-relaxed text-slate-700 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
                    Chúng tôi cung cấp các giải pháp toàn diện trong lĩnh vực tư vấn và quản lý dự án, bao gồm:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      "Thiết kế quy hoạch, kiến trúc và công trình",
                      "Lập dự án đầu tư, báo cáo kinh tế – kỹ thuật xây dựng",
                      "Tư vấn thiết kế và lập tổng dự toán công trình",
                      "Thẩm tra thiết kế, thẩm định dự toán",
                      "Tư vấn đấu thầu, giám sát thi công",
                      "Quản lý và điều hành dự án xây dựng",
                    ].map((service, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-lg p-4 border border-primary/10 hover-lift"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-sm font-medium text-slate-700">{service}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative h-full">
                  <div className="absolute inset-0 bg-gradient-to-bl from-slate-800/10 to-slate-600/5 rounded-2xl transform -rotate-2"></div>
                  <Image
                    src="https://res.cloudinary.com/dizk1uwv3/image/upload/v1758531623/Hungphuc/linh-vuc-giam-sat.jpg"
                    alt="Dự án xây dựng"
                    fill
                    className="relative rounded-2xl shadow-xl hover-lift object-cover"
                  />
                </div>
              </div>
              <p className="mt-8 text-lg leading-relaxed text-slate-700 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50 text-center">
                Mỗi công trình Hưng Phúc tham gia đều là sự kết tinh của tri thức, sáng tạo và trách nhiệm, nhằm mang
                lại giá trị bền vững và sự hài lòng cao nhất cho khách hàng.
              </p>
            </div>

            {/* Vision, Mission, Core Values */}
            <div className="animate-fade-in-up">
              <SectionTitle>Tầm nhìn – Sứ mệnh – Giá trị cốt lõi</SectionTitle>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                <div className="space-y-8">
                  <div className="flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
                    <Image
                      src="https://res.cloudinary.com/dizk1uwv3/image/upload/v1758176060/Hungphuc/logo-hung-phuc.png"
                      alt="Logo Công ty Hưng Phúc"
                      width={80}
                      height={80}
                      className="rounded-lg shadow-md flex-shrink-0"
                    />
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-2">Phương châm</h3>
                      <p className="text-lg font-semibold text-gradient">
                        &quot;Uy tín – Chất lượng – Hiệu quả – Phát triển&quot;
                      </p>
                    </div>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
                    <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                      <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                      Tầm nhìn
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Trở thành đơn vị tư vấn xây dựng hàng đầu, góp phần vào sự phát triển hạ tầng và kiến tạo diện mạo
                      đô thị bền vững.
                    </p>
                  </div>

                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
                    <h4 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                      <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                      Sứ mệnh
                    </h4>
                    <p className="text-slate-700 leading-relaxed">
                      Đồng hành cùng khách hàng để tạo nên những công trình không chỉ bền vững về chất lượng mà còn mang
                      dấu ấn văn hóa và giá trị lâu dài.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-sm border border-slate-200/50">
                    <h4 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                      <div className="w-1 h-6 bg-primary rounded-full mr-3"></div>
                      Giá trị cốt lõi
                    </h4>
                    <div className="space-y-4">
                      {[
                        "Chất lượng là nền tảng",
                        "Chính trực trong mọi hoạt động",
                        "Trân trọng và phát huy nhân tài",
                        "Sáng tạo, đổi mới không ngừng",
                        "Trách nhiệm với cộng đồng và xã hội",
                      ].map((value, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-3 bg-gradient-to-r from-primary/5 to-transparent rounded-lg"
                        >
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                          <p className="text-slate-700 font-medium">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-blue-500/5 rounded-2xl transform rotate-1"></div>
                    <Image
                      src="https://res.cloudinary.com/dizk1uwv3/image/upload/w_900,q_auto,f_auto/v1759057998/Hungphuc/nhan-su-hung-phuc-khao-sat-cong-trinh.jpg"
                      alt="Đội ngũ Hưng Phúc"
                      width={450}
                      height={250}
                      className="relative rounded-2xl shadow-xl hover-lift object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information Table - 1/4 of the space */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 animate-slide-in-right">
              <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-blue-600 text-white p-6">
                  <h3 className="text-xl font-bold text-center">Thông tin chung</h3>
                </div>

                <div className="divide-y divide-slate-200">
                  {companyDetails.map((item, index) => (
                    <div key={index} className="p-4 hover:bg-slate-50/50 transition-colors">
                      <dt className="text-sm font-semibold text-slate-600 mb-2">{item.label}</dt>
                      <dd className="text-sm text-slate-800 font-medium leading-relaxed">{item.value}</dd>
                    </div>
                  ))}

                  <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50">
                    <dt className="text-sm font-semibold text-slate-600 mb-2">
                      Ngoài ra, MAI TẤN TRINH còn đại diện các doanh nghiệp, đơn vị:
                    </dt>
                    <dd className="text-sm text-slate-800 font-medium">
                      <ul className="list-disc list-inside">
                        <li>CÔNG TY TNHH TƯ VẤN ĐẦU TƯ XÂY DỰNG HƯNG PHÚC</li>
                        <li>VĂN PHÒNG ĐẠI DIỆN CÔNG TY CỔ PHẦN TƯ VẤN XÂY DỰNG PHÚ MINH</li>
                      </ul>
                    </dd>
                  </div>
                </div>

                {/* Professional contact section */}
                <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100/50 border-t border-slate-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-primary to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <p className="text-xs text-slate-600 font-medium">Công ty uy tín từ 2010</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
