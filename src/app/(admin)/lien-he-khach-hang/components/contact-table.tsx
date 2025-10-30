"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Contact } from "@/types"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

interface ContactTableProps {
  contacts: Contact[]
  onStatusChange: (id: string, status: Contact["status"]) => void
  onRowClick: (contact: Contact) => void
}

const statusMap: { [key in Contact["status"]]: { text: string; className: string } } = {
  new: { text: "Mới", className: "bg-blue-500" },
  in_progress: { text: "Đang xử lý", className: "bg-yellow-500" },
  resolved: { text: "Đã giải quyết", className: "bg-green-500" },
  archived: { text: "Lưu trữ", className: "bg-gray-500" },
}

export function ContactTable({ contacts, onStatusChange, onRowClick }: ContactTableProps) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="font-semibold">Khách hàng</TableHead>
            <TableHead className="font-semibold">Thông tin liên hệ</TableHead>
            <TableHead className="font-semibold">Lời nhắn</TableHead>
            <TableHead className="font-semibold">Trạng thái</TableHead>
            <TableHead className="font-semibold">Ngày gửi</TableHead>
            <TableHead className="font-semibold">Hành động</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {contacts.map((contact) => (
            <TableRow
              key={contact.id}
              onClick={() => onRowClick(contact)}
              className={cn(
                "cursor-pointer transition-colors hover:bg-muted/50",
                !contact.is_viewed_by_me && "font-bold",
              )}
            >
              <TableCell>
                <div className="flex items-center gap-2">
                  {!contact.is_viewed_by_me && (
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                    </span>
                  )}
                  {contact.name}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{contact.email}</div>
                <div className="text-sm text-muted-foreground">{contact.phone}</div>
              </TableCell>
              <TableCell className="max-w-[300px] truncate">{contact.message}</TableCell>
              <TableCell>
                <Badge className={cn(statusMap[contact.status].className, "rounded-full")}>
                  {statusMap[contact.status].text}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{new Date(contact.created_at).toLocaleDateString("vi-VN")}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {Object.keys(statusMap).map((status) => (
                      <DropdownMenuItem
                        key={status}
                        onClick={() => onStatusChange(contact.id, status as Contact["status"])}
                      >
                        Chuyển thành {statusMap[status as Contact["status"]].text}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
