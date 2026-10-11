"use client";

import * as React from "react";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  Info,
  Loader2,
  Phone,
  RotateCcw,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";
import type { RootState } from "@/store";
import { cn } from "@/lib/utils";
import { getAttribution } from "@/lib/attribution";
import { estimateApi, formatMoney } from "@/services/estimateService";
import type { EstimateParams, EstimatePublicConfig, EstimateResponse } from "@/types/estimate";

type FieldKey = keyof EstimateParams;

const errMsg = (e: unknown, fallback: string) =>
  (e as { response?: { data?: { message?: string } } })?.response?.data?.message || fallback;

const LOADING_STEPS = [
  "Đang tính diện tích quy đổi từng hạng mục…",
  "Đang áp dụng đơn giá của Hưng Phúc…",
  "Trợ lý AI đang viết nhận xét cho công trình của bạn…",
];

export function EstimateWidget({ config, compact = false }: { config: EstimatePublicConfig; compact?: boolean }) {
  const phone: string | undefined = useSelector((s: RootState) => s.settings.settings?.phone);

  const firstType = config.packages[0]?.availableTypes[0] || config.buildingTypes[0]?.id;
  const [form, setForm] = React.useState<EstimateParams>({
    buildingType: firstType,
    packageId: config.packages.find((p) => p.availableTypes.includes(firstType))?.id || config.packages[0]?.id,
    finishLevel: "kha",
    width: null,
    length: null,
    floors: 3,
    hasTum: true,
    hasBasement: false,
    roofType: "btct",
    foundation: "bang",
    yardArea: null,
    location: "",
    notes: "",
  });
  const [advanced, setAdvanced] = React.useState(false);
  const [description, setDescription] = React.useState("");
  const [parsing, setParsing] = React.useState(false);
  const [parseInfo, setParseInfo] = React.useState<{ assumptions: string[]; missing: string[] } | null>(null);
  const [highlight, setHighlight] = React.useState<Set<FieldKey>>(new Set());
  const [sourceText, setSourceText] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState(0);
  const [data, setData] = React.useState<EstimateResponse | null>(null);
  const resultRef = React.useRef<HTMLDivElement>(null);

  // Các lựa chọn hợp lệ theo bảng giá đang có
  const packagesForType = React.useMemo(
    () => config.packages.filter((p) => p.availableTypes.includes(form.buildingType)),
    [config.packages, form.buildingType]
  );
  const currentPkg = config.packages.find((p) => p.id === form.packageId);
  const finishesForType = React.useMemo(
    () => (currentPkg?.byFinish ? currentPkg.availableFinishes?.[form.buildingType] || [] : []),
    [currentPkg, form.buildingType]
  );
  const typesWithPrice = config.buildingTypes.filter((t) => config.packages.some((p) => p.availableTypes.includes(t.id)));

  // Giữ lựa chọn gói / mức hoàn thiện luôn hợp lệ khi đổi loại công trình
  React.useEffect(() => {
    if (!packagesForType.some((p) => p.id === form.packageId) && packagesForType[0]) {
      setForm((f) => ({ ...f, packageId: packagesForType[0].id }));
    }
    if (currentPkg?.byFinish && finishesForType.length && !finishesForType.includes(form.finishLevel)) {
      setForm((f) => ({ ...f, finishLevel: finishesForType.includes("kha") ? "kha" : finishesForType[0] }));
    }
  }, [form.buildingType, form.packageId, form.finishLevel, packagesForType, currentPkg, finishesForType]);

  React.useEffect(() => {
    if (!loading) return;
    setLoadingStep(0);
    const t = setInterval(() => setLoadingStep((s) => Math.min(s + 1, LOADING_STEPS.length - 1)), 2200);
    return () => clearInterval(t);
  }, [loading]);

  const set = <K extends FieldKey>(k: K, v: EstimateParams[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setError(null);
  };

  const hl = (k: FieldKey) => highlight.has(k) && "ring-2 ring-amber-400 ring-offset-1 transition";

  /* ------------------------------ AI điền giúp ------------------------------ */
  const handleParse = async () => {
    if (description.trim().length < 8) {
      setError("Bạn mô tả chi tiết hơn một chút nhé, ví dụ: nhà phố 5x20, 1 trệt 2 lầu, mái bằng.");
      return;
    }
    setParsing(true);
    setError(null);
    try {
      const res = await estimateApi.parse(description);
      const changed = new Set<FieldKey>();
      setForm((f) => {
        const next = { ...f };
        const p = res.params as Partial<EstimateParams>;
        const assign = <K extends FieldKey>(k: K, v: EstimateParams[K] | null | undefined) => {
          if (v === null || v === undefined || v === "") return;
          if (next[k] !== v) changed.add(k);
          next[k] = v;
        };
        if (p.buildingType && typesWithPrice.some((t) => t.id === p.buildingType)) assign("buildingType", p.buildingType);
        if (p.packageId && config.packages.some((x) => x.id === p.packageId && x.availableTypes.includes(next.buildingType)))
          assign("packageId", p.packageId);
        assign("finishLevel", p.finishLevel as string | null);
        assign("width", p.width as number | null);
        assign("length", p.length as number | null);
        if (!p.width && p.footprintArea) assign("footprintArea", p.footprintArea as number);
        assign("floors", p.floors as number | null);
        assign("hasTum", p.hasTum as boolean);
        assign("hasBasement", p.hasBasement as boolean);
        assign("roofType", p.roofType as string | null);
        assign("foundation", p.foundation as string | null);
        assign("yardArea", p.yardArea as number | null);
        assign("location", p.location as string);
        assign("notes", p.notes as string);
        return next;
      });
      setHighlight(changed);
      setTimeout(() => setHighlight(new Set()), 4000);
      setParseInfo({ assumptions: res.assumptions, missing: res.missing });
      setSourceText(description.trim());
      if (res.params.yardArea || res.params.hasBasement || res.params.foundation) setAdvanced(true);
    } catch (e) {
      setError(`${errMsg(e, "Trợ lý AI chưa phản hồi được")} – bạn vẫn có thể chọn thông số trực tiếp bên dưới.`);
    } finally {
      setParsing(false);
    }
  };

  /* -------------------------------- Tính toán ------------------------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hasSize = (form.width && form.length) || form.footprintArea;
    if (!hasSize) {
      setError("Vui lòng nhập chiều ngang và chiều dài mặt bằng.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await estimateApi.calculate(form, sourceText, getAttribution());
      setData(res);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (e) {
      setError(errMsg(e, "Không tính được dự toán, vui lòng thử lại hoặc gọi hotline."));
    } finally {
      setLoading(false);
    }
  };

  if (data) {
    return (
      <div ref={resultRef} className="scroll-mt-32">
        <EstimateResultView data={data} phone={phone} onBack={() => setData(null)} compact={compact} />
      </div>
    );
  }

  const area = form.width && form.length ? Math.round(form.width * form.length * 10) / 10 : form.footprintArea || null;

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {config.aiEnabled && (
        <div className="rounded-lg border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4">
          <label htmlFor="est-desc" className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <Sparkles className="h-4 w-4 text-indigo-600" aria-hidden />
            Mô tả ngôi nhà bằng lời – AI điền giúp
          </label>
          <textarea
            id="est-desc"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1500}
            placeholder="VD: Nhà phố 5x20m ở Gò Vấp, 1 trệt 2 lầu 1 tum, mái bằng, muốn xây trọn gói hoàn thiện khá"
            className="w-full resize-none rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-indigo-900/60">AI chỉ điền thông số – giá do hệ thống tính theo đơn giá công ty.</p>
            <button
              type="button"
              onClick={handleParse}
              disabled={parsing}
              className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {parsing ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Wand2 className="h-4 w-4" aria-hidden />}
              {parsing ? "AI đang đọc…" : "AI điền giúp"}
            </button>
          </div>
          {parseInfo && (parseInfo.assumptions.length > 0 || parseInfo.missing.length > 0) && (
            <div className="mt-3 space-y-1.5 rounded-md bg-white/80 p-3 text-xs text-gray-700 ring-1 ring-indigo-100" aria-live="polite">
              <p className="font-semibold text-indigo-900">AI đã điền các ô được tô vàng. Bạn kiểm tra lại giúp nhé:</p>
              {parseInfo.assumptions.map((a) => (
                <p key={a} className="flex gap-1.5">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" aria-hidden /> {a}
                </p>
              ))}
              {parseInfo.missing.map((m) => (
                <p key={m} className="flex gap-1.5 text-amber-800">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {m}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loại công trình */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-gray-800">Loại công trình</legend>
        <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4 rounded-md", hl("buildingType"))}>
          {typesWithPrice.map((t) => (
            <ChoiceButton key={t.id} active={form.buildingType === t.id} onClick={() => set("buildingType", t.id)}>
              {t.label}
            </ChoiceButton>
          ))}
        </div>
      </fieldset>

      {/* Gói dịch vụ */}
      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-gray-800">Bạn cần</legend>
        <div className={cn("grid gap-2 rounded-md", packagesForType.length > 2 ? "sm:grid-cols-3" : "sm:grid-cols-2", hl("packageId"))}>
          {packagesForType.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => set("packageId", p.id)}
              aria-pressed={form.packageId === p.id}
              className={cn(
                "rounded-md border p-3 text-left transition",
                form.packageId === p.id ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <span className="block text-sm font-semibold text-gray-900">{p.label}</span>
              <span className="mt-0.5 block text-xs leading-snug text-gray-500">{p.description}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {currentPkg?.byFinish && finishesForType.length > 0 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-gray-800">Mức hoàn thiện</legend>
          <div className={cn("grid grid-cols-3 gap-2 rounded-md", hl("finishLevel"))}>
            {config.finishLevels
              .filter((f) => finishesForType.includes(f.id))
              .map((f) => (
                <ChoiceButton key={f.id} active={form.finishLevel === f.id} onClick={() => set("finishLevel", f.id)}>
                  {f.label}
                </ChoiceButton>
              ))}
          </div>
        </fieldset>
      )}

      {/* Kích thước & số tầng */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <NumberField id="est-w" label="Ngang (m)" value={form.width} onChange={(v) => set("width", v)} placeholder="5" className={hl("width")} />
        <NumberField id="est-l" label="Dài (m)" value={form.length} onChange={(v) => set("length", v)} placeholder="20" className={hl("length")} />
        <div className="col-span-2">
          <span className="mb-1 block text-xs font-medium text-gray-600" id="est-floors-label">
            Số tầng (tính cả trệt)
          </span>
          <div className={cn("flex h-10 items-center rounded-md border border-gray-200 bg-white", hl("floors"))} role="group" aria-labelledby="est-floors-label">
            <button type="button" className="h-full w-10 text-lg text-gray-600 hover:bg-gray-50" onClick={() => set("floors", Math.max(1, form.floors - 1))} aria-label="Giảm số tầng">
              −
            </button>
            <span className="flex-1 text-center text-sm font-semibold tabular-nums" aria-live="polite">
              {form.floors === 1 ? "1 tầng (trệt)" : `${form.floors} tầng (trệt + ${form.floors - 1} lầu)`}
            </span>
            <button type="button" className="h-full w-10 text-lg text-gray-600 hover:bg-gray-50" onClick={() => set("floors", Math.min(15, form.floors + 1))} aria-label="Tăng số tầng">
              +
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <ToggleChip active={form.hasTum} onClick={() => set("hasTum", !form.hasTum)} className={hl("hasTum")}>
          Có tum
        </ToggleChip>
        <ToggleChip active={form.hasBasement} onClick={() => set("hasBasement", !form.hasBasement)} className={hl("hasBasement")}>
          Có tầng hầm
        </ToggleChip>
        <button
          type="button"
          onClick={() => setAdvanced((v) => !v)}
          aria-expanded={advanced}
          className="ml-auto inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Tuỳ chọn mái, móng, sân <ChevronDown className={cn("h-4 w-4 transition", advanced && "rotate-180")} aria-hidden />
        </button>
      </div>

      {advanced && (
        <div className="grid gap-3 rounded-md bg-gray-50 p-3 sm:grid-cols-2">
          <SelectField id="est-roof" label="Loại mái" value={form.roofType} onChange={(v) => set("roofType", v)} options={config.roofTypes} className={hl("roofType")} />
          <SelectField id="est-found" label="Loại móng" value={form.foundation} onChange={(v) => set("foundation", v)} options={config.foundationTypes} className={hl("foundation")} />
          <NumberField id="est-yard" label="Diện tích sân (m²)" value={form.yardArea} onChange={(v) => set("yardArea", v)} placeholder="0" className={hl("yardArea")} />
          <div>
            <label htmlFor="est-loc" className="mb-1 block text-xs font-medium text-gray-600">
              Khu vực xây dựng
            </label>
            <input
              id="est-loc"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Gò Vấp, TP.HCM"
              className={cn("h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20", hl("location"))}
            />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-md bg-primary text-base font-semibold text-white shadow-lg shadow-primary/25 transition hover:bg-primary/90 disabled:opacity-70"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : <Calculator className="h-5 w-5" aria-hidden />}
        {loading ? LOADING_STEPS[loadingStep] : area ? `Tính dự toán cho ${area} m² mặt bằng` : "Tính dự toán miễn phí"}
      </button>
      <p className="text-center text-xs text-gray-500">Miễn phí · Không cần để lại số điện thoại để xem kết quả</p>
    </form>
  );
}

/* --------------------------------- Kết quả --------------------------------- */

function EstimateResultView({
  data,
  phone,
  onBack,
  compact,
}: {
  data: EstimateResponse;
  phone?: string;
  onBack: () => void;
  compact: boolean;
}) {
  const r = data.result;
  const [lead, setLead] = React.useState({ name: "", phone: "", note: "" });
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [leadError, setLeadError] = React.useState<string | null>(null);

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead.name.trim()) return setLeadError("Vui lòng nhập họ tên");
    if (!/^[0-9+\s().-]{8,20}$/.test(lead.phone.trim())) return setLeadError("Số điện thoại chưa đúng");
    setSending(true);
    setLeadError(null);
    try {
      await estimateApi.lead(data.id, { name: lead.name.trim(), phone: lead.phone.trim(), note: lead.note.trim() || undefined });
      setSent(true);
    } catch (err) {
      setLeadError(errMsg(err, "Gửi chưa thành công, bạn vui lòng gọi hotline giúp nhé"));
    } finally {
      setSending(false);
    }
  };

  const tel = phone?.replace(/[^\d+]/g, "");

  return (
    <div className="space-y-5" aria-live="polite">
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden /> Sửa thông số
        </button>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">Dự toán sơ bộ</span>
      </div>

      <div className="rounded-lg bg-gradient-to-br from-[#1808AA] to-[#2b1fd1] p-5 text-white shadow-lg">
        <p className="text-sm text-white/80">
          {r.buildingTypeLabel} · {r.packageLabel}
          {r.finishLevelLabel ? ` · hoàn thiện ${r.finishLevelLabel.toLowerCase()}` : ""}
        </p>
        <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {formatMoney(r.low)} – {formatMoney(r.high)}
          <span className="ml-1 text-lg font-semibold text-white/80">đồng</span>
        </p>
        <p className="mt-1 text-sm text-white/80">
          Ước tính khoảng <b className="text-white">{formatMoney(r.total)} đồng</b> = {r.totalArea.toLocaleString("vi-VN")} m² ×{" "}
          {r.unitPrice.toLocaleString("vi-VN")} đ/m²
        </p>
      </div>

      <details className="group rounded-lg border border-gray-200 bg-white" open={!compact}>
        <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-gray-800">
          Cách tính diện tích ({r.basis === "floor_area" ? "diện tích sàn sử dụng" : "diện tích xây dựng quy đổi"})
          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden />
        </summary>
        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase text-gray-500">
                <th className="py-2 font-medium">Hạng mục</th>
                <th className="py-2 text-right font-medium">Diện tích</th>
                <th className="py-2 text-right font-medium">Hệ số</th>
                <th className="py-2 text-right font-medium">Quy đổi</th>
              </tr>
            </thead>
            <tbody>
              {r.lines.map((l) => (
                <tr key={l.label} className="border-b border-gray-100">
                  <td className="py-2 text-gray-700">{l.label}</td>
                  <td className="py-2 text-right tabular-nums">{l.area.toLocaleString("vi-VN")} m²</td>
                  <td className="py-2 text-right tabular-nums">{Math.round(l.coefficient * 100)}%</td>
                  <td className="py-2 text-right font-medium tabular-nums">{l.convertedArea.toLocaleString("vi-VN")} m²</td>
                </tr>
              ))}
              <tr>
                <td className="pt-2 font-semibold" colSpan={3}>
                  Tổng diện tích tính giá
                </td>
                <td className="pt-2 text-right font-bold tabular-nums">{r.totalArea.toLocaleString("vi-VN")} m²</td>
              </tr>
            </tbody>
          </table>
          {r.assumptions.length > 0 && (
            <ul className="mt-3 space-y-1 text-xs text-gray-500">
              {r.assumptions.map((a) => (
                <li key={a}>• {a}</li>
              ))}
            </ul>
          )}
        </div>
      </details>

      {data.advice && (
        <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-indigo-900">
            <Sparkles className="h-4 w-4 text-indigo-600" aria-hidden /> Nhận xét từ trợ lý AI
          </p>
          <p className="text-sm leading-relaxed text-gray-700">{data.advice.summary}</p>
          {data.advice.tips.length > 0 && (
            <ul className="mt-3 space-y-2">
              {data.advice.tips.map((t) => (
                <li key={t} className="flex gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                  {t}
                </li>
              ))}
            </ul>
          )}
          {data.advice.questions.length > 0 && (
            <div className="mt-3 rounded-md bg-white p-3 text-sm ring-1 ring-indigo-100">
              <p className="mb-1 font-medium text-gray-800">Để báo giá chính xác, kỹ sư sẽ hỏi thêm:</p>
              <ul className="list-disc space-y-0.5 pl-5 text-gray-600">
                {data.advice.questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <p className="flex gap-2 text-xs leading-relaxed text-gray-500">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden /> {r.disclaimer}
      </p>

      {/* Thu lead */}
      <div className="rounded-lg border-2 border-primary/20 bg-white p-4">
        {sent ? (
          <div className="flex items-start gap-3 text-sm">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" aria-hidden />
            <div>
              <p className="font-semibold text-gray-900">Đã gửi! Kỹ sư Hưng Phúc sẽ gọi cho bạn trong giờ làm việc.</p>
              <p className="mt-0.5 text-gray-600">Bạn sẽ nhận báo giá chi tiết theo đúng hiện trạng công trình, hoàn toàn miễn phí.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={submitLead} className="space-y-3" noValidate>
            <div>
              <p className="font-semibold text-gray-900">Nhận báo giá chi tiết miễn phí</p>
              <p className="text-sm text-gray-600">Kỹ sư sẽ xem dự toán này, gọi lại tư vấn và hẹn khảo sát thực tế.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                aria-label="Họ tên"
                placeholder="Họ tên *"
                value={lead.name}
                onChange={(e) => setLead({ ...lead, name: e.target.value })}
                autoComplete="name"
                className="h-11 rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <input
                aria-label="Số điện thoại"
                placeholder="Số điện thoại / Zalo *"
                value={lead.phone}
                onChange={(e) => setLead({ ...lead, phone: e.target.value })}
                inputMode="tel"
                autoComplete="tel"
                className="h-11 rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <input
              aria-label="Lời nhắn"
              placeholder="Lời nhắn (thời gian tiện gọi, yêu cầu thêm…)"
              value={lead.note}
              onChange={(e) => setLead({ ...lead, note: e.target.value })}
              className="h-11 w-full rounded-md border border-gray-200 px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            {leadError && (
              <p role="alert" className="text-sm text-red-600">
                {leadError}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="submit"
                disabled={sending}
                className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-70"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
                Gửi cho kỹ sư
              </button>
              {tel && (
                <a
                  href={`tel:${tel}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5"
                >
                  <Phone className="h-4 w-4" aria-hidden /> Gọi {phone}
                </a>
              )}
            </div>
          </form>
        )}
      </div>

      <button type="button" onClick={onBack} className="mx-auto flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary">
        <RotateCcw className="h-4 w-4" aria-hidden /> Tính cho phương án khác
      </button>
    </div>
  );
}

/* ------------------------------- Thành phần nhỏ ------------------------------ */

function ChoiceButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-10 rounded-md border px-2 text-sm font-medium transition",
        active ? "border-primary bg-primary text-white shadow-sm" : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
      )}
    >
      {children}
    </button>
  );
}

function ToggleChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string | false;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition",
        active ? "border-primary bg-primary/10 text-primary" : "border-gray-200 bg-white text-gray-600 hover:border-gray-300",
        className
      )}
    >
      {active && <Check className="h-3.5 w-3.5" aria-hidden />}
      {children}
    </button>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  placeholder,
  className,
}: {
  id: string;
  label: string;
  value: number | null | undefined;
  onChange: (v: number | null) => void;
  placeholder?: string;
  className?: string | false;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        step="0.1"
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        className={cn(
          "h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm tabular-nums outline-none focus:border-primary focus:ring-2 focus:ring-primary/20",
          className
        )}
      />
    </div>
  );
}

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; label: string }[];
  className?: string | false;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-gray-600">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn("h-10 w-full rounded-md border border-gray-200 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20", className)}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
