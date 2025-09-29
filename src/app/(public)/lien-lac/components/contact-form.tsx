"use client"

import { useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { contactService } from "@/services/contactService"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, User, Mail, Phone, MapPin, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

const formSchema = z.object({
  name: z.string().min(2, { message: "Họ và tên phải có ít nhất 2 ký tự." }),
  email: z.string().email({ message: "Email không hợp lệ." }),
  phone: z.string().min(10, { message: "Số điện thoại phải có ít nhất 10 ký tự." }),
  address: z.string().min(5, { message: "Địa chỉ phải có ít nhất 5 ký tự." }),
  message: z.string().min(10, { message: "Nội dung phải có ít nhất 10 ký tự." }),
})

const ContactForm = () => {
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      message: "",
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      try {
        await contactService.sendContact(values)

        toast.success("Gửi thông tin liên hệ thành công!")
        form.reset()
      } catch (err) {
        console.error("Contact form error:", err)
        toast.error("Gửi thông tin thất bại")
      }
    })
  }

  return (
    <Card className="shadow-xl border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <CardTitle className="text-2xl font-bold text-center text-foreground">Gửi thông tin liên hệ</CardTitle>
        <p className="text-muted-foreground text-center">Điền thông tin bên dưới để được tư vấn miễn phí</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              Họ và tên
            </Label>
            <Input
              id="name"
              placeholder="Nhập họ và tên của bạn"
              {...form.register("name")}
              disabled={isPending}
              className="h-12 border-2 border-border focus:border-primary transition-colors"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              Email
            </Label>
            <Input
              type="email"
              id="email"
              placeholder="example@email.com"
              {...form.register("email")}
              disabled={isPending}
              className="h-12 border-2 border-border focus:border-primary transition-colors"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Số điện thoại
            </Label>
            <Input
              type="tel"
              id="phone"
              placeholder="0123 456 789"
              {...form.register("phone")}
              disabled={isPending}
              className="h-12 border-2 border-border focus:border-primary transition-colors"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Địa chỉ
            </Label>
            <Input
              type="text"
              id="address"
              placeholder="Nhập địa chỉ của bạn"
              {...form.register("address")}
              disabled={isPending}
              className="h-12 border-2 border-border focus:border-primary transition-colors"
            />
            {form.formState.errors.address && (
              <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              Nội dung
            </Label>
            <Textarea
              id="message"
              rows={4}
              placeholder="Mô tả chi tiết về dự án hoặc yêu cầu của bạn..."
              {...form.register("message")}
              disabled={isPending}
              className="border-2 border-border focus:border-primary transition-colors resize-none"
            />
            {form.formState.errors.message && (
              <p className="text-sm text-destructive">{form.formState.errors.message.message}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all duration-200 hover:shadow-lg"
          >
            {isPending ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Đang gửi...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Gửi thông tin
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default ContactForm
