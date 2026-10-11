"use client";

import * as React from "react";
import { ImagePlus, Link2, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import { cn } from "@/lib/utils";
import { Btn, TextInput } from "./primitives";

const MAX_MB = 10;

export function validateImageFile(file: File) {
  if (!file.type.startsWith("image/")) return "Chỉ chấp nhận file ảnh";
  if (file.size > MAX_MB * 1024 * 1024) return `Ảnh vượt quá ${MAX_MB}MB`;
  return null;
}

/** Upload 1 file, trả URL; hiển thị lỗi bằng toast */
export async function uploadWithToast(file: File, onProgress?: (p: number) => void) {
  const err = validateImageFile(file);
  if (err) {
    toast.error(err);
    return null;
  }
  try {
    return await adminApi.uploadImage(file, onProgress);
  } catch (e) {
    toast.error(getErrorMessage(e, "Tải ảnh thất bại"));
    return null;
  }
}

export function ImageUploader({
  value,
  onChange,
  aspect = "aspect-video",
  label = "Tải ảnh lên",
  hint = "PNG, JPG, WEBP tối đa 10MB. Ảnh lớn sẽ được tự động tối ưu.",
  fit = "cover",
  allowUrl = true,
  className,
}: {
  value?: string | null;
  onChange: (url: string | null) => void;
  aspect?: string;
  label?: string;
  hint?: string;
  fit?: "cover" | "contain";
  allowUrl?: boolean;
  className?: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [progress, setProgress] = React.useState<number | null>(null);
  const [dragging, setDragging] = React.useState(false);
  const [urlMode, setUrlMode] = React.useState(false);
  const [urlDraft, setUrlDraft] = React.useState("");

  const handleFile = async (file?: File | null) => {
    if (!file) return;
    setProgress(0);
    const url = await uploadWithToast(file, setProgress);
    setProgress(null);
    if (url) {
      onChange(url);
      toast.success("Đã tải ảnh lên");
    }
  };

  const uploading = progress !== null;

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className={cn("group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-50", aspect)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Ảnh đã chọn"
            className={cn("size-full", fit === "cover" ? "object-cover" : "object-contain p-3")}
          />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/55 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
            <Btn size="sm" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>
              <RefreshCw /> Đổi ảnh
            </Btn>
            <Btn size="sm" variant="danger" onClick={() => onChange(null)} disabled={uploading}>
              <Trash2 /> Gỡ
            </Btn>
          </div>
          {uploading && <UploadOverlay progress={progress} />}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          disabled={uploading}
          className={cn(
            "relative flex w-full cursor-pointer flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed px-4 text-center transition",
            aspect,
            dragging
              ? "border-indigo-500 bg-indigo-50/60"
              : "border-slate-200 bg-slate-50/60 hover:border-indigo-400 hover:bg-indigo-50/30"
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200">
            <UploadCloud className="size-5" />
          </div>
          <span className="text-sm font-medium text-slate-700">{label}</span>
          <span className="text-xs text-slate-500">Kéo thả hoặc bấm để chọn</span>
          {uploading && <UploadOverlay progress={progress} />}
        </button>
      )}

      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-slate-500">{hint}</p>
        {allowUrl && (
          <button
            type="button"
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs font-medium text-indigo-600 hover:underline"
            onClick={() => {
              setUrlDraft(value || "");
              setUrlMode((v) => !v);
            }}
          >
            <Link2 className="size-3.5" /> Dùng URL
          </button>
        )}
      </div>

      {urlMode && (
        <div className="flex gap-2">
          <TextInput
            placeholder="https://..."
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            className="h-9"
          />
          <Btn
            size="md"
            variant="outline"
            onClick={() => {
              const v = urlDraft.trim();
              if (v && !/^https?:\/\//i.test(v)) return toast.error("URL phải bắt đầu bằng http(s)://");
              onChange(v || null);
              setUrlMode(false);
            }}
          >
            Áp dụng
          </Btn>
        </div>
      )}
    </div>
  );
}

function UploadOverlay({ progress }: { progress: number | null }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/85 backdrop-blur-sm">
      <span className="text-sm font-medium text-slate-700">Đang tải lên… {progress ?? 0}%</span>
      <div className="h-1.5 w-2/3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-indigo-600 transition-all" style={{ width: `${progress ?? 0}%` }} />
      </div>
    </div>
  );
}

/** Nút chọn nhiều ảnh, upload tuần tự, trả về danh sách URL */
export function MultiImagePicker({
  onUploaded,
  label = "Thêm ảnh",
}: {
  onUploaded: (urls: string[]) => void;
  label?: string;
}) {
  const ref = React.useRef<HTMLInputElement>(null);
  const [state, setState] = React.useState<{ done: number; total: number } | null>(null);

  const handle = async (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files);
    setState({ done: 0, total: list.length });
    const urls: string[] = [];
    for (const f of list) {
      const url = await uploadWithToast(f);
      if (url) urls.push(url);
      setState((s) => (s ? { ...s, done: s.done + 1 } : s));
    }
    setState(null);
    if (urls.length) {
      onUploaded(urls);
      toast.success(`Đã tải lên ${urls.length} ảnh`);
    }
  };

  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          handle(e.target.files);
          e.target.value = "";
        }}
      />
      <Btn variant="outline" size="sm" onClick={() => ref.current?.click()} loading={!!state}>
        {!state && <ImagePlus />}
        {state ? `Đang tải ${state.done}/${state.total}` : label}
      </Btn>
    </>
  );
}
