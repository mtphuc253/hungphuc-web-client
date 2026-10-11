"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, ExternalLink, Handshake, ImageIcon, Link2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { AdminBanner, AdminPartner } from "@/types/admin";
import {
  Btn,
  ConfirmDialog,
  EmptyState,
  Field,
  LoadingBlock,
  Modal,
  PageHeader,
  Panel,
  SegmentTabs,
  TextInput,
} from "@/components/admin/primitives";
import { ImageUploader } from "@/components/admin/image-uploader";

type Tab = "banners" | "partners";

export default function OthersPage() {
  const [tab, setTab] = React.useState<Tab>("banners");
  const [banners, setBanners] = React.useState<AdminBanner[]>([]);
  const [partners, setPartners] = React.useState<AdminPartner[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const [b, p] = await Promise.all([adminApi.getBanners(), adminApi.getPartners()]);
      setBanners(b.data);
      setPartners(p.data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không tải được dữ liệu"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <PageHeader
        title="Banner & Đối tác"
        description="Ảnh trình chiếu ở trang chủ và logo đối tác chạy ở cuối trang."
        actions={
          <SegmentTabs
            value={tab}
            onChange={setTab}
            items={[
              { value: "banners", label: "Banner trang chủ", count: banners.length },
              { value: "partners", label: "Đối tác", count: partners.length },
            ]}
          />
        }
      />
      {loading ? (
        <LoadingBlock />
      ) : tab === "banners" ? (
        <BannerManager banners={banners} setBanners={setBanners} reload={load} />
      ) : (
        <PartnerManager partners={partners} reload={load} />
      )}
    </>
  );
}

/* --------------------------------- Banners --------------------------------- */

type BannerForm = { id?: string; title: string; image_url: string | null; link_url: string };

function BannerManager({
  banners,
  setBanners,
  reload,
}: {
  banners: AdminBanner[];
  setBanners: (b: AdminBanner[]) => void;
  reload: () => void;
}) {
  const [form, setForm] = React.useState<BannerForm | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<AdminBanner | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const MAX = 10;

  const save = async () => {
    if (!form) return;
    if (!form.image_url) return toast.error("Vui lòng tải ảnh banner");
    if (form.link_url && !/^(https?:\/\/|\/)/.test(form.link_url)) return toast.error("Liên kết phải bắt đầu bằng / hoặc http(s)://");
    setSaving(true);
    try {
      const body = { title: form.title.trim() || null, image_url: form.image_url, link_url: form.link_url.trim() || null };
      if (form.id) await adminApi.updateBanner(form.id, body);
      else await adminApi.createBanner(body);
      toast.success(form.id ? "Đã cập nhật banner" : "Đã thêm banner");
      setForm(null);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...banners];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setBanners(next);
    try {
      await adminApi.reorderBanners(next.map((b) => b.id));
    } catch (e) {
      toast.error(getErrorMessage(e));
      reload();
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await adminApi.deleteBanner(toDelete.id);
      toast.success("Đã xoá banner");
      setToDelete(null);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Panel
      title="Banner trang chủ"
      description={`${banners.length}/${MAX} banner · Hiển thị theo thứ tự từ trên xuống. Kích thước khuyến nghị 1920×800.`}
      actions={
        <Btn onClick={() => setForm({ title: "", image_url: null, link_url: "" })} disabled={banners.length >= MAX}>
          <Plus /> Thêm banner
        </Btn>
      }
    >
      {banners.length === 0 ? (
        <EmptyState icon={ImageIcon} title="Chưa có banner" description="Thêm ảnh công trình đẹp nhất để gây ấn tượng ngay khi khách vào website." />
      ) : (
        <ul className="space-y-3">
          {banners.map((b, i) => (
            <li key={b.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold tabular-nums text-slate-600">{i + 1}</span>
                <div className="aspect-[12/5] w-full overflow-hidden rounded-lg bg-slate-100 sm:w-60">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={b.image_url} alt={b.title || "Banner"} className="size-full object-cover" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-900">{b.title || <span className="italic text-slate-400">Không có tiêu đề</span>}</p>
                {b.link_url ? (
                  <a href={b.link_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-indigo-600 hover:underline">
                    <Link2 className="size-3.5 shrink-0" /> {b.link_url}
                  </a>
                ) : (
                  <p className="mt-1 text-xs text-slate-400">Không gắn liên kết</p>
                )}
              </div>
              <div className="flex items-center gap-1 self-end sm:self-center">
                <Btn variant="ghost" size="icon-sm" aria-label="Đưa lên" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUp />
                </Btn>
                <Btn variant="ghost" size="icon-sm" aria-label="Đưa xuống" disabled={i === banners.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDown />
                </Btn>
                <Btn variant="outline" size="sm" onClick={() => setForm({ id: b.id, title: b.title || "", image_url: b.image_url, link_url: b.link_url || "" })}>
                  <Pencil /> Sửa
                </Btn>
                <Btn variant="ghost" size="icon-sm" className="text-rose-600 hover:bg-rose-50" aria-label="Xoá banner" onClick={() => setToDelete(b)}>
                  <Trash2 />
                </Btn>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.id ? "Sửa banner" : "Thêm banner"}
        size="lg"
        footer={
          <>
            <Btn variant="outline" onClick={() => setForm(null)}>
              Huỷ
            </Btn>
            <Btn onClick={save} loading={saving}>
              Lưu banner
            </Btn>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <Field label="Ảnh banner" required>
              <ImageUploader value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} aspect="aspect-[12/5]" />
            </Field>
            <Field label="Tiêu đề (dùng làm ALT ảnh)" htmlFor="b-title" hint="Mô tả ngắn nội dung ảnh, ví dụ: Biệt thự hiện đại 3 tầng do Hưng Phúc thi công">
              <TextInput id="b-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Liên kết khi bấm (tuỳ chọn)" htmlFor="b-link" hint="Ví dụ: /thi-cong-xay-dung hoặc https://...">
              <TextInput id="b-link" value={form.link_url} onChange={(e) => setForm({ ...form, link_url: e.target.value })} placeholder="/lien-lac" />
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xoá banner?"
        confirmLabel="Xoá banner"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </Panel>
  );
}

/* --------------------------------- Partners -------------------------------- */

type PartnerForm = { id?: string; name: string; logo_url: string | null; website_url: string };

function PartnerManager({ partners, reload }: { partners: AdminPartner[]; reload: () => void }) {
  const [form, setForm] = React.useState<PartnerForm | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<AdminPartner | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const save = async () => {
    if (!form) return;
    if (!form.name.trim()) return toast.error("Vui lòng nhập tên đối tác");
    if (!form.logo_url) return toast.error("Vui lòng tải logo đối tác");
    if (form.website_url && !/^https?:\/\//.test(form.website_url)) return toast.error("Website phải bắt đầu bằng http(s)://");
    setSaving(true);
    try {
      const body = { name: form.name.trim(), logo_url: form.logo_url, website_url: form.website_url.trim() || null };
      if (form.id) await adminApi.updatePartner(form.id, body);
      else await adminApi.createPartner(body);
      toast.success(form.id ? "Đã cập nhật đối tác" : "Đã thêm đối tác");
      setForm(null);
      reload();
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
      await adminApi.deletePartner(toDelete.id);
      toast.success("Đã xoá đối tác");
      setToDelete(null);
      reload();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Panel
      title="Đối tác"
      description="Logo chạy ngang ở cuối trang chủ. Nên dùng logo nền trong suốt."
      actions={
        <Btn onClick={() => setForm({ name: "", logo_url: null, website_url: "" })}>
          <Plus /> Thêm đối tác
        </Btn>
      }
    >
      {partners.length === 0 ? (
        <EmptyState icon={Handshake} title="Chưa có đối tác" description="Thêm logo nhà cung cấp, chủ đầu tư… để tăng độ tin cậy." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {partners.map((p) => (
            <li key={p.id} className="group overflow-hidden rounded-xl border border-slate-200">
              <div className="flex h-32 items-center justify-center bg-slate-50 p-4">
                {p.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.logo_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <Handshake className="size-8 text-slate-300" />
                )}
              </div>
              <div className="flex items-center gap-2 border-t border-slate-100 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{p.name}</p>
                  {p.website_url ? (
                    <a href={p.website_url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 truncate text-xs text-indigo-600 hover:underline">
                      <ExternalLink className="size-3 shrink-0" /> {p.website_url.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    <p className="text-xs text-slate-400">Không có website</p>
                  )}
                </div>
                <Btn variant="ghost" size="icon-sm" aria-label={`Sửa ${p.name}`} onClick={() => setForm({ id: p.id, name: p.name, logo_url: p.logo_url, website_url: p.website_url || "" })}>
                  <Pencil />
                </Btn>
                <Btn variant="ghost" size="icon-sm" className="text-rose-600 hover:bg-rose-50" aria-label={`Xoá ${p.name}`} onClick={() => setToDelete(p)}>
                  <Trash2 />
                </Btn>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.id ? "Sửa đối tác" : "Thêm đối tác"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setForm(null)}>
              Huỷ
            </Btn>
            <Btn onClick={save} loading={saving}>
              Lưu
            </Btn>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <Field label="Logo" required>
              <ImageUploader value={form.logo_url} onChange={(url) => setForm({ ...form, logo_url: url })} aspect="aspect-[2/1]" fit="contain" />
            </Field>
            <Field label="Tên đối tác" required htmlFor="p-name">
              <TextInput id="p-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Website" htmlFor="p-web">
              <TextInput id="p-web" value={form.website_url} onChange={(e) => setForm({ ...form, website_url: e.target.value })} placeholder="https://" />
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Xoá đối tác "${toDelete?.name}"?`}
        confirmLabel="Xoá đối tác"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </Panel>
  );
}
