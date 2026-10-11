"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useDebounce } from "use-debounce";
import {
  Eye,
  EyeOff,
  ExternalLink,
  FilePlus2,
  MoreHorizontal,
  Newspaper,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { AdminArticle, PageMeta } from "@/types/admin";
import {
  ConfirmDialog,
  EmptyState,
  PageHeader,
  Pager,
  Pill,
  SegmentTabs,
  SelectInput,
  Skel,
  TextInput,
} from "@/components/admin/primitives";
import { ARTICLE_CATEGORIES, fmtDate, fmtDateTime } from "@/components/admin/format";

type StatusTab = "all" | "published" | "draft";

export function ArticleList() {
  const router = useRouter();
  const sp = useSearchParams();

  const [status, setStatus] = React.useState<StatusTab>((sp.get("status") as StatusTab) || "all");
  const [category, setCategory] = React.useState(sp.get("category") || "");
  const [sort, setSort] = React.useState(sp.get("sort") || "newest");
  const [page, setPage] = React.useState(Number(sp.get("page")) || 1);
  const [search, setSearch] = React.useState(sp.get("q") || "");
  const [q] = useDebounce(search, 400);

  const [items, setItems] = React.useState<AdminArticle[]>([]);
  const [meta, setMeta] = React.useState<PageMeta | null>(null);
  const [counts, setCounts] = React.useState<Record<StatusTab, number> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [toDelete, setToDelete] = React.useState<AdminArticle | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const limit = 12;

  // Đồng bộ bộ lọc lên URL để có thể chia sẻ / quay lại
  React.useEffect(() => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (category) params.set("category", category);
    if (sort !== "newest") params.set("sort", sort);
    if (q) params.set("q", q);
    if (page > 1) params.set("page", String(page));
    router.replace(`/bai-viet${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }, [status, category, sort, q, page, router]);

  // Đổi bộ lọc -> quay về trang 1 (không chạy lúc mount để giữ ?page= trên URL)
  const filterKey = `${status}|${category}|${sort}|${q}`;
  const prevFilterKey = React.useRef(filterKey);
  React.useEffect(() => {
    if (prevFilterKey.current !== filterKey) {
      prevFilterKey.current = filterKey;
      setPage(1);
    }
  }, [filterKey]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi.getArticles({ page, limit, status, category, sort, title: q });
      setItems(res.data);
      setMeta(res.meta ?? null);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không tải được danh sách bài viết"));
    } finally {
      setLoading(false);
    }
  }, [page, status, category, sort, q]);

  const loadCounts = React.useCallback(async () => {
    try {
      const [all, pub, draft] = await Promise.all(
        (["all", "published", "draft"] as const).map((s) => adminApi.getArticles({ limit: 1, status: s, category, title: q }))
      );
      setCounts({ all: all.meta?.total ?? 0, published: pub.meta?.total ?? 0, draft: draft.meta?.total ?? 0 });
    } catch {
      /* bỏ qua */
    }
  }, [category, q]);

  React.useEffect(() => {
    load();
  }, [load]);
  React.useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  const togglePublish = async (a: AdminArticle) => {
    try {
      await adminApi.updateArticle(a.id, { is_published: !a.is_published });
      toast.success(a.is_published ? "Đã chuyển về bản nháp" : "Đã xuất bản bài viết");
      load();
      loadCounts();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteArticle(toDelete.id);
      toast.success("Đã xoá bài viết");
      setToDelete(null);
      load();
      loadCounts();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Bài viết"
        description="Quản lý tin tức, cẩm nang xây dựng — nội dung giúp website lên top Google."
        actions={
          <Link
            href="/bai-viet/tao-moi"
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <FilePlus2 className="size-4" /> Viết bài mới
          </Link>
        }
      />

      <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 lg:flex-row lg:items-center lg:justify-between">
          <SegmentTabs
            value={status}
            onChange={setStatus}
            items={[
              { value: "all", label: "Tất cả", count: counts?.all },
              { value: "published", label: "Đã xuất bản", count: counts?.published },
              { value: "draft", label: "Bản nháp", count: counts?.draft },
            ]}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative sm:w-64">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <TextInput
                className="h-9 pl-9"
                placeholder="Tìm theo tiêu đề, slug…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Tìm bài viết"
              />
            </div>
            <SelectInput className="h-9 sm:w-52" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Lọc danh mục">
              <option value="">Tất cả danh mục</option>
              {ARTICLE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
            <SelectInput className="h-9 sm:w-44" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sắp xếp">
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="updated">Vừa cập nhật</option>
              <option value="title">Tiêu đề A–Z</option>
            </SelectInput>
          </div>
        </div>

        {loading && items.length === 0 ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skel key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Newspaper}
            title={q || category || status !== "all" ? "Không tìm thấy bài viết phù hợp" : "Chưa có bài viết nào"}
            description={q || category ? "Thử thay đổi từ khoá hoặc bộ lọc." : "Bắt đầu viết bài đầu tiên để thu hút khách hàng từ Google."}
            action={
              <Link href="/bai-viet/tao-moi" className="inline-flex h-9 items-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-medium text-white hover:bg-indigo-700">
                <FilePlus2 className="size-4" /> Viết bài mới
              </Link>
            }
          />
        ) : (
          <div className={loading ? "opacity-60 transition" : "transition"}>
            <table className="w-full text-sm">
              <thead className="hidden border-b border-slate-100 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500 md:table-header-group">
                <tr>
                  <th className="px-5 py-3">Bài viết</th>
                  <th className="px-3 py-3">Danh mục</th>
                  <th className="px-3 py-3">Trạng thái</th>
                  <th className="hidden px-3 py-3 xl:table-cell">Tác giả</th>
                  <th className="px-3 py-3">Ngày đăng</th>
                  <th className="w-14 px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((a) => (
                  <tr key={a.id} className="group flex flex-wrap items-center gap-x-3 px-4 py-3 hover:bg-slate-50/70 md:table-row md:p-0">
                    <td className="w-full md:w-auto md:px-5 md:py-3">
                      <Link href={`/bai-viet/${a.id}`} className="flex items-center gap-3">
                        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 ring-1 ring-slate-200/60">
                          {a.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={a.thumbnail_url} alt="" className="size-full object-cover" loading="lazy" />
                          ) : (
                            <div className="flex size-full items-center justify-center text-slate-300">
                              <Newspaper className="size-5" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 font-medium text-slate-900 group-hover:text-indigo-700">{a.title}</p>
                          <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">/tin-tuc/{a.slug}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="mt-2 md:mt-0 md:px-3 md:py-3">
                      <Pill tone="indigo">{a.category}</Pill>
                    </td>
                    <td className="mt-2 md:mt-0 md:px-3 md:py-3">
                      <Pill tone={a.is_published ? "green" : "slate"} dot>
                        {a.is_published ? "Đã xuất bản" : "Bản nháp"}
                      </Pill>
                    </td>
                    <td className="hidden text-slate-600 xl:table-cell xl:px-3 xl:py-3">{a.author_name || "—"}</td>
                    <td className="mt-2 text-xs text-slate-500 md:mt-0 md:px-3 md:py-3" title={`Cập nhật: ${fmtDateTime(a.updated_at)}`}>
                      {a.is_published ? fmtDate(a.published_at) : <span className="italic">Chưa đăng</span>}
                    </td>
                    <td className="ml-auto mt-2 md:mt-0 md:px-3 md:py-3">
                      <RowMenu
                        article={a}
                        onToggle={() => togglePublish(a)}
                        onDelete={() => setToDelete(a)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta && meta.total > 0 && (
          <Pager page={page} totalPages={meta.totalPages} total={meta.total} limit={limit} onChange={setPage} />
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xoá bài viết?"
        description={
          <>
            Bài viết <b className="text-slate-800">“{toDelete?.title}”</b> sẽ bị xoá vĩnh viễn và đường dẫn sẽ trả về lỗi 404.
          </>
        }
        confirmLabel="Xoá bài viết"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function RowMenu({
  article,
  onToggle,
  onDelete,
}: {
  article: AdminArticle;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const item =
    "flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-slate-100";
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Thao tác"
          className="rounded-lg p-2 text-slate-400 outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-500/40"
        >
          <MoreHorizontal className="size-4" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={4} className="z-50 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <DropdownMenu.Item asChild>
            <Link href={`/bai-viet/${article.id}`} className={item}>
              <Pencil className="size-4" /> Chỉnh sửa
            </Link>
          </DropdownMenu.Item>
          {article.is_published && (
            <DropdownMenu.Item asChild>
              <a href={`/tin-tuc/${article.slug}`} target="_blank" rel="noreferrer" className={item}>
                <ExternalLink className="size-4" /> Xem trên website
              </a>
            </DropdownMenu.Item>
          )}
          <DropdownMenu.Item onSelect={onToggle} className={item}>
            {article.is_published ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            {article.is_published ? "Chuyển về nháp" : "Xuất bản ngay"}
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
          <DropdownMenu.Item onSelect={onDelete} className={`${item} text-rose-600 data-[highlighted]:bg-rose-50`}>
            <Trash2 className="size-4" /> Xoá bài viết
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
