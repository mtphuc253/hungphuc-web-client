"use client"

import { useEffect, useState } from "react"
import { contactService } from "@/services/contactService"
import type { Contact, ApiMeta } from "@/types"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"

import { useDebounce } from "@/hooks/use-debounce"
import { ContactToolbar } from "./components/contact-toolbar"
import { ContactTable } from "./components/contact-table"
import { ContactPagination } from "./components/contact-pagination"
import { ContactDetailSheet } from "./components/contact-detail-sheet"

const CustomerContactPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [meta, setMeta] = useState<ApiMeta | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter and pagination state
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOrder, setSortOrder] = useState("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Detail sheet state
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null)
  const [isSheetOpen, setIsSheetOpen] = useState(false)

  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        setLoading(true)
        const params = {
          page: currentPage,
          limit: itemsPerPage,
          search: debouncedSearchTerm || undefined,
          status: statusFilter === "all" ? undefined : (statusFilter as Contact["status"]),
          sort: sortOrder as "asc" | "desc",
        }

        const response = await contactService.getContacts(params)

        if (response.success) {
          setContacts(response.data)
          setMeta(response.meta)
        } else {
          const errorMessage = response.message || "Failed to fetch contacts"
          setError(errorMessage)
          toast.error(errorMessage)
        }
      } catch (err) {
        const errorMessage = "Không thể tải danh sách liên hệ"
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchContacts()
  }, [debouncedSearchTerm, statusFilter, sortOrder, currentPage, itemsPerPage])

  const handleStatusChange = async (id: string, status: Contact["status"]) => {
    try {
      const response = await contactService.updateContactStatus(id, status)
      if (response.success) {
        setContacts((prevContacts) =>
          prevContacts.map((c) => (c.id === id ? { ...c, status: status, is_viewed_by_me: true } : c)),
        )
        toast.success("Cập nhật trạng thái liên hệ thành công")
      } else {
        toast.error(response.message || "Cập nhật trạng thật bại")
      }
    } catch (error) {
      toast.error("Đã có lỗi xảy ra khi cập nhật trạng thái.")
    }
  }

  const handleRowClick = (contact: Contact) => {
    // Mark as viewed if it hasn't been
    if (!contact.is_viewed_by_me) {
      contactService.markAsViewed(contact.id).catch((err) => {
        console.error("Failed to mark as viewed", err)
      })
      // Optimistically update the UI
      setContacts((prev) => prev.map((c) => (c.id === contact.id ? { ...c, is_viewed_by_me: true } : c)))
    }
    setSelectedContactId(contact.id)
    setIsSheetOpen(true)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleItemsPerPageChange = (value: number) => {
    setItemsPerPage(value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Hộp thư liên hệ</h1>
        <p className="text-muted-foreground mt-2">Quản lý tất cả liên hệ từ khách hàng tại đây.</p>
      </div>
      <Card className="rounded-xl border-2">
        <CardContent className="p-6">
          <ContactToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
          />
          <div>
            {loading && !contacts.length ? (
              <div className="text-center p-8">Đang tải...</div>
            ) : error ? (
              <div className="text-center p-8 text-red-500">{error}</div>
            ) : contacts.length > 0 ? (
              <ContactTable contacts={contacts} onStatusChange={handleStatusChange} onRowClick={handleRowClick} />
            ) : (
              <div className="text-center p-8">Không tìm thấy liên hệ nào.</div>
            )}
          </div>
          {meta && meta.totalPages > 0 && (
            <ContactPagination
              currentPage={meta.page}
              totalPages={meta.totalPages}
              itemsPerPage={meta.limit}
              totalRecords={meta.totalRecords || 0}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handleItemsPerPageChange}
            />
          )}
        </CardContent>
      </Card>
      <ContactDetailSheet
        contactId={selectedContactId}
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        onStatusChange={handleStatusChange}
      />
    </div>
  )
}

export default CustomerContactPage
