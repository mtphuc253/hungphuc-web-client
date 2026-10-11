"use client";

import * as React from "react";
import Link from "next/link";
import { useDebounce } from "use-debounce";
import {
  Archive,
  ArchiveRestore,
  CalendarDays,
  ExternalLink,
  FolderPlus,
  Images,
  LayoutGrid,
  List as ListIcon,
  MapPin,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { AdminProject, PageMeta, ProjectCategory } from "@/types/admin";
import { cn } from "@/lib/utils";
import {
  Btn,
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Pager,
  Pill,
  SegmentTabs,
  SelectInput,
  Skel,
  TextInput,
} from "./primitives";
import { fmtDate, PROJECT_CATEGORY } from "./format";

type StatusTab = "all" | "published" | "archived";

export function ProjectList({ category }: { category: ProjectCategory }) {
  const cfg = PROJECT_CATEGORY[category];
  const base = `/quan-ly-du-an/${cfg.slug}`;

  const [status, setStatus] = React.useState<StatusTab>("all");
  const [sub, setSub] = React.useState("");
  const [sort, setSort] = React.useState("newest");
  const [search, setSearch] = React.useState("");
  const [q] = useDebounce(search, 400);
  const [page, setPage] = React.useState(1);
  const [view, setView] = React.useState<"grid" | "list">("grid");

  const [items, setItems] = React.useState<AdminProject[]>([]);
  const [meta, setMeta] = React.useState<PageMeta | null>(null);
  const [subs, setSubs] = React.useState<{ subcategory: string; count: number }[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toDelete, setToDelete] = React.useState<AdminProject | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const limit = 12;

  React.useEffect(() => setPage(1), [status, sub, sort, q]);

  React.useEffect(() => {
    adminApi
      .getSubcategories(category)
      .then((r) => setSubs(r.data))
      .catch(() => {});
  }, [category]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getProjects({
        page,
        limit,
        category,
        status: status === "all" ? undefined : status,
        subcategory: sub,
        search: q,
        sort,
      });
      setItems(res.data);
      setMeta(res.meta ?? null);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không tải được danh sách dự án"));
    } finally {
      setLoading(false);
    }
  }, [page, category, status, sub, q, sort]);

  React.useEffect(() => {
    load();
  }, [load]);

  const toggleArchive = async (p: AdminProject) => {
    try {
      await adminApi.updateProject(p.id, {
        title: p.title,
        category: p.category,
        status: p.status === "published" ? "archived" : "published",
      });
      toast.success(p.status === "published" ? "Đã ẩn dự án khỏi website" : "Đã hiển thị lại dự án");
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteProject(toDelete.id);
      toast.success("Đã xoá dự án");
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`Dự án ${cfg.label.toLowerCase()}`}
        description={`Quản lý các công trình hiển thị tại trang ${cfg.label}.`}
        actions={
          <Link
            href={`${base}/tao-moi`}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <FolderPlus className="size-4" /> Thêm dự án
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(15,23,42,0.04)] lg:flex-row lg:items-center lg:justify-between">
        <SegmentTabs
          value={status}
          onChange={setStatus}
          items={[
            { value: "all", label: "Tất cả" },
            { value: "published", label: "Đang hiển thị" },
            { value: "archived", label: "Đã ẩn" },
          ]}
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative sm:w-60">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <TextInput
              className="h-9 pl-9"
              placeholder="Tên dự án, chủ đầu tư, địa điểm…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Tìm dự án"
            />
          </div>
          <SelectInput className="h-9 sm:w-44" value={sub} onChange={(e) => setSub(e.target.value)} aria-label="Loại công trình">
            <option value="">Mọi loại công trình</option>
            {subs.map((s) => (
              <option key={s.subcategory} value={s.subcategory}>
                {s.subcategory} ({s.count})
              </option>
            ))}
          </SelectInput>
          <SelectInput className="h-9 sm:w-40" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sắp xếp">
            <option value="newest">Mới thêm</option>
            <option value="oldest">Cũ nhất</option>
            <option value="start_date">Ngày khởi công</option>
            <option value="title">Tên A–Z</option>
          </SelectInput>
          <div className="hidden rounded-lg bg-slate-100 p-1 sm:flex">
            {(["grid", "list"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-label={v === "grid" ? "Dạng lưới" : "Dạng danh sách"}
                aria-pressed={view === v}
                onClick={() => setView(v)}
                className={cn("rounded-md p-1.5", view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
              >
                {v === "grid" ? <LayoutGrid className="size-4" /> : <ListIcon className="size-4" />}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading && items.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skel key={i} className="h-72 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-slate-200/80 bg-white">
          <EmptyState
            icon={FolderPlus}
            title={q || sub || status !== "all" ? "Không có dự án phù hợp" : "Chưa có dự án nào"}
            description="Thêm dự án kèm hình ảnh công trình để giới thiệu năng lực với khách hàng."
            action={
              <Link href={`${base}/tao-moi`} className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">
                <FolderPlus className="size-4" /> Thêm dự án
              </Link>
            }
          />
        </div>
      ) : view === "grid" ? (
        <div className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-3", loading && "opacity-60")}>
          {items.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:shadow-lg"
            >
              <Link href={`${base}/${p.id}`} className="relative block aspect-[16/10] overflow-hidden bg-slate-100">
                {p.featured_image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.featured_image} alt={p.title} className="size-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                ) : (
                  <div className="flex size-full items-center justify-center text-slate-300">
                    <Images className="size-10" />
                  </div>
                )}
                <div className="absolute left-3 top-3 flex gap-1.5">
                  <Pill tone={p.status === "published" ? "green" : "slate"} dot className="bg-white/95">
                    {p.status === "published" ? "Hiển thị" : "Đã ẩn"}
                  </Pill>
                </div>
                <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-slate-950/70 px-2 py-0.5 text-xs text-white">
                  <Images className="size-3.5" /> {p.image_count ?? 0}
                </span>
              </Link>
              <div className="flex flex-1 flex-col p-4">
                {p.subcategory && <p className="mb-1 text-xs font-medium uppercase tracking-wide text-indigo-600">{p.subcategory}</p>}
                <Link href={`${base}/${p.id}`} className="line-clamp-2 font-semibold text-slate-900 hover:text-indigo-700">
                  {p.title}
                </Link>
                <div className="mb-4 mt-2 space-y-1 text-xs text-slate-500">
                  {p.location && (
                    <p className="flex items-center gap-1.5 truncate">
                      <MapPin className="size-3.5 shrink-0" /> {p.location}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="size-3.5 shrink-0" />
                    {p.start_date ? `${fmtDate(p.start_date)} → ${p.end_date ? fmtDate(p.end_date) : "nay"}` : `Thêm ngày ${fmtDate(p.created_at)}`}
                  </p>
                </div>
                <div className="mt-auto flex items-center gap-1 border-t border-slate-100 pt-3">
                  <Link href={`${base}/${p.id}`} className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                    <Pencil className="size-3.5" /> Sửa
                  </Link>
                  {p.status === "published" && (
                    <a
                      href={`${cfg.publicPath}/${p.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
                    >
                      <ExternalLink className="size-3.5" /> Xem
                    </a>
                  )}
                  <div className="ml-auto flex">
                    <Btn variant="ghost" size="icon-sm" title={p.status === "published" ? "Ẩn khỏi website" : "Hiển thị lại"} aria-label={p.status === "published" ? "Ẩn khỏi website" : "Hiển thị lại"} onClick={() => toggleArchive(p)}>
                      {p.status === "published" ? <Archive /> : <ArchiveRestore />}
                    </Btn>
                    <Btn variant="ghost" size="icon-sm" className="text-rose-600 hover:bg-rose-50" aria-label="Xoá dự án" onClick={() => setToDelete(p)}>
                      <Trash2 />
                    </Btn>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className={cn("overflow-hidden rounded-xl border border-slate-200/80 bg-white", loading && "opacity-60")}>
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Dự án</th>
                <th className="px-3 py-3">Loại</th>
                <th className="px-3 py-3">Địa điểm</th>
                <th className="px-3 py-3">Trạng thái</th>
                <th className="px-3 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3">
                    <Link href={`${base}/${p.id}`} className="flex items-center gap-3">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {p.featured_image && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.featured_image} alt="" className="size-full object-cover" />
                        )}
                      </div>
                      <span className="line-clamp-2 font-medium text-slate-900 hover:text-indigo-700">{p.title}</span>
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{p.subcategory || "—"}</td>
                  <td className="px-3 py-3 text-slate-600">{p.location || "—"}</td>
                  <td className="px-3 py-3">
                    <Pill tone={p.status === "published" ? "green" : "slate"} dot>
                      {p.status === "published" ? "Hiển thị" : "Đã ẩn"}
                    </Pill>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`${base}/${p.id}`} aria-label="Sửa" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                        <Pencil className="size-4" />
                      </Link>
                      <Btn variant="ghost" size="icon-sm" aria-label="Ẩn/hiện" onClick={() => toggleArchive(p)}>
                        {p.status === "published" ? <Archive /> : <ArchiveRestore />}
                      </Btn>
                      <Btn variant="ghost" size="icon-sm" className="text-rose-600 hover:bg-rose-50" aria-label="Xoá" onClick={() => setToDelete(p)}>
                        <Trash2 />
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta && meta.total > 0 && (
        <div className="mt-4 rounded-xl border border-slate-200/80 bg-white">
          <Pager page={page} totalPages={meta.totalPages} total={meta.total} limit={limit} onChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xoá dự án?"
        description={
          <>
            Dự án <b className="text-slate-800">“{toDelete?.title}”</b> cùng toàn bộ ảnh trong thư viện sẽ bị xoá vĩnh viễn. Nếu chỉ muốn tạm ẩn, hãy dùng nút “Ẩn khỏi website”.
          </>
        }
        confirmLabel="Xoá dự án"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
