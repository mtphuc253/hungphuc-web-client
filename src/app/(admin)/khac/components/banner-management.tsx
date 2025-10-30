"use client"

import type React from "react"
import { useState } from "react"
import type { Banner } from "@/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { PlusCircle, Edit, Trash2, ImageIcon, ExternalLink, Hash, Loader2 } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import uploadService from '@/services/uploadService'
import { createBanner, deleteBanner, updateBanner } from '@/services/bannerService'

type Props = {
  banners: Banner[]
}

const BannerManagement: React.FC<Props> = ({ banners }) => {
  const [items, setItems] = useState<Banner[]>(banners || [])
  const [isOpen, setIsOpen] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)

  // form state
  const [title, setTitle] = useState("")
  const [link, setLink] = useState("")
  const [order, setOrder] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setTitle("")
    setLink("")
    setOrder(0)
    setFile(null)
    setPreview(null)
    setEditing(null)
  }

  const openForEdit = (b: Banner) => {
    setEditing(b)
    setTitle(b.title || "")
    setLink(b.link || "")
    setOrder(b.order ?? 0)
    setFile(null)
    setPreview(b.imageUrl || (b as any).image_url || null)
    setIsOpen(true)
  }
  const handleSubmit = async () => {
    if (!title) {
      toast.error("Tiêu đề là bắt buộc")
      return
    }

    if (!editing && items.length >= 5) {
      toast.error('Đã đạt giới hạn 5 banner. Vui lòng xóa bớt trước khi thêm.')
      return
    }

    setIsSubmitting(true)
    try {
      if (editing) {
        // update via API
        const payload = {
          title,
          image_url: preview || editing.imageUrl || '',
          link_url: link || '',
          order_index: order,
        }
        const res = await updateBanner(String(editing.id), payload)
        if (res?.success) {
          const updated = res.data
          const uiBanner: Banner = {
            id: String(updated.id),
            title: updated.title,
            imageUrl: updated.image_url,
            link: updated.link_url || '',
            order: updated.order_index ?? order,
            isActive: true,
          }
          setItems((prev) => prev.map((it) => (it.id === editing.id ? uiBanner : it)))
          toast.success('Cập nhật banner thành công')
        } else {
          toast.error(res?.message || 'Cập nhật banner thất bại')
        }
      } else {
        // upload image if provided
        let imageUrl = ''
        if (file) {
          const uploadRes = await uploadService.uploadImage(file)
          imageUrl = uploadRes?.data?.url || uploadRes?.url || uploadRes?.data || ''
        }

        const payload = {
          title,
          image_url: imageUrl,
          link_url: link || '',
          order_index: order,
        }

        const res = await createBanner(payload)
        if (res?.success) {
          const created = res.data
          const uiBanner: Banner = {
            id: String(created.id),
            title: created.title,
            imageUrl: created.image_url || imageUrl,
            link: created.link_url || '',
            order: created.order_index ?? order,
            isActive: true,
          }
          setItems((prev) => [uiBanner, ...prev])
          toast.success('Thêm banner thành công')
        } else {
          toast.error(res?.message || 'Thêm banner thất bại')
        }
      }
    } catch (err) {
      console.error('Create banner failed', err)
      toast.error('Thêm banner thất bại')
    } finally {
      setIsOpen(false)
      setIsSubmitting(false)
      resetForm()
    }
  }

  const handleDelete = (id: string) => {
    ;(async () => {
      try {
        const res = await deleteBanner(String(id))
        if (res?.success) {
          setItems((prev) => prev.filter((i) => i.id !== id))
          toast.success('Xóa banner thành công')
        } else {
          toast.error(res?.message || 'Xóa banner thất bại')
        }
      } catch (err) {
        console.error('Delete banner failed', err)
        toast.error('Xóa banner thất bại')
      }
    })()
  }

  // formatDate removed (created_at not part of Banner type)

  return (
    <div className="space-y-4">
      <Card className="border-2 rounded-lg p-0">
        <CardHeader className="bg-foreground text-white rounded-t-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Quản lý Banner</CardTitle>
              <CardDescription className="text-white/90 text-sm">
                Danh sách banner hiển thị trên trang chủ
              </CardDescription>
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" className="flex items-center gap-2 cursor-pointer" onClick={resetForm}>
                  <PlusCircle className="h-4 w-4" /> Thêm Banner
                </Button>
              </SheetTrigger>

              <SheetContent className="max-w-2xl overflow-y-auto">
                <SheetHeader className="pb-4">
                  <SheetTitle>{editing ? "Chỉnh sửa Banner" : "Thêm Banner"}</SheetTitle>
                </SheetHeader>

                <div className="space-y-3 py-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Nhập tiêu đề banner"
                    />
                  </div>

                  {/* description removed to align with Banner type */}

                  <div>
                    <label className="block text-sm font-medium mb-1">Link</label>
                    <input
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Thứ tự</label>
                    <input
                      type="number"
                      className="w-full rounded-md border px-3 py-2 text-sm bg-background"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Ảnh Banner</label>

                    <div className="flex items-center gap-3">
                      <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-background cursor-pointer hover:bg-accent transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null
                            setFile(f)
                            if (f) setPreview(URL.createObjectURL(f))
                            else setPreview(null)
                          }}
                        />
                        <ImageIcon className="h-4 w-4" />
                        <span className="text-sm">{file ? "Thay ảnh" : "Chọn ảnh"}</span>
                      </label>

                      {file && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="cursor-pointer bg-transparent"
                          onClick={() => {
                            setFile(null)
                            setPreview(null)
                          }}
                        >
                          Xóa ảnh
                        </Button>
                      )}
                    </div>

                    {preview ? (
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Xem trước</p>
                        <div className="w-full max-w-md h-24 rounded-md overflow-hidden border bg-muted/40">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={preview || "/placeholder.svg"}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    ) : editing && editing.imageUrl ? (
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-2 text-muted-foreground">Ảnh hiện tại</p>
                        <div className="w-full max-w-md h-24 rounded-md overflow-hidden border bg-muted/40">
                          <Image
                            src={editing.imageUrl || "/placeholder.svg"}
                            alt="current"
                            width={400}
                            height={96}
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <SheetFooter className="pt-4">
                  <Button variant="outline" onClick={() => setIsOpen(false)} className="cursor-pointer" disabled={isSubmitting}>
                    Hủy
                  </Button>
                  <Button onClick={handleSubmit} className="cursor-pointer" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2"><Loader2 className="animate-spin h-4 w-4" /> Đang xử lý...</span>
                    ) : (
                      (editing ? "Lưu" : "Thêm")
                    )}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((b) => (
          <Card key={b.id} className="border-2 rounded-lg hover:shadow-md transition-shadow p-0">
            <CardHeader className="bg-foreground text-white rounded-t-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base line-clamp-1">{b.title}</CardTitle>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="h-7 w-7 cursor-pointer"
                    onClick={() => openForEdit(b)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon" className="h-7 w-7 cursor-pointer">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa banner</AlertDialogTitle>
                        <AlertDialogDescription>
                          Bạn có chắc muốn xóa banner &quot;{b.title}&quot;? Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(b.id)} className="cursor-pointer">
                          Xóa
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-2 space-y-3">
              <div className="w-full h-20 relative rounded-md overflow-hidden border bg-muted/40">
                <Image
                  src={b.imageUrl || "/placeholder.svg"}
                  alt={b.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              {/* no description field in Banner type */}

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2">
                  <Hash className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">Thứ tự:</span>
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    {b.order}
                  </Badge>
                </div>

                {b.link && (
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                    <a
                      href={b.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate cursor-pointer"
                    >
                      {b.link}
                    </a>
                  </div>
                )}

                {/* created_at removed from Banner type */}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card className="border-2 border-dashed rounded-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">Chưa có banner nào</p>
            <p className="text-muted-foreground text-xs mt-1">Nhấn nút &quot;Thêm Banner&quot; để bắt đầu</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BannerManagement



