"use client";

import { Card, CardContent } from "@/components/ui/card"
import { RootState } from "@/store"
import { Phone, Mail, MapPin, Clock, Building2, Users } from "lucide-react"
import { useSelector } from "react-redux"

const ContactInfo = () => {
const settings = useSelector((state: RootState) => state.settings.settings)


  const contactDetails = [
    {
      icon: Phone,
      label: "Hotline",
      value: settings?.phone,
      description: "Hỗ trợ 24/7",
    },
    {
      icon: Mail,
      label: "Email",
      value: settings?.email,
      description: "Phản hồi trong 2h",
    },
    {
      icon: MapPin,
      label: "Địa chỉ",
      value: settings?.address,
      description: "TP. Hồ Chí Minh",
    },
    {
      icon: Clock,
      label: "Giờ làm việc",
      value: "8:00 - 17:30",
      description: "Thứ 2 - Thứ 7",
    },
  ]

  const stats = [
    { icon: Building2, value: "500+", label: "Dự án hoàn thành" },
    { icon: Users, value: "1000+", label: "Khách hàng tin tưởng" },
    { icon: Clock, value: "15+", label: "Năm kinh nghiệm" },
  ]

  return (
    <div className="space-y-8">
      {/* Company Info */}
      <Card className="bg-contact-info-bg/50 border-border/50 shadow-lg">
        <CardContent className="p-8">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Công ty Xây dựng Hưng Phúc</h2>
              <p className="text-muted-foreground leading-relaxed">
                Với hơn 15 năm kinh nghiệm trong lĩnh vực xây dựng, chúng tôi cam kết mang đến những công trình chất
                lượng cao và dịch vụ tận tâm nhất.
              </p>
            </div>

            {/* Contact Details */}
            <div className="space-y-4">
              {contactDetails.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors"
                  >
                    <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p className="text-sm text-primary font-semibold">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ContactInfo
