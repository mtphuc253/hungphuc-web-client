"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Images, Star, Trash2 } from "lucide-react";
import type { ProjectImage } from "@/types/admin";
import { cn } from "@/lib/utils";
import { Btn, EmptyState, TextInput } from "./primitives";
import { MultiImagePicker } from "./image-uploader";

export function GalleryManager({
  images,
  onChange,
  featured,
  onSetFeatured,
  altPrefix,
}: {
  images: ProjectImage[];
  onChange: (images: ProjectImage[]) => void;
  featured?: string | null;
  onSetFeatured?: (url: string) => void;
  altPrefix?: string;
}) {
  const move = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const update = (index: number, patch: Partial<ProjectImage>) =>
    onChange(images.map((img, i) => (i === index ? { ...img, ...patch } : img)));

  const missingAlt = images.filter((i) => !i.alt_text?.trim()).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          {images.length} ảnh
          {missingAlt > 0 && (
            <>
              {" · "}
              <span className="text-amber-600">{missingAlt} ảnh thiếu mô tả ALT (ảnh hưởng SEO)</span>
            </>
          )}
        </p>
        <div className="flex gap-2">
          {missingAlt > 0 && altPrefix && (
            <Btn
              variant="ghost"
              size="sm"
              onClick={() =>
                onChange(
                  images.map((img, i) =>
                    img.alt_text?.trim() ? img : { ...img, alt_text: `${altPrefix} - hình ${i + 1}` }
                  )
                )
              }
            >
              Tự điền ALT
            </Btn>
          )}
          <MultiImagePicker
            onUploaded={(urls) => onChange([...images, ...urls.map((u) => ({ image_url: u, alt_text: "", caption: "" }))])}
          />
        </div>
      </div>

      {images.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-slate-200">
          <EmptyState
            icon={Images}
            title="Chưa có ảnh trong thư viện"
            description="Thêm nhiều ảnh công trình để trang chi tiết dự án sinh động và chuẩn SEO hơn."
          />
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {images.map((img, i) => {
            const isFeatured = featured && featured === img.image_url;
            return (
              <li
                key={`${img.image_url}-${i}`}
                className={cn(
                  "overflow-hidden rounded-xl border bg-white",
                  isFeatured ? "border-indigo-400 ring-2 ring-indigo-500/20" : "border-slate-200"
                )}
              >
                <div className="relative aspect-[4/3] bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url} alt={img.alt_text || ""} className="size-full object-cover" />
                  <span className="absolute left-2 top-2 rounded-md bg-slate-950/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
                    #{i + 1}
                  </span>
                  {isFeatured && (
                    <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-indigo-600 px-1.5 py-0.5 text-[11px] font-medium text-white">
                      <Star className="size-3 fill-current" /> Ảnh đại diện
                    </span>
                  )}
                </div>
                <div className="space-y-2 p-3">
                  <TextInput
                    className="h-8 text-xs"
                    placeholder="Mô tả ALT (cho SEO)"
                    value={img.alt_text || ""}
                    maxLength={200}
                    onChange={(e) => update(i, { alt_text: e.target.value })}
                  />
                  <TextInput
                    className="h-8 text-xs"
                    placeholder="Chú thích hiển thị (tuỳ chọn)"
                    value={img.caption || ""}
                    onChange={(e) => update(i, { caption: e.target.value })}
                  />
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex gap-1">
                      <Btn variant="ghost" size="icon-sm" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Đưa lên">
                        <ArrowUp />
                      </Btn>
                      <Btn
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => move(i, i + 1)}
                        disabled={i === images.length - 1}
                        aria-label="Đưa xuống"
                      >
                        <ArrowDown />
                      </Btn>
                    </div>
                    <div className="flex gap-1">
                      {onSetFeatured && !isFeatured && (
                        <Btn variant="ghost" size="sm" onClick={() => onSetFeatured(img.image_url)}>
                          <Star /> Đặt đại diện
                        </Btn>
                      )}
                      <Btn
                        variant="ghost"
                        size="icon-sm"
                        className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                        onClick={() => onChange(images.filter((_, idx) => idx !== i))}
                        aria-label="Xoá ảnh"
                      >
                        <Trash2 />
                      </Btn>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
