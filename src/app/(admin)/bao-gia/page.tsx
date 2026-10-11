"use client";

import * as React from "react";
import { Calculator, ExternalLink, FolderPlus, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { PricingCategory, PricingDetail } from "@/types/admin";
import { cn } from "@/lib/utils";
import {
  Btn,
  ConfirmDialog,
  EmptyState,
  Field,
  LoadingBlock,
  Modal,
  PageHeader,
  Panel,
  TextArea,
  TextInput,
} from "@/components/admin/primitives";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { fmtDate } from "@/components/admin/format";

type CatForm = { id?: string; title: string; description: string };
type DetailForm = { id?: string; category_id: string; title: string; content: string };

export default function PricingPage() {
  const [cats, setCats] = React.useState<PricingCategory[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const [catForm, setCatForm] = React.useState<CatForm | null>(null);
  const [detailForm, setDetailForm] = React.useState<DetailForm | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<{ type: "cat" | "detail"; id: string; title: string } | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await adminApi.getPricing();
      setCats(res.data);
      setActiveId((cur) => (cur && res.data.some((c) => c.id === cur) ? cur : res.data[0]?.id ?? null));
    } catch (e) {
      toast.error(getErrorMessage(e, "Không tải được bảng giá"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const active = cats.find((c) => c.id === activeId) || null;

  const saveCat = async () => {
    if (!catForm?.title.trim()) return toast.error("Vui lòng nhập tên danh mục");
    setSaving(true);
    try {
      const body = { title: catForm.title.trim(), description: catForm.description.trim() };
      if (catForm.id) {
        await adminApi.updatePricingCategory(catForm.id, body);
        toast.success("Đã cập nhật danh mục");
      } else {
        const res = await adminApi.createPricingCategory(body);
        setActiveId(res.data.id);
        toast.success("Đã thêm danh mục");
      }
      setCatForm(null);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const saveDetail = async () => {
    if (!detailForm?.title.trim()) return toast.error("Vui lòng nhập tiêu đề");
    setSaving(true);
    try {
      if (detailForm.id) {
        await adminApi.updatePricingDetail(detailForm.id, { title: detailForm.title.trim(), content: detailForm.content });
        toast.success("Đã cập nhật mục báo giá");
      } else {
        await adminApi.createPricingDetail({
          category_id: detailForm.category_id,
          title: detailForm.title.trim(),
          content: detailForm.content,
        });
        toast.success("Đã thêm mục báo giá");
      }
      setDetailForm(null);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      if (toDelete.type === "cat") await adminApi.deletePricingCategory(toDelete.id);
      else await adminApi.deletePricingDetail(toDelete.id);
      toast.success("Đã xoá");
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
        title="Bảng giá"
        description="Đơn giá thiết kế, thi công hiển thị tại trang Bảng giá trên website."
        actions={
          <>
            <a
              href="/bang-gia"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ExternalLink className="size-4" /> Xem trang
            </a>
            <Btn onClick={() => setCatForm({ title: "", description: "" })}>
              <FolderPlus /> Thêm danh mục
            </Btn>
          </>
        }
      />

      {loading ? (
        <LoadingBlock />
      ) : cats.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Calculator}
            title="Chưa có danh mục báo giá"
            description="Tạo danh mục như “Giá thiết kế nhà phố”, “Giá xây nhà trọn gói”… rồi thêm các mục chi tiết."
            action={
              <Btn onClick={() => setCatForm({ title: "", description: "" })}>
                <FolderPlus /> Thêm danh mục
              </Btn>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <Panel title="Danh mục" description={`${cats.length} danh mục`} bodyClassName="p-2">
            <ul className="space-y-1">
              {cats.map((c) => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(c.id)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition",
                      c.id === activeId ? "bg-indigo-50 font-medium text-indigo-700" : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <span className="line-clamp-2">{c.title}</span>
                    <span className={cn("shrink-0 rounded-full px-2 text-xs tabular-nums", c.id === activeId ? "bg-indigo-100" : "bg-slate-100 text-slate-500")}>
                      {c.details.length}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          {active && (
            <div className="space-y-6">
              <Panel
                title={active.title}
                description={`Tạo ngày ${fmtDate(active.created_at)}`}
                actions={
                  <>
                    <Btn size="sm" variant="outline" onClick={() => setCatForm({ id: active.id, title: active.title, description: active.description || "" })}>
                      <Pencil /> Sửa
                    </Btn>
                    <Btn size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" aria-label="Xoá danh mục" onClick={() => setToDelete({ type: "cat", id: active.id, title: active.title })}>
                      <Trash2 />
                    </Btn>
                  </>
                }
              >
                <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600">
                  {active.description || <span className="italic text-slate-400">Chưa có mô tả cho danh mục này.</span>}
                </p>
              </Panel>

              <Panel
                title="Các mục báo giá"
                actions={
                  <Btn size="sm" onClick={() => setDetailForm({ category_id: active.id, title: "", content: "" })}>
                    <Plus /> Thêm mục
                  </Btn>
                }
                bodyClassName="p-0"
              >
                {active.details.length === 0 ? (
                  <EmptyState title="Chưa có mục nào" description="Thêm bảng đơn giá, điều kiện áp dụng, ghi chú…" />
                ) : (
                  <ul className="divide-y divide-slate-100">
                    {active.details.map((d: PricingDetail) => (
                      <li key={d.id} className="group px-5 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-semibold text-slate-900">{d.title}</h3>
                          <div className="flex shrink-0 gap-1 opacity-70 transition group-hover:opacity-100">
                            <Btn size="icon-sm" variant="ghost" aria-label="Sửa mục" onClick={() => setDetailForm({ id: d.id, category_id: d.category_id, title: d.title, content: d.content || "" })}>
                              <Pencil />
                            </Btn>
                            <Btn size="icon-sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" aria-label="Xoá mục" onClick={() => setToDelete({ type: "detail", id: d.id, title: d.title })}>
                              <Trash2 />
                            </Btn>
                          </div>
                        </div>
                        {d.content && (
                          <div
                            className="prose prose-sm prose-slate mt-2 max-h-60 max-w-none overflow-hidden [mask-image:linear-gradient(to_bottom,black_75%,transparent)]"
                            dangerouslySetInnerHTML={{ __html: d.content }}
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </div>
          )}
        </div>
      )}

      <Modal
        open={!!catForm}
        onOpenChange={(v) => !v && setCatForm(null)}
        title={catForm?.id ? "Sửa danh mục" : "Thêm danh mục báo giá"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setCatForm(null)}>
              Huỷ
            </Btn>
            <Btn onClick={saveCat} loading={saving}>
              Lưu
            </Btn>
          </>
        }
      >
        {catForm && (
          <div className="space-y-4">
            <Field label="Tên danh mục" required htmlFor="cat-title">
              <TextInput id="cat-title" autoFocus value={catForm.title} onChange={(e) => setCatForm({ ...catForm, title: e.target.value })} placeholder="Giá xây nhà trọn gói" />
            </Field>
            <Field label="Mô tả" htmlFor="cat-desc">
              <TextArea id="cat-desc" rows={6} value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} />
            </Field>
          </div>
        )}
      </Modal>

      <Modal
        open={!!detailForm}
        onOpenChange={(v) => !v && setDetailForm(null)}
        title={detailForm?.id ? "Sửa mục báo giá" : "Thêm mục báo giá"}
        size="xl"
        footer={
          <>
            <Btn variant="outline" onClick={() => setDetailForm(null)}>
              Huỷ
            </Btn>
            <Btn onClick={saveDetail} loading={saving}>
              Lưu
            </Btn>
          </>
        }
      >
        {detailForm && (
          <div className="space-y-4">
            <Field label="Tiêu đề" required htmlFor="d-title">
              <TextInput id="d-title" autoFocus value={detailForm.title} onChange={(e) => setDetailForm({ ...detailForm, title: e.target.value })} placeholder="Đơn giá thiết kế nhà phố 2026" />
            </Field>
            <Field label="Nội dung">
              <RichTextEditor compact value={detailForm.content} onChange={(html) => setDetailForm((f) => (f ? { ...f, content: html } : f))} />
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={toDelete?.type === "cat" ? "Xoá danh mục báo giá?" : "Xoá mục báo giá?"}
        description={
          toDelete?.type === "cat" ? (
            <>
              Danh mục <b className="text-slate-800">“{toDelete?.title}”</b> và toàn bộ mục bên trong sẽ bị xoá.
            </>
          ) : (
            <>
              Mục <b className="text-slate-800">“{toDelete?.title}”</b> sẽ bị xoá vĩnh viễn.
            </>
          )
        }
        confirmLabel="Xoá"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
