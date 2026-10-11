"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CalendarClock, ExternalLink, Link2, Save, Send, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { AdminArticleDetail, ArticlePayload } from "@/types/admin";
import { useAppSelector } from "@/store/hooks";
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
} from "@/components/admin/primitives";
import { RichTextEditor } from "@/components/admin/rich-text-editor";
import { ImageUploader } from "@/components/admin/image-uploader";
import { TagInput } from "@/components/admin/tag-input";
import { SerpPreview, SeoChecklist, SITE_URL, type SeoCheck } from "@/components/admin/seo-panel";
import {
  ARTICLE_CATEGORIES,
  fmtDateTime,
  slugify,
  stripHtml,
  toDateTimeInput,
  wordCount,
} from "@/components/admin/format";

interface FormState {
  title: string;
  slug: string;
  content: string;
  description: string;
  thumbnail_url: string | null;
  category: string;
  keywords: string[];
  canonical_url: string;
  is_published: boolean;
  published_at: string; // datetime-local
}

const EMPTY: FormState = {
  title: "",
  slug: "",
  content: "",
  description: "",
  thumbnail_url: null,
  category: "Cẩm nang xây dựng",
  keywords: [],
  canonical_url: "",
  is_published: true,
  published_at: "",
};

const fromArticle = (a: AdminArticleDetail): FormState => ({
  title: a.title,
  slug: a.slug,
  content: a.content || "",
  description: a.description || "",
  thumbnail_url: a.thumbnail_url,
  category: a.category,
  keywords: Array.isArray(a.keywords)
    ? a.keywords
    : (a.keywords || "")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
  canonical_url: a.canonical_url || "",
  is_published: a.is_published,
  published_at: toDateTimeInput(a.published_at),
});

export function ArticleEditor({ id }: { id?: string }) {
  const router = useRouter();
  const user = useAppSelector((s) => s.auth.user);
  const isNew = !id;

  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [original, setOriginal] = React.useState<FormState>(EMPTY);
  const [article, setArticle] = React.useState<AdminArticleDetail | null>(null);
  const [loading, setLoading] = React.useState(!isNew);
  const [saving, setSaving] = React.useState<null | "draft" | "publish">(null);
  const [slugTouched, setSlugTouched] = React.useState(!isNew);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await adminApi.getArticle(id);
        const f = fromArticle(res.data);
        setArticle(res.data);
        setForm(f);
        setOriginal(f);
      } catch (e) {
        toast.error(getErrorMessage(e, "Không tìm thấy bài viết"));
        router.replace("/bai-viet");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, router]);

  const dirty = React.useMemo(() => JSON.stringify(form) !== JSON.stringify(original), [form, original]);

  // Cảnh báo khi rời trang chưa lưu
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

  const onTitle = (title: string) => {
    setForm((f) => ({ ...f, title, slug: slugTouched ? f.slug : slugify(title) }));
    setErrors((e) => ({ ...e, title: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Vui lòng nhập tiêu đề bài viết";
    else if (form.title.length > 200) e.title = "Tiêu đề tối đa 200 ký tự";
    if (!stripHtml(form.content) && !/<img/i.test(form.content)) e.content = "Nội dung bài viết không được để trống";
    if (form.canonical_url && !/^https?:\/\//i.test(form.canonical_url)) e.canonical_url = "URL canonical phải bắt đầu bằng http(s)://";
    else if (form.canonical_url && ownDomainCanonical(form.canonical_url))
      e.canonical_url = "Không cần nhập canonical trỏ về chính website – hãy để trống (hệ thống tự tạo).";
    setErrors(e);
    if (Object.keys(e).length) {
      toast.error(Object.values(e)[0]);
      return false;
    }
    return true;
  };

  const save = async (mode: "draft" | "publish" | "update") => {
    if (!validate()) return;
    const isPublished = mode === "draft" ? false : mode === "publish" ? true : form.is_published;
    const payload: ArticlePayload = {
      title: form.title.trim(),
      slug: form.slug ? slugify(form.slug) : undefined,
      content: form.content,
      description: form.description.trim(),
      thumbnail_url: form.thumbnail_url,
      category: form.category,
      keywords: form.keywords,
      canonical_url: form.canonical_url.trim(),
      is_published: isPublished,
      published_at: isPublished && form.published_at ? new Date(form.published_at).toISOString() : null,
    };

    setSaving(mode === "draft" ? "draft" : "publish");
    try {
      if (isNew) {
        const res = await adminApi.createArticle(payload);
        toast.success(isPublished ? "Đã đăng bài viết 🎉" : "Đã lưu bản nháp");
        setOriginal(form); // tránh cảnh báo rời trang
        router.replace(`/bai-viet/${res.data.id}`);
      } else {
        const res = await adminApi.updateArticle(id!, payload);
        const f = fromArticle({ ...res.data, author_name: article?.author_name ?? null });
        setArticle((a) => ({ ...res.data, author_name: a?.author_name ?? null }));
        setForm(f);
        setOriginal(f);
        toast.success(
          mode === "draft" ? "Đã chuyển về bản nháp" : mode === "publish" ? "Đã xuất bản bài viết" : "Đã lưu thay đổi"
        );
      }
    } catch (e) {
      const msg = getErrorMessage(e, "Lưu bài viết thất bại");
      if (/slug/i.test(msg)) setErrors((er) => ({ ...er, slug: msg }));
      toast.error(msg);
    } finally {
      setSaving(null);
    }
  };

  // Ctrl/Cmd + S để lưu
  const saveRef = React.useRef(save);
  saveRef.current = save;
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current(isNew ? (form.is_published ? "publish" : "draft") : "update");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isNew, form.is_published]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await adminApi.deleteArticle(id);
      toast.success("Đã xoá bài viết");
      setOriginal(form);
      router.replace("/bai-viet");
    } catch (e) {
      toast.error(getErrorMessage(e));
      setDeleting(false);
    }
  };

  const seoChecks = React.useMemo<SeoCheck[]>(() => buildChecks(form), [form]);

  if (loading) return <LoadingBlock label="Đang tải bài viết…" />;

  const scheduled =
    form.is_published && form.published_at && new Date(form.published_at).getTime() > Date.now();
  const publicPath = `/tin-tuc/${form.slug || slugify(form.title) || "duong-dan-bai-viet"}`;

  return (
    <>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <Link href="/bai-viet" className="mb-1 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
            <ArrowLeft className="size-4" /> Danh sách bài viết
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="truncate text-2xl font-bold tracking-tight text-slate-900">
              {isNew ? "Viết bài mới" : "Chỉnh sửa bài viết"}
            </h1>
            {!isNew && (
              <Pill tone={article?.is_published ? "green" : "slate"} dot>
                {article?.is_published ? "Đã xuất bản" : "Bản nháp"}
              </Pill>
            )}
            {dirty && <Pill tone="amber">Chưa lưu</Pill>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isNew && article?.is_published && (
            <a
              href={`/tin-tuc/${article.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ExternalLink className="size-4" /> Xem bài
            </a>
          )}
          {isNew ? (
            <>
              <Btn variant="outline" onClick={() => save("draft")} loading={saving === "draft"} disabled={!!saving}>
                {saving !== "draft" && <Save />} Lưu nháp
              </Btn>
              <Btn onClick={() => save("publish")} loading={saving === "publish"} disabled={!!saving}>
                {saving !== "publish" && <Send />} {scheduled ? "Lên lịch đăng" : "Đăng bài"}
              </Btn>
            </>
          ) : (
            <>
              {article?.is_published ? (
                <Btn variant="outline" onClick={() => save("draft")} loading={saving === "draft"} disabled={!!saving}>
                  Chuyển về nháp
                </Btn>
              ) : (
                <Btn variant="success" onClick={() => save("publish")} loading={saving === "publish"} disabled={!!saving}>
                  {saving !== "publish" && <Send />} Xuất bản
                </Btn>
              )}
              <Btn onClick={() => save("update")} loading={saving === "publish"} disabled={!!saving || !dirty}>
                {saving !== "publish" && <Save />} Lưu thay đổi
              </Btn>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        {/* Main */}
        <div className="min-w-0 space-y-6">
          <Panel bodyClassName="space-y-5">
            <Field label="Tiêu đề bài viết" htmlFor="title" required error={errors.title} counter={{ value: form.title.length, max: 65, min: 30 }}>
              <TextInput
                id="title"
                value={form.title}
                onChange={(e) => onTitle(e.target.value)}
                placeholder="Ví dụ: Chi phí xây nhà phố 3 tầng năm 2026 trọn gói"
                className="h-12 text-lg font-semibold"
                aria-invalid={!!errors.title}
                autoFocus={isNew}
              />
            </Field>

            <Field label="Đường dẫn (slug)" htmlFor="slug" error={errors.slug} hint="Ngắn gọn, không dấu, chứa từ khoá chính. Đổi slug của bài đã đăng sẽ làm hỏng liên kết cũ.">
              <div className="flex overflow-hidden rounded-lg border border-slate-200 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10">
                <span className="hidden items-center gap-1 border-r border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 sm:flex">
                  <Link2 className="size-3.5" /> /tin-tuc/
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
                  placeholder="tu-dong-tao-tu-tieu-de"
                />
                <button
                  type="button"
                  title="Tạo lại từ tiêu đề"
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

            <Field label="Nội dung" required error={errors.content}>
              <RichTextEditor
                value={form.content}
                onChange={(html) => set("content", html)}
                imageAlt={form.title}
                placeholder="Viết nội dung bài viết… Dùng Tiêu đề 2/3 để chia mục rõ ràng (tốt cho SEO). Có thể dán hoặc kéo thả ảnh trực tiếp."
              />
            </Field>
          </Panel>

          <Panel title="Tối ưu SEO" description="Thông tin hiển thị trên Google và khi chia sẻ lên mạng xã hội" bodyClassName="space-y-5">
            <Field
              label="Mô tả ngắn (meta description)"
              htmlFor="desc"
              counter={{ value: form.description.length, max: 160, min: 120 }}
              hint="Tóm tắt hấp dẫn 120–160 ký tự, chứa từ khoá chính. Hiển thị dưới tiêu đề trên Google và ở danh sách tin tức."
            >
              <TextArea
                id="desc"
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Ví dụ: Bảng chi phí xây nhà phố 3 tầng mới nhất 2026: đơn giá phần thô, trọn gói, cách tính diện tích và mẹo tiết kiệm…"
              />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Từ khoá" htmlFor="kw" hint="Từ đầu tiên là từ khoá chính. Nhấn Enter hoặc dấu phẩy để thêm.">
                <TagInput id="kw" value={form.keywords} onChange={(v) => set("keywords", v)} placeholder="chi phí xây nhà, nhà phố 3 tầng…" />
              </Field>
              <Field label="Canonical URL (tuỳ chọn)" htmlFor="canonical" error={errors.canonical_url} hint="Chỉ điền khi bài được đăng lại từ nguồn khác.">
                <TextInput
                  id="canonical"
                  value={form.canonical_url}
                  onChange={(e) => set("canonical_url", e.target.value)}
                  placeholder={`${SITE_URL}${publicPath}`}
                />
              </Field>
            </div>
            <SerpPreview title={form.title} description={form.description || stripHtml(form.content).slice(0, 160)} path={publicPath} />
          </Panel>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 xl:sticky xl:top-24 xl:self-start">
          <Panel title="Xuất bản" bodyClassName="space-y-4">
            <Switch
              id="published"
              checked={form.is_published}
              onChange={(v) => set("is_published", v)}
              label="Hiển thị công khai"
              description={form.is_published ? "Bài viết sẽ xuất hiện trên website" : "Chỉ lưu bản nháp, khách không xem được"}
            />
            {form.is_published && (
              <Field label="Ngày đăng" htmlFor="pubat" hint={scheduled ? "Bài sẽ hiển thị với ngày đăng trong tương lai." : "Để trống = thời điểm bấm Đăng."}>
                <div className="relative">
                  <CalendarClock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <TextInput
                    id="pubat"
                    type="datetime-local"
                    className="pl-9"
                    value={form.published_at}
                    onChange={(e) => set("published_at", e.target.value)}
                  />
                </div>
              </Field>
            )}
            <dl className="space-y-2 rounded-lg bg-slate-50 p-3 text-xs">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Tác giả</dt>
                <dd className="font-medium text-slate-700">{article?.author_name || user?.name || "—"}</dd>
              </div>
              {!isNew && (
                <>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Tạo lúc</dt>
                    <dd className="text-slate-700">{fmtDateTime(article?.created_at)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt className="text-slate-500">Cập nhật</dt>
                    <dd className="text-slate-700">{fmtDateTime(article?.updated_at)}</dd>
                  </div>
                </>
              )}
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Độ dài</dt>
                <dd className="text-slate-700">{wordCount(form.content).toLocaleString("vi-VN")} từ</dd>
              </div>
            </dl>
            <p className="text-[11px] text-slate-400">Mẹo: nhấn Ctrl + S để lưu nhanh.</p>
          </Panel>

          <Panel title="Danh mục">
            <SelectInput value={form.category} onChange={(e) => set("category", e.target.value)} aria-label="Danh mục bài viết">
              {ARTICLE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </SelectInput>
          </Panel>

          <Panel title="Ảnh đại diện" description="Hiển thị ở danh sách tin và khi chia sẻ (tỉ lệ 1200×630)">
            <ImageUploader value={form.thumbnail_url} onChange={(url) => set("thumbnail_url", url)} aspect="aspect-[1200/630]" />
          </Panel>

          <Panel title="Kiểm tra SEO">
            <SeoChecklist checks={seoChecks} />
          </Panel>

          {!isNew && (
            <Panel bodyClassName="p-4">
              <Btn variant="ghost" className="w-full text-rose-600 hover:bg-rose-50 hover:text-rose-700" onClick={() => setConfirmDelete(true)}>
                <Trash2 /> Xoá bài viết này
              </Btn>
            </Panel>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Xoá bài viết?"
        description="Bài viết sẽ bị xoá vĩnh viễn và không thể khôi phục."
        confirmLabel="Xoá bài viết"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

function ownDomainCanonical(url: string) {
  try {
    return /hungphuc/i.test(new URL(url).host);
  } catch {
    return false;
  }
}

function buildChecks(f: FormState): SeoCheck[] {
  const text = stripHtml(f.content).toLowerCase();
  const words = wordCount(f.content);
  const kw = f.keywords[0]?.toLowerCase();
  const imgs = f.content.match(/<img[^>]*>/gi) || [];
  const imgsNoAlt = imgs.filter((t) => !/alt="[^"]+"/i.test(t)).length;
  const hasH2 = /<h2[\s>]/i.test(f.content);
  const hasLink = /<a\s[^>]*href=/i.test(f.content);
  const tLen = f.title.trim().length;
  const dLen = f.description.trim().length;

  return [
    { ok: tLen >= 30 && tLen <= 65 ? true : tLen === 0 ? false : null, label: `Tiêu đề dài 30–65 ký tự (hiện ${tLen})` },
    { ok: dLen >= 120 && dLen <= 160 ? true : dLen === 0 ? false : null, label: `Mô tả dài 120–160 ký tự (hiện ${dLen})` },
    { ok: !!kw, label: "Đã đặt từ khoá chính" },
    { ok: kw ? f.title.toLowerCase().includes(kw) : false, label: "Từ khoá chính có trong tiêu đề" },
    { ok: kw ? f.description.toLowerCase().includes(kw) : false, label: "Từ khoá chính có trong mô tả" },
    { ok: kw ? text.slice(0, 600).includes(kw) : false, label: "Từ khoá xuất hiện ở đoạn mở đầu" },
    { ok: words >= 600 ? true : words >= 300 ? null : false, label: `Nội dung ≥ 600 từ (hiện ${words})` },
    { ok: hasH2, label: "Có tiêu đề phụ H2 chia mục" },
    { ok: !!f.thumbnail_url, label: "Có ảnh đại diện" },
    { ok: imgs.length === 0 ? null : imgsNoAlt === 0, label: imgs.length ? `Ảnh trong bài có ALT (${imgs.length - imgsNoAlt}/${imgs.length})` : "Nên chèn ảnh minh hoạ trong bài" },
    { ok: hasLink ? true : null, label: "Có liên kết (nội bộ/tham khảo) trong bài" },
    ...(f.canonical_url && ownDomainCanonical(f.canonical_url)
      ? [{ ok: false as const, label: "Canonical đang trỏ về domain Hưng Phúc khác – xoá trống để Google index đúng" }]
      : []),
    ...(f.keywords.length > 10 ? [{ ok: null, label: `Quá nhiều từ khoá (${f.keywords.length}) – nên giữ 3–10 từ khoá` }] : []),
    { ok: (f.slug || slugify(f.title)).length > 0 && (f.slug || slugify(f.title)).length <= 75, label: "Slug ngắn gọn (≤ 75 ký tự)" },
  ];
}
