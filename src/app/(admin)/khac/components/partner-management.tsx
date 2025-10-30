"use client"

"use client"

import React, { useState } from "react"
import type { Partner } from "@/types"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet"
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog"
import { PlusCircle, Trash2, ImageIcon } from "lucide-react"
import { createPartner, deletePartner, uploadPartnerLogo } from "@/services/partnersService"
import { toast } from "sonner"

type Props = {
  partners: Partner[]
}

const PartnerManagement: React.FC<Props> = ({ partners }) => {
  const [items, setItems] = useState<Partner[]>(partners || [])
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setName("")
    setFile(null)
    setPreview(null)
  }

  const handleAdd = async () => {
    if (!name) { toast.error('Tên đối tác là bắt buộc'); return }
    if (items.length >= 6) { toast.error('Đã đạt giới hạn 6 đối tác'); return }
    setIsSubmitting(true)
    try {
      let logoUrl = ''
      if (file) {
        const url = await uploadPartnerLogo(file)
        logoUrl = String(url || '')
      }
      const res = await createPartner({ name, logo_url: logoUrl, website_url: '' })
      if (res?.success) {
        const created = res.data
        const p: Partner = { id: String(created.id), name: created.name, logoUrl: created.logo_url, websiteUrl: '' }
        setItems((prev) => [p, ...prev])
        toast.success('Thêm đối tác thành công')
        setIsOpen(false)
        resetForm()
      } else {
        toast.error(res?.message || 'Thêm đối tác thất bại')
      }
    } catch (err) {
      console.error('Add partner failed', err)
      toast.error('Thêm đối tác thất bại')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await deletePartner(String(id))
      if (res?.success) {
        setItems((prev) => prev.filter((p) => p.id !== id))
        toast.success('Xóa đối tác thành công')
      } else {
        toast.error(res?.message || 'Xóa đối tác thất bại')
      }
    } catch (err) {
      console.error('Delete partner failed', err)
      toast.error('Xóa đối tác thất bại')
    }
  }

  return (
    <div className="space-y-4">
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Quản lý Đối tác</CardTitle>
              <CardDescription>Danh sách logo và liên kết đối tác</CardDescription>
            </div>
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="secondary" className="flex items-center gap-2" onClick={resetForm}>
                  <PlusCircle className="h-4 w-4" /> Thêm Đối tác
                </Button>
              </SheetTrigger>

              <SheetContent className="max-w-md">
                <SheetHeader>
                  <SheetTitle>Thêm Đối tác</SheetTitle>
                </SheetHeader>
                <div className="p-4 space-y-3">
                  <label className="block text-sm font-medium">Tên đối tác</label>
                  <input className="input" value={name} onChange={(e) => setName(e.target.value)} />

                  <label className="block text-sm font-medium">Logo</label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-md border bg-background cursor-pointer">
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0] ?? null; setFile(f); setPreview(f ? URL.createObjectURL(f) : null) }} />
                      <ImageIcon className="h-4 w-4" />
                      <span className="text-sm">{file ? 'Thay ảnh' : 'Chọn ảnh'}</span>
                    </label>
                    {file && <Button variant="outline" onClick={() => { setFile(null); setPreview(null) }}>Xóa ảnh</Button>}
                  </div>

                  {preview && (
                    <div className="mt-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={preview} alt="preview" className="w-48 h-28 object-contain rounded-md border" />
                    </div>
                  )}
                </div>
                <SheetFooter>
                  <div className="flex w-full justify-between">
                    <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>Hủy</Button>
                    <Button onClick={handleAdd} disabled={isSubmitting}>{isSubmitting ? 'Đang gửi...' : 'Thêm'}</Button>
                  </div>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((p) => (
          <Card key={p.id} className="border-2 flex items-center gap-4 p-4">
            <div className="w-24 h-16 relative">
              <Image src={p.logoUrl || '/placeholder.svg'} alt={p.name} fill sizes="96px" className="object-contain" />
            </div>
            <CardContent className="flex-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h4 className="font-medium">{p.name}</h4>
                  <a className="text-sm text-primary underline" href={p.websiteUrl || '#'} target="_blank" rel="noreferrer">{p.websiteUrl || '—'}</a>
                </div>
                <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon"><Trash2 className="h-3 w-3" /></Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa đối tác</AlertDialogTitle>
                        <AlertDialogDescription>Bạn có chắc muốn xóa đối tác &quot;{p.name}&quot;?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(p.id)}>Xóa</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default PartnerManagement

