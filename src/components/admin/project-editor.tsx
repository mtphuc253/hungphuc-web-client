"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ExternalLink, Link2, Save, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { AdminProject, ProjectCategory, ProjectImage, ProjectPayload, ProjectStatus } from "@/types/admin";
import {
  Btn,
  ConfirmDialog,
  Field,
  LoadingBlock,
  Panel,
  Pill,
  SelectInput,
  Switch,
  TextArea,
  TextInput,
} from "./primitives";
import { ImageUploader } from "./image-uploader";
import { GalleryManager } from "./gallery-manager";
import { SerpPreview, SeoChecklist, type SeoCheck } from "./seo-panel";
import { fmtDateTime, PROJECT_CATEGORY, slugify, toDateInput } from "./format";

const SUGGESTED_SUBCATEGORIES = [
  "nhà phố",
  "biệt thự",
  "nhà cấp 4",
  "nhà xưởng",
  "văn phòng",
  "nhà hàng - khách sạn",
  "chung cư",
  "công trình công cộng",
];

interface FormState {
  title: string;
  slug: string;
  category: ProjectCategory;
  subcategory: string;
  location: string;
  client_name: string;
  start_date: string;
  end_date: string;
  description: string;
  featured_image: string | null;
  meta_title: string;
  meta_description: string;
  status: ProjectStatus;
  images: ProjectImage[];
}

const fromProject = (p: AdminProject): FormState => ({
  title: p.title,
  slug: p.slug,
  category: p.category,
  subcategory: p.subcategory || "",
  location: p.location || "",
  client_name: p.client_name || "",
  start_date: toDateInput(p.start_date),
  end_date: toDateInput(p.end_date),
  description: p.description || "",
  featured_image: p.featured_image,
  meta_title: p.meta_title || "",
  meta_description: p.meta_description || "",
  status: p.status,
  images: (p.images || []).map((i) => ({ image_url: i.image_url, caption: i.caption || "", alt_text: i.alt_text || "" })),
});

export function ProjectEditor({ category, id }: { category: ProjectCategory; id?: string }) {
  const router = useRouter();
  const isNew = !id;

  const empty: FormState = React.useMemo(
    () => ({
      title: "",
      slug: "",
      category,
      subcategory: "",
      location: "",
      client_name: "",
      start_date: "",
      end_date: "",
      description: "",
      featured_image: null,
      meta_title: "",
      meta_description: "",
      status: "published",
      images: [],
    }),
    [category]
  );

  const [form, setForm] = React.useState<FormState>(empty);
  const [original, setOriginal] = React.useState<FormState>(empty);
  const [project, setProject] = React.useState<AdminProject | null>(null);
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(!isNew);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [subs, setSubs] = React.useState<string[]>(SUGGESTED_SUBCATEGORIES);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const cfg = PROJECT_CATEGORY[form.category];
  const listPath = `/quan-ly-du-an/${PROJECT_CATEGORY[category].slug}`;

  React.useEffect(() => {
    adminApi
      .getSubcategories()
      .then((r) => setSubs(Array.from(new Set([...r.data.map((s) => s.subcategory), ...SUGGESTED_SUBCATEGORIES]))))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await adminApi.getProject(id);
        const f = fromProject(res.data);
        setProject(res.data);
        setForm(f);
        setOriginal(f);
      } catch (e) {
        toast.error(getErrorMessage(e, "Không tìm thấy dự án"));
        router.replace(listPath);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router, listPath]);

  const dirty = React.useMemo(() => JSON.stringify(form) !== JSON.stringify(original), [form, original]);

  React.useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (dirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Vui lòng nhập tên dự án";
    if (form.start_date && form.end_date && form.start_date > form.end_date) e.end_date = "Ngày hoàn thành phải sau ngày khởi công";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error(Object.values(e)[0]);
      return false;
    }
    return true;
  };

  const save = async () => {
    if (!validate()) return;
    const featured = form.featured_image || form.images[0]?.image_url || null;
    const payload: ProjectPayload = {
      title: form.title.trim(),
      slug: form.slug ? slugify(form.slug) : undefined,
      category: form.category,
      subcategory: form.subcategory.trim() || null,
      location: form.location.trim() || null,
      client_name: form.client_name.trim() || null,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      description: form.description.trim() || null,
      featured_image: featured,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      status: form.status,
      images: form.images,
    };
    setSaving(true);
    try {
      if (isNew) {
        const res = await adminApi.createProject(payload);
        toast.success("Đã tạo dự án");
        setOriginal(form);
        router.replace(`/quan-ly-du-an/${PROJECT_CATEGORY[res.data.category].slug}/${res.data.id}`);
      } else {
        const res = await adminApi.updateProject(id!, payload);
        const f = fromProject(res.data);
        setProject(res.data);
        setForm(f);
        setOriginal(f);
        toast.success("Đã lưu thay đổi");
        if (res.data.category !== category) {
          router.replace(`/quan-ly-du-an/${PROJECT_CATEGORY[res.data.category].slug}/${res.data.id}`);
        }
      }
    } catch (e) {
      const msg = getErrorMessage(e, "Lưu dự án thất bại");
      if (/slug/i.test(msg)) setErrors((er) => ({ ...er, slug: msg }));
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  const saveRef = React.useRef(save);
  saveRef.current = save;
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await adminApi.deleteProject(id);
      toast.success("Đã xoá dự án");
      setOriginal(form);
      router.replace(listPath);
    } catch (e) {
      toast.error(getErrorMessage(e));
      setDeleting(false);
    }
  };

  const seoTitle = form.meta_title || form.title;
  const seoDesc = form.meta_description || form.description;
  const checks: SeoCheck[] = [
    { ok: seoTitle.length >= 30 && seoTitle.length <= 65 ? true : seoTitle ? null : false, label: `Tiêu đề SEO 30–65 ký tự (hiện ${seoTitle.length})` },
    { ok: seoDesc.length >= 120 && seoDesc.length <= 160 ? true : seoDesc ? null : false, label: `Mô tả SEO 120–160 ký tự (hiện ${seoDesc.length})` },
    { ok: !!(form.featured_image || form.images[0]), label: "Có ảnh đại diện" },
    { ok: form.images.length >= 4 ? true : form.images.length ? null : false, label: `Thư viện ≥ 4 ảnh (hiện ${form.images.length})` },
    { ok: form.images.length > 0 && form.images.every((i) => i.alt_text?.trim()), label: "Tất cả ảnh có mô tả ALT" },
    { ok: !!form.location.trim(), label: "Có địa điểm công trình (SEO địa phương)" },
    { ok: !!form.subcategory.trim(), label: "Có loại công trình" },
    { ok: form.description.trim().length >= 150 ? true : form.description ? null : false, label: "Mô tả dự án chi tiết (≥ 150 ký tự)" },
  ];

  if (loading) return <LoadingBlock label="Đang tải dự án…" />;

  const publicPath = `${cfg.publicPath}/${form.slug || slugify(form.title) || "duong-dan-du-an"}`;

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link href={listPath} className="mb-1 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="size-4" /> {PROJECT_CATEGORY[category].label}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">{isNew ? "Thêm dự án mới" : "Chỉnh sửa dự án"}</h1>
            {!isNew && (
              <Pill tone={project?.status === "published" ? "green" : "slate"} dot>
                {project?.status === "published" ? "Đang hiển thị" : "Đã ẩn"}
              </Pill>
            )}
            {dirty && <Pill tone="amber">Chưa lưu</Pill>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isNew && project?.status === "published" && (
            <a
              href={`${PROJECT_CATEGORY[project.category].publicPath}/${project.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ExternalLink className="size-4" /> Xem trên website
            </a>
          )}
          <Btn onClick={save} loading={saving} disabled={!isNew && !dirty}>
            {!saving && <Save />} {isNew ? "Tạo dự án" : "Lưu thay đổi"}
          </Btn>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <Panel title="Thông tin dự án" bodyClassName="space-y-5">
            <Field label="Tên dự án" htmlFor="title" required error={errors.title}>
              <TextInput
                id="title"
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
                  setErrors((er) => ({ ...er, title: undefined }));
                }}
                placeholder="Ví dụ: Thiết kế biệt thự hiện đại 3 tầng tại Thảo Điền"
                className="h-11 text-base font-semibold"
                aria-invalid={!!errors.title}
                autoFocus={isNew}
              />
            </Field>

            <Field label="Đường dẫn (slug)" htmlFor="slug" error={errors.slug}>
              <div className="flex overflow-hidden rounded-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                <span className="hidden items-center gap-1 border-r border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 sm:flex">
                  <Link2 className="size-3.5" /> {cfg.publicPath}/
                </span>
                <input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    set("slug", e.target.value);
                  }}
                  onBlur={() => set("slug", slugify(form.slug))}
                  className="h-10 min-w-0 flex-1 px-3 font-mono text-sm outline-none"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSlugTouched(false);
                    set("slug", slugify(form.title));
                  }}
                  className="flex items-center gap-1 border-l border-slate-200 px-3 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                >
                  <Wand2 className="size-3.5" /> Tự tạo
                </button>
              </div>
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Loại công trình" htmlFor="sub" hint="Chọn gợi ý hoặc nhập mới">
                <TextInput id="sub" list="subcategory-options" value={form.subcategory} onChange={(e) => set("subcategory", e.target.value)} placeholder="biệt thự, nhà phố…" />
                <datalist id="subcategory-options">
                  {subs.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </Field>
              <Field label="Địa điểm" htmlFor="loc">
                <TextInput id="loc" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Quận 7, TP. Hồ Chí Minh" />
              </Field>
              <Field label="Chủ đầu tư / khách hàng" htmlFor="client">
                <TextInput id="client" value={form.client_name} onChange={(e) => set("client_name", e.target.value)} placeholder="Anh Minh, Công ty ABC…" />
              </Field>
              <Field label="Danh mục" htmlFor="cat">
                <SelectInput id="cat" value={form.category} onChange={(e) => set("category", e.target.value as ProjectCategory)}>
                  <option value="architecture">Thiết kế kiến trúc</option>
                  <option value="construction">Thi công xây dựng</option>
                </SelectInput>
              </Field>
              <Field label="Ngày khởi công" htmlFor="start">
                <TextInput id="start" type="date" value={form.start_date} onChange={(e) => set("start_date", e.target.value)} />
              </Field>
              <Field label="Ngày hoàn thành" htmlFor="end" error={errors.end_date}>
                <TextInput id="end" type="date" value={form.end_date} min={form.start_date || undefined} onChange={(e) => set("end_date", e.target.value)} aria-invalid={!!errors.end_date} />
              </Field>
            </div>

            <Field
              label="Mô tả dự án"
              htmlFor="desc"
              hint="Giới thiệu quy mô, phong cách, vật liệu, điểm nổi bật… Xuống dòng để tách đoạn."
              counter={{ value: form.description.length, max: 3000 }}
            >
              <TextArea id="desc" rows={8} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
          </Panel>

          <Panel title="Thư viện ảnh công trình" description="Kéo thứ tự bằng nút mũi tên. Ảnh đầu tiên được dùng làm ảnh đại diện nếu chưa chọn.">
            <GalleryManager
              images={form.images}
              onChange={(imgs) => set("images", imgs)}
              featured={form.featured_image}
              onSetFeatured={(url) => set("featured_image", url)}
              altPrefix={form.title}
            />
          </Panel>

          <Panel title="Tối ưu SEO" description="Để trống sẽ dùng tên và mô tả dự án" bodyClassName="space-y-5">
            <Field label="Tiêu đề SEO (meta title)" htmlFor="mt" counter={{ value: form.meta_title.length, max: 65, min: 30 }}>
              <TextInput id="mt" value={form.meta_title} onChange={(e) => set("meta_title", e.target.value)} placeholder={form.title} maxLength={200} />
            </Field>
            <Field label="Mô tả SEO (meta description)" htmlFor="md" counter={{ value: form.meta_description.length, max: 160, min: 120 }}>
              <TextArea id="md" rows={3} value={form.meta_description} onChange={(e) => set("meta_description", e.target.value)} />
            </Field>
            <SerpPreview title={seoTitle} description={seoDesc} path={publicPath} />
          </Panel>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Panel title="Hiển thị" bodyClassName="space-y-4">
            <Switch
              id="status"
              checked={form.status === "published"}
              onChange={(v) => set("status", v ? "published" : "archived")}
              label="Hiển thị trên website"
              description={form.status === "published" ? "Khách hàng xem được dự án này" : "Dự án đang bị ẩn"}
            />
            {!isNew && (
              <dl className="space-y-2 rounded-lg bg-slate-50 p-3 text-xs">
                <div className="flex justify-between">
                  <dt className="text-slate-500">Tạo lúc</dt>
                  <dd className="text-slate-700">{fmtDateTime(project?.created_at)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Cập nhật</dt>
                  <dd className="text-slate-700">{fmtDateTime(project?.updated_at)}</dd>
                </div>
              </dl>
            )}
          </Panel>

          <Panel title="Ảnh đại diện" description="Ảnh bìa ở danh sách dự án và khi chia sẻ">
            <ImageUploader value={form.featured_image} onChange={(url) => set("featured_image", url)} aspect="aspect-[16/10]" />
          </Panel>

          <Panel title="Kiểm tra SEO">
            <SeoChecklist checks={checks} />
          </Panel>

          {!isNew && (
            <Panel bodyClassName="p-4">
              <Btn variant="ghost" className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setConfirmDelete(true)}>
                <Trash2 /> Xoá dự án
              </Btn>
            </Panel>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá dự án?"
        description="Dự án và toàn bộ ảnh trong thư viện sẽ bị xoá vĩnh viễn."
        confirmLabel="Xoá dự án"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
