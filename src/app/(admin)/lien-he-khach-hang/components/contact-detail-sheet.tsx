"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { contactService } from "@/services/contactService"
import type { Contact, ContactStatus } from "@/types"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, MapPin, Calendar, MessageSquare, Trash, User, Plus, Loader2 } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ContactDetailSheetProps {
  contactId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (id: string, status: ContactStatus) => void
}

const statusMap: { [key: string]: { text: string; color: string } } = {
  new: { text: "Mới", color: "bg-blue-500" },
  in_progress: { text: "Đang xử lý", color: "bg-yellow-500" },
  resolved: { text: "Đã giải quyết", color: "bg-green-500" },
  archived: { text: "Lưu trữ", color: "bg-gray-500" },
}

const DetailRow = ({
  icon: Icon,
  label,
  value,
}: { icon?: React.ElementType; label: string; value: React.ReactNode }) => (
  <div className="flex gap-4 py-2 flex-1 min-w-0">
    {Icon && (
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
    )}
    <div className="flex-1 min-w-0">
      <dt className="text-sm font-medium text-muted-foreground mb-1">{label}</dt>
      <dd className="text-sm break-words">{value || "-"}</dd>
    </div>
  </div>
)

export function ContactDetailSheet({ contactId, open, onOpenChange, onStatusChange }: ContactDetailSheetProps) {
  const [contact, setContact] = useState<Contact | null>(null)
  const [loading, setLoading] = useState(false)
  const [newLogNote, setNewLogNote] = useState("")
  const [addingLog, setAddingLog] = useState(false)
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null)
  const [logToDelete, setLogToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (contactId && open) {
      const fetchContact = async () => {
        setLoading(true)
        try {
          const response = await contactService.getContactById(contactId)
          if (response.success) {
            setContact(response.data)
          } else {
            console.error(response.message)
          }
        } catch (error) {
          console.error("Failed to fetch contact details", error)
        } finally {
          setLoading(false)
        }
      }
      fetchContact()
    } else if (!open) {
      setContact(null)
    }
  }, [contactId, open])

  const handleLocalStatusChange = (newStatus: ContactStatus) => {
    if (contact) {
      onStatusChange(contact.id, newStatus)
      setContact({ ...contact, status: newStatus })
    }
  }

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!contact || !newLogNote.trim()) return
    setAddingLog(true)
    try {
      const addResp = await contactService.addContactLog(contact.id, newLogNote.trim())
      if (addResp && addResp.success) {
        toast.success("Thêm nhật ký thành công")
        const resp = await contactService.getContactById(contact.id)
        if (resp && resp.success) {
          setContact(resp.data)
        }
        setNewLogNote("")
      } else {
        toast.error(addResp?.message || "Thêm nhật ký thất bại")
      }
    } catch (err) {
      console.error("Add log failed", err)
      toast.error("Thêm nhật ký thất bại")
    } finally {
      setAddingLog(false)
    }
  }

  const handleDeleteLog = async (logId: string) => {
    if (!contact) return
    setDeletingLogId(logId)
    try {
      const delResp = await contactService.deleteContactLog(logId)
      if (delResp && delResp.success) {
        toast.success("Xóa nhật ký thành công")
        const resp = await contactService.getContactById(contact.id)
        if (resp && resp.success) setContact(resp.data)
      } else {
        toast.error(delResp?.message || "Xóa nhật ký thất bại")
      }
    } catch (err) {
      console.error("Delete log failed", err)
      toast.error("Xóa nhật ký thất bại")
    } finally {
      setDeletingLogId(null)
      setLogToDelete(null)
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-5xl flex flex-col p-0" side="right">
          {/* Fixed Header */}
          <div className="sticky top-0 z-10 bg-background border-b">
            <SheetHeader className="flex flex-row items-center justify-between px-8 py-5">
              <div>
                <SheetTitle className="text-2xl">Chi tiết liên hệ</SheetTitle>
                <SheetDescription>Thông tin chi tiết từ khách hàng</SheetDescription>
              </div>
              {contact && (
                <div className="flex items-center gap-3">
                  <Badge className={`${statusMap[contact.status].color} text-white rounded-full px-3 py-1`}>
                    {statusMap[contact.status].text}
                  </Badge>
                  <Select value={contact.status} onValueChange={handleLocalStatusChange}>
                    <SelectTrigger className="w-[160px] rounded-lg">
                      <SelectValue placeholder="Cập nhật trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(statusMap).map(([value, { text }]) => (
                        <SelectItem key={value} value={value as ContactStatus}>
                          {text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </SheetHeader>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-12 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            ) : contact ? (
              <>
                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-5 w-5" />
                        <h3 className="text-lg font-semibold text-foreground">Thông tin khách hàng</h3>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <div className="text-xl font-semibold">{contact.name}</div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Gửi lúc: {new Date(contact.created_at).toLocaleString("vi-VN")}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Cập nhật: {new Date(contact.updated_at).toLocaleString("vi-VN")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-5 w-5" />
                        <h3 className="text-lg font-semibold text-foreground">Thông tin liên hệ</h3>
                      </div>
                      <Separator />
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <DetailRow icon={Mail} label="Email" value={contact.email} />
                          <DetailRow icon={Phone} label="Số điện thoại" value={contact.phone} />
                        </div>
                        <Separator />
                        <DetailRow icon={MapPin} label="Địa chỉ" value={contact.address} />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MessageSquare className="h-5 w-5" />
                        <h3 className="text-lg font-semibold text-foreground">Nội dung tin nhắn</h3>
                      </div>
                      <Separator />
                      <div className="bg-muted/30 rounded-lg p-6 border min-h-[120px]">
                        <p className="whitespace-pre-wrap text-sm leading-relaxed">{contact.message}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-5 w-5" />
                        <h3 className="text-lg font-semibold text-foreground">Nhật ký xử lý</h3>
                      </div>
                      <Separator />

                      <div className="space-y-3">
                        {Array.isArray(contact.logs) && contact.logs.length > 0 ? (
                          [...contact.logs]
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map((log) => (
                              <Card key={log.id} className="border">
                                <CardContent className="p-4">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="flex flex-wrap items-center gap-2 mb-2">
                                        <div className="text-sm font-semibold">{log.user_name || "Hệ thống"}</div>
                                        <div className="text-xs text-muted-foreground">{log.user_email}</div>
                                        <div className="text-xs text-muted-foreground">•</div>
                                        <div className="text-xs text-muted-foreground">
                                          {new Date(log.created_at).toLocaleString("vi-VN")}
                                        </div>
                                      </div>
                                      <div className="text-sm whitespace-pre-wrap bg-muted/30 rounded-md p-3">
                                        {log.note}
                                      </div>
                                    </div>
                                    <div className="flex-shrink-0">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setLogToDelete(log.id)}
                                        disabled={deletingLogId === log.id}
                                        className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                                      >
                                        {deletingLogId === log.id ? (
                                          <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                          <Trash className="h-4 w-4" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                        ) : (
                          <div className="text-sm text-muted-foreground text-center py-4">Chưa có nhật ký nào.</div>
                        )}
                      </div>

                      <form onSubmit={handleAddLog} className="mt-4">
                        <Card className="border-dashed border-2">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <Textarea
                                value={newLogNote}
                                onChange={(e) => setNewLogNote(e.target.value)}
                                placeholder="Nhập ghi chú xử lý..."
                                className="min-h-[100px] resize-none"
                                disabled={addingLog}
                              />
                              <div className="flex justify-end">
                                <Button
                                  type="submit"
                                  disabled={addingLog || !newLogNote.trim()}
                                  className="cursor-pointer"
                                >
                                  {addingLog ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Đang thêm...
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-4 h-4 mr-2" />
                                      Thêm nhật ký
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </form>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className="text-center p-8 text-muted-foreground">Không thể tải chi tiết liên hệ.</div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={!!logToDelete} onOpenChange={(open) => !open && setLogToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhật ký</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhật ký này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => logToDelete && handleDeleteLog(logToDelete)}
              className="bg-red-500 hover:bg-red-600 cursor-pointer"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
