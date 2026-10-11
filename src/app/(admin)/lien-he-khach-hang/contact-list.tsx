"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { Download, Inbox, Mail, Phone, Search, X } from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { AdminContact, AdminUser, ContactStatus, PageMeta } from "@/types/admin";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { useAdmin } from "@/components/admin/admin-shell";
import {
  Btn,
  EmptyState,
  PageHeader,
  Pager,
  Pill,
  SegmentTabs,
  SelectInput,
  Skel,
  TextInput,
} from "@/components/admin/primitives";
import { CONTACT_STATUS, fmtDateTime, timeAgo } from "@/components/admin/format";
import { ContactDrawer } from "./contact-drawer";

type Tab = "all" | ContactStatus;

export function ContactList() {
  const router = useRouter();
  const sp = useSearchParams();
  const me = useAppSelector((s) => s.auth.user);
  const { refreshUnviewed } = useAdmin();

  const [tab, setTab] = React.useState<Tab>((sp.get("status") as Tab) || "all");
  const [viewed, setViewed] = React.useState(sp.get("viewed") || "");
  const [sort, setSort] = React.useState<"desc" | "asc">("desc");
  const [search, setSearch] = React.useState("");
  const [q] = useDebounce(search, 400);
  const [page, setPage] = React.useState(1);
  const [openId, setOpenId] = React.useState<string | null>(sp.get("open"));

  const [items, setItems] = React.useState<AdminContact[]>([]);
  const [meta, setMeta] = React.useState<PageMeta | null>(null);
  const [counts, setCounts] = React.useState<Partial<Record<Tab, number>>>({});
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [bulkLoading, setBulkLoading] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);

  const limit = 15;

  React.useEffect(() => {
    if (me?.role === "admin") {
      adminApi
        .getUsers()
        .then((r) => setUsers(r.data))
        .catch(() => {});
    }
  }, [me?.role]);

  React.useEffect(() => {
    setPage(1);
    setSelected(new Set());
  }, [tab, viewed, sort, q]);

  // Giữ URL đồng bộ với bộ lọc chính
  React.useEffect(() => {
    const p = new URLSearchParams();
    if (tab !== "all") p.set("status", tab);
    if (viewed) p.set("viewed", viewed);
    if (openId) p.set("open", openId);
    router.replace(`/lien-he-khach-hang${p.toString() ? `?${p}` : ""}`, { scroll: false });
  }, [tab, viewed, openId, router]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getContacts({
        page,
        limit,
        status: tab === "all" ? undefined : tab,
        viewed,
        search: q,
        sort,
      });
      setItems(res.data);
      setMeta(res.meta ?? null);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không tải được danh sách liên hệ"));
    } finally {
      setLoading(false);
    }
  }, [page, tab, viewed, q, sort]);

  const loadCounts = React.useCallback(async () => {
    try {
      const tabs: Tab[] = ["all", "new", "in_progress", "resolved", "archived"];
      const res = await Promise.all(
        tabs.map((t) => adminApi.getContacts({ limit: 1, status: t === "all" ? undefined : t, viewed, search: q }))
      );
      setCounts(Object.fromEntries(tabs.map((t, i) => [t, res[i].meta?.total ?? 0])));
    } catch {
      /* noop */
    }
  }, [viewed, q]);

  React.useEffect(() => {
    load();
  }, [load]);
  React.useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const refreshAll = React.useCallback(() => {
    load();
    loadCounts();
    refreshUnviewed();
  }, [load, loadCounts, refreshUnviewed]);

  const toggleAll = () => {
    if (selected.size === items.length) setSelected(new Set());
    else setSelected(new Set(items.map((i) => i.id)));
  };

  const bulkStatus = async (status: ContactStatus) => {
    setBulkLoading(true);
    try {
      const res = await adminApi.bulkContactStatus(Array.from(selected), status);
      toast.success(`Đã cập nhật ${res.data.updated} liên hệ sang "${CONTACT_STATUS[status].label}"`);
      setSelected(new Set());
      refreshAll();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setBulkLoading(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const all: AdminContact[] = [];
      let p = 1;
      let totalPages = 1;
      do {
        const res = await adminApi.getContacts({ page: p, limit: 100, status: tab === "all" ? undefined : tab, viewed, search: q, sort });
        all.push(...res.data);
        totalPages = res.meta?.totalPages ?? 1;
        p += 1;
      } while (p <= totalPages && p <= 50);

      const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
      const header = ["Ngày gửi", "Họ tên", "Điện thoại", "Email", "Địa chỉ", "Nội dung", "Trạng thái", "Phụ trách", "Số ghi chú"];
      const rows = all.map((c) => [
        fmtDateTime(c.created_at),
        c.name,
        c.phone,
        c.email,
        c.address,
        c.message,
        CONTACT_STATUS[c.status].label,
        c.assigned_to_name,
        c.log_count,
      ]);
      const csv = "﻿" + [header, ...rows].map((r) => r.map(esc).join(",")).join("\n");
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `lien-he-khach-hang-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Đã xuất ${all.length} liên hệ`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Xuất file thất bại"));
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Liên hệ khách hàng"
        description="Yêu cầu tư vấn khách gửi từ website. Mở một liên hệ sẽ tự đánh dấu là đã xem."
        actions={
          <Btn variant="outline" onClick={exportCsv} loading={exporting}>
            {!exporting && <Download />} Xuất Excel (CSV)
          </Btn>
        }
      />

      <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <SegmentTabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "all", label: "Tất cả", count: counts.all },
              { value: "new", label: "Mới", count: counts.new },
              { value: "in_progress", label: "Đang xử lý", count: counts.in_progress },
              { value: "resolved", label: "Đã xử lý", count: counts.resolved },
              { value: "archived", label: "Lưu trữ", count: counts.archived },
            ]}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <TextInput
                className="h-9 pl-9"
                placeholder="Tìm theo tên, số điện thoại, email, nội dung…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Tìm liên hệ"
              />
            </div>
            <SelectInput className="h-9 sm:w-44" value={viewed} onChange={(e) => setViewed(e.target.value)} aria-label="Lọc đã xem">
              <option value="">Đã xem & chưa xem</option>
              <option value="unviewed">Chỉ chưa xem</option>
              <option value="viewed">Chỉ đã xem</option>
            </SelectInput>
            <SelectInput className="h-9 sm:w-36" value={sort} onChange={(e) => setSort(e.target.value as "asc" | "desc")} aria-label="Sắp xếp">
              <option value="desc">Mới nhất</option>
              <option value="asc">Cũ nhất</option>
            </SelectInput>
          </div>
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-b border-indigo-100 bg-indigo-50/60 px-4 py-2.5 text-sm">
            <span className="font-medium text-indigo-900">Đã chọn {selected.size}</span>
            <span className="text-indigo-300">|</span>
            <span className="text-indigo-800">Chuyển sang:</span>
            {(Object.keys(CONTACT_STATUS) as ContactStatus[]).map((s) => (
              <Btn key={s} size="sm" variant="outline" disabled={bulkLoading} onClick={() => bulkStatus(s)}>
                {CONTACT_STATUS[s].label}
              </Btn>
            ))}
            <button type="button" onClick={() => setSelected(new Set())} className="ml-auto inline-flex items-center gap-1 text-xs text-indigo-700 hover:underline">
              <X className="size-3.5" /> Bỏ chọn
            </button>
          </div>
        )}

        {loading && items.length === 0 ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skel key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Không có liên hệ nào"
            description={q || viewed || tab !== "all" ? "Thử đổi bộ lọc hoặc từ khoá tìm kiếm." : "Liên hệ khách gửi từ form trên website sẽ xuất hiện ở đây."}
          />
        ) : (
          <div className={cn("overflow-x-auto", loading && "opacity-60")}>
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Chọn tất cả"
                      className="size-4 cursor-pointer rounded accent-indigo-600"
                      checked={items.length > 0 && selected.size === items.length}
                      onChange={toggleAll}
                    />
                  </th>
                  <th className="px-3 py-3">Khách hàng</th>
                  <th className="px-3 py-3">Nội dung</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="px-3 py-3">Phụ trách</th>
                  <th className="px-3 py-3 text-right">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((c) => {
                  const unseen = !c.is_viewed_by_me;
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setOpenId(c.id)}
                      className={cn("cursor-pointer transition hover:bg-slate-50", unseen && "bg-sky-50/40", selected.has(c.id) && "bg-indigo-50/50")}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Chọn ${c.name}`}
                          className="size-4 cursor-pointer rounded accent-indigo-600"
                          checked={selected.has(c.id)}
                          onChange={() =>
                            setSelected((s) => {
                              const n = new Set(s);
                              if (n.has(c.id)) n.delete(c.id);
                              else n.add(c.id);
                              return n;
                            })
                          }
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          {unseen && <span className="size-2 shrink-0 rounded-full bg-sky-500" aria-label="Chưa xem" />}
                          <span className={cn("text-slate-900", unseen ? "font-semibold" : "font-medium")}>{c.name}</span>
                        </div>
                        <div className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-slate-500">
                          {c.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone className="size-3" /> {c.phone}
                            </span>
                          )}
                          {c.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail className="size-3" /> {c.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="max-w-[320px] px-3 py-3">
                        <p className="line-clamp-2 text-slate-600">{c.message || <span className="italic text-slate-400">(không có lời nhắn)</span>}</p>
                        {!!c.log_count && <p className="mt-0.5 text-xs text-indigo-600">{c.log_count} ghi chú chăm sóc</p>}
                      </td>
                      <td className="px-3 py-3">
                        <Pill tone={CONTACT_STATUS[c.status].tone} dot>
                          {CONTACT_STATUS[c.status].label}
                        </Pill>
                      </td>
                      <td className="px-3 py-3 text-slate-600">{c.assigned_to_name || <span className="text-slate-400">—</span>}</td>
                      <td className="px-3 py-3 text-right text-xs text-slate-500" title={fmtDateTime(c.created_at)}>
                        {timeAgo(c.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.total > 0 && (
          <Pager page={page} totalPages={meta.totalPages} total={meta.total} limit={limit} onChange={setPage} />
        )}
      </div>

      <ContactDrawer contactId={openId} onClose={() => setOpenId(null)} onChanged={refreshAll} users={users} />
    </>
  );
}
