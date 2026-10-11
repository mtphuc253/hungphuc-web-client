"use client";

import { CheckCircle2, Circle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://hungphuc.vercel.app").replace(/\/$/, "");

export interface SeoCheck {
  ok: boolean | null; // null = cảnh báo nhẹ
  label: string;
}

export function SerpPreview({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const shownTitle = title || "Tiêu đề trang";
  const shownDesc = description || "Mô tả trang sẽ hiển thị ở đây. Hãy viết 120–160 ký tự hấp dẫn, có từ khoá chính.";
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">Xem trước trên Google</p>
      <div className="flex items-center gap-2">
        <div className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-indigo-700">
          HP
        </div>
        <div className="min-w-0 leading-tight">
          <p className="truncate text-sm text-slate-800">Hưng Phúc</p>
          <p className="truncate text-xs text-slate-500">
            {host}
            {path ? ` › ${path.replace(/^\//, "").split("/").join(" › ")}` : ""}
          </p>
        </div>
      </div>
      <p className="mt-2 line-clamp-1 text-lg leading-snug text-[#1a0dab]">{shownTitle.slice(0, 70)}</p>
      <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-slate-600">{shownDesc.slice(0, 170)}</p>
    </div>
  );
}

export function SeoChecklist({ checks }: { checks: SeoCheck[] }) {
  const passed = checks.filter((c) => c.ok === true).length;
  const score = Math.round((passed / Math.max(1, checks.length)) * 100);
  const tone = score >= 80 ? "text-emerald-600 bg-emerald-50" : score >= 50 ? "text-amber-600 bg-amber-50" : "text-rose-600 bg-rose-50";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-700">Điểm SEO</p>
        <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-semibold tabular-nums", tone)}>{score}/100</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            score >= 80 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500"
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <ul className="space-y-1.5">
        {checks.map((c) => (
          <li key={c.label} className="flex items-start gap-2 text-[13px] text-slate-600">
            {c.ok === true ? (
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" />
            ) : c.ok === false ? (
              <XCircle className="mt-0.5 size-4 shrink-0 text-rose-500" />
            ) : (
              <Circle className="mt-0.5 size-4 shrink-0 text-amber-500" />
            )}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export { SITE_URL };
