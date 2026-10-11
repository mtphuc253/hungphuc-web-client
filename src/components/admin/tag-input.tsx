"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function TagInput({
  value,
  onChange,
  placeholder = "Nhập rồi nhấn Enter",
  max = 15,
  id,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  max?: number;
  id?: string;
}) {
  const [draft, setDraft] = React.useState("");

  const add = (raw: string) => {
    const parts = raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const p of parts) {
      if (next.length >= max) break;
      if (!next.some((t) => t.toLowerCase() === p.toLowerCase())) next.push(p);
    }
    onChange(next);
    setDraft("");
  };

  return (
    <div
      className={cn(
        "flex min-h-10 flex-wrap items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 transition focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10"
      )}
    >
      {value.map((tag, i) => (
        <span
          key={tag}
          className={cn(
            "inline-flex items-center gap-1 rounded-md py-0.5 pl-2 pr-1 text-xs font-medium",
            i === 0 ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-700"
          )}
          title={i === 0 ? "Từ khoá chính" : undefined}
        >
          {tag}
          <button
            type="button"
            aria-label={`Xoá ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className={cn("rounded p-0.5", i === 0 ? "hover:bg-white/20" : "hover:bg-slate-200")}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => {
          if (e.target.value.includes(",")) add(e.target.value);
          else setDraft(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length) {
            onChange(value.slice(0, -1));
          }
        }}
        onBlur={() => add(draft)}
        placeholder={value.length ? "" : placeholder}
        className="min-w-[120px] flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-slate-400"
      />
    </div>
  );
}
