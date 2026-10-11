"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, Calculator, ExternalLink, Save, Sparkles, Trash2, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { estimateApi, formatMoney, type AiInfo } from "@/services/estimateService";
import { getErrorMessage } from "@/services/adminApi";
import type { EstimateAdminConfig, EstimateRecord, EstimateStats } from "@/types/estimate";
import type { PageMeta } from "@/types/admin";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import {
  Btn,
  ConfirmDialog,
  EmptyState,
  Field,
  LoadingBlock,
  PageHeader,
  Pager,
  Panel,
  Pill,
  SegmentTabs,
  SelectInput,
  Switch,
  TextArea,
  TextInput,
} from "@/components/admin/primitives";
import { CONTACT_STATUS, fmtDateTime } from "@/components/admin/format";
import type { ContactStatus } from "@/types/admin";

const TYPES = [
  { id: "nha_pho", label: "Nhà phố" },
  { id: "biet_thu", label: "Biệt thự" },
  { id: "nha_cap_4", label: "Nhà cấp 4" },
  { id: "nha_xuong", label: "Nhà xưởng" },
];
const FINISHES = [
  { id: "tieu_chuan", label: "Tiêu chuẩn" },
  { id: "kha", label: "Khá" },
  { id: "cao_cap", label: "Cao cấp" },
];

type Tab = "history" | "config";

export default function EstimateAdminPage() {
  const [tab, setTab] = React.useState<Tab>("history");
  return (
    <>
      <PageHeader
        title="Dự toán AI"
        description="Công cụ dự toán chi phí xây nhà trên website: khách tự tính, AI giải thích, kỹ sư nhận lead để tư vấn."
        actions={
          <>
            <a
              href="/bang-gia"
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <ExternalLink className="size-4" /> Xem trên website
            </a>
            <SegmentTabs
              value={tab}
              onChange={setTab}
              items={[
                { value: "history", label: "Lịch sử dự toán" },
                { value: "config", label: "Đơn giá & cấu hình" },
              ]}
            />
          </>
        }
      />
      {tab === "history" ? <History onConfigure={() => setTab("config")} /> : <ConfigEditor />}
    </>
  );
}

/* --------------------------------- History -------------------------------- */

function History({ onConfigure }: { onConfigure: () => void }) {
  const [items, setItems] = React.useState<EstimateRecord[]>([]);
  const [meta, setMeta] = React.useState<PageMeta | null>(null);
  const [stats, setStats] = React.useState<EstimateStats | null>(null);
  const [page, setPage] = React.useState(1);
  const [withLead, setWithLead] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState<string | null>(null);
  const [toDelete, setToDelete] = React.useState<EstimateRecord | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const role = useAppSelector((s) => s.auth.user?.role);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await estimateApi.list({ page, limit: 20, withLead: withLead || undefined });
      setItems(res.data);
      setMeta(res.meta);
      setStats(res.stats);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không tải được lịch sử dự toán"));
    } finally {
      setLoading(false);
    }
  }, [page, withLead]);

  React.useEffect(() => {
    load();
  }, [load]);

  const conversion = stats && stats.total ? Math.round((stats.leads / stats.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Lượt dự toán (30 ngày)" value={stats?.last_30_days ?? "—"} sub={`Tổng: ${stats?.total ?? 0}`} />
        <Kpi label="Lead từ dự toán (30 ngày)" value={stats?.leads_30_days ?? "—"} sub={`Tổng: ${stats?.leads ?? 0}`} />
        <Kpi label="Tỉ lệ để lại thông tin" value={`${conversion}%`} sub="Lead / lượt dự toán" />
        <Kpi label="Giá trị dự toán trung bình" value={stats ? formatMoney(Number(stats.avg_total)) : "—"} sub={`${stats?.used_ai_parse ?? 0} lượt dùng "AI điền giúp"`} />
      </div>

      <Panel
        title="Lịch sử dự toán"
        description="Mọi lượt khách tính trên website, kể cả khi chưa để lại thông tin"
        actions={
          <SelectInput className="h-9 w-48" value={withLead} onChange={(e) => { setPage(1); setWithLead(e.target.value); }} aria-label="Lọc lead">
            <option value="">Tất cả</option>
            <option value="yes">Đã để lại thông tin</option>
            <option value="no">Chưa để lại thông tin</option>
          </SelectInput>
        }
        bodyClassName="p-0"
      >
        {loading && items.length === 0 ? (
          <LoadingBlock />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Calculator}
            title="Chưa có lượt dự toán nào"
            description="Nhập đơn giá và bật công cụ để khách bắt đầu sử dụng trên website."
            action={<Btn onClick={onConfigure}>Cấu hình đơn giá</Btn>}
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {items.map((e) => {
              const isOpen = open === e.id;
              const p = e.params;
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : e.id)}
                    aria-expanded={isOpen}
                    className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3.5 text-left hover:bg-slate-50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900">
                        {e.result.buildingTypeLabel} · {e.result.packageLabel}
                        {e.result.finishLevelLabel ? ` (${e.result.finishLevelLabel})` : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        {p.width && p.length ? `${p.width}×${p.length} m` : `${p.footprintArea} m²/sàn`} · {p.floors} tầng
                        {p.hasTum ? " + tum" : ""}
                        {p.hasBasement ? " + hầm" : ""}
                        {p.location ? ` · ${p.location}` : ""}
                        {e.attribution?.utm_source ? ` · nguồn: ${e.attribution.utm_source}` : ""}
                      </p>
                    </div>
                    {e.source_text && (
                      <Pill tone="violet">
                        <Sparkles className="size-3" /> AI điền
                      </Pill>
                    )}
                    {e.contact_id ? (
                      <Pill tone="green" dot>
                        Lead: {e.contact_name}
                      </Pill>
                    ) : (
                      <Pill tone="slate">Chưa để lại SĐT</Pill>
                    )}
                    <span className="w-28 text-right text-sm font-semibold tabular-nums text-slate-900">{formatMoney(e.total)}</span>
                    <span className="w-32 text-right text-xs text-slate-400">{fmtDateTime(e.created_at)}</span>
                  </button>
                  {isOpen && (
                    <div className="grid gap-4 bg-slate-50/70 px-5 py-4 text-sm lg:grid-cols-2">
                      <div className="space-y-2">
                        {e.source_text && (
                          <p className="rounded-lg bg-white p-3 italic text-slate-600 ring-1 ring-slate-200">“{e.source_text}”</p>
                        )}
                        <table className="w-full text-xs">
                          <tbody>
                            {e.result.lines.map((l) => (
                              <tr key={l.label} className="border-b border-slate-200/70">
                                <td className="py-1.5 text-slate-600">{l.label}</td>
                                <td className="py-1.5 text-right tabular-nums">
                                  {l.area} m² × {Math.round(l.coefficient * 100)}%
                                </td>
                                <td className="py-1.5 text-right font-medium tabular-nums">{l.convertedArea} m²</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        <p className="text-xs text-slate-600">
                          {e.result.totalArea} m² × {e.result.unitPrice.toLocaleString("vi-VN")} đ/m² ={" "}
                          <b>{formatMoney(e.result.total)}</b> (khoảng {formatMoney(e.result.low)} – {formatMoney(e.result.high)})
                        </p>
                        {p.notes && <p className="text-xs text-slate-600">Ghi chú: {p.notes}</p>}
                      </div>
                      <div className="space-y-2">
                        {e.advice ? (
                          <div className="rounded-lg bg-white p-3 ring-1 ring-indigo-100">
                            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                              <Sparkles className="size-3.5" /> Nhận xét AI đã gửi khách
                            </p>
                            <p className="text-xs leading-relaxed text-slate-600">{e.advice.summary}</p>
                          </div>
                        ) : (
                          <p className="text-xs text-slate-400">Không có nhận xét AI.</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {e.contact_id && (
                            <Link
                              href={`/lien-he-khach-hang?open=${e.contact_id}`}
                              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 text-xs font-medium text-white hover:bg-indigo-700"
                            >
                              <UserCheck className="size-3.5" /> Mở liên hệ{" "}
                              {e.contact_status && `· ${CONTACT_STATUS[e.contact_status as ContactStatus]?.label ?? e.contact_status}`}
                            </Link>
                          )}
                          {(role === "admin" || role === "editor") && (
                            <Btn size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => setToDelete(e)}>
                              <Trash2 /> Xoá
                            </Btn>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {meta && meta.total > 0 && <Pager page={page} totalPages={meta.totalPages} total={meta.total} limit={20} onChange={setPage} />}
      </Panel>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title="Xoá lượt dự toán này?"
        description="Liên hệ khách hàng (nếu có) vẫn được giữ lại."
        confirmLabel="Xoá"
        loading={deleting}
        onConfirm={async () => {
          if (!toDelete) return;
          setDeleting(true);
          try {
            await estimateApi.remove(toDelete.id);
            setToDelete(null);
            load();
          } catch (err) {
            toast.error(getErrorMessage(err));
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}

function Kpi({ label, value, sub }: { label: string; value: React.ReactNode; sub: string }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

/* --------------------------------- Config --------------------------------- */

function ConfigEditor() {
  const role = useAppSelector((s) => s.auth.user?.role);
  const canEdit = role === "admin" || role === "editor";
  const [cfg, setCfg] = React.useState<EstimateAdminConfig | null>(null);
  const [original, setOriginal] = React.useState<string>("");
  const [ai, setAi] = React.useState<AiInfo | null>(null);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    estimateApi
      .getConfig()
      .then((r) => {
        setCfg(r.config);
        setOriginal(JSON.stringify(r.config));
        setAi(r.ai);
      })
      .catch((e) => toast.error(getErrorMessage(e, "Không tải được cấu hình")));
  }, []);

  if (!cfg) return <LoadingBlock />;

  const dirty = JSON.stringify(cfg) !== original;
  const anyPrice = cfg.packages.some((p) =>
    Object.values(p.prices).some((v) => (typeof v === "number" ? v > 0 : Object.values(v).some((x) => x > 0)))
  );

  const setPrice = (pkgId: string, type: string, value: number, finish?: string) =>
    setCfg((c) =>
      c
        ? {
          ...c,
          packages: c.packages.map((p) => {
            if (p.id !== pkgId) return p;
            const prices = { ...p.prices };
            if (finish) prices[type] = { ...(prices[type] as Record<string, number>), [finish]: value };
            else prices[type] = value;
            return { ...p, prices };
          }),
        }
        : c
    );

  const setCoef = (path: string[], value: number) =>
    setCfg((c) => {
      if (!c) return c;
      const next = structuredClone(c);
      let o: Record<string, unknown> = next.coefficients as unknown as Record<string, unknown>;
      for (let i = 0; i < path.length - 1; i++) o = o[path[i]] as Record<string, unknown>;
      o[path[path.length - 1]] = value;
      return next;
    });

  const save = async () => {
    setSaving(true);
    try {
      const r = await estimateApi.saveConfig(cfg);
      setCfg(r.config);
      setOriginal(JSON.stringify(r.config));
      toast.success("Đã lưu cấu hình dự toán. Website cập nhật trong khoảng 1 phút.");
    } catch (e) {
      toast.error(getErrorMessage(e, "Lưu cấu hình thất bại"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {!anyPrice && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 size-5 shrink-0" />
          <div>
            <p className="font-semibold">Chưa có đơn giá nào</p>
            <p>
              Công cụ chỉ hiển thị trên website khi có ít nhất một đơn giá và đã bật. Ô để trống (0) nghĩa là gói đó không áp dụng cho loại công
              trình đó – khách sẽ không thấy lựa chọn này.
            </p>
          </div>
        </div>
      )}
      {ai && (
        <div className="flex gap-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <Sparkles className={cn("mt-0.5 size-5 shrink-0", ai.provider === "none" ? "text-slate-400" : "text-indigo-600")} />
          {ai.provider === "none" ? (
            <p>
              Phần AI (điền giúp từ mô tả, nhận xét kết quả) đang tắt vì backend chưa có{" "}
              <code className="rounded bg-slate-100 px-1">GEMINI_API_KEY</code>. Công cụ vẫn tính được dự toán bình thường.
            </p>
          ) : (
            <p>
              Trợ lý AI đang bật: <b>{ai.provider === "gemini" ? "Google Gemini" : "Claude (Anthropic)"}</b> · model{" "}
              <code className="rounded bg-slate-100 px-1">{ai.model}</code> · đã dùng <b>{ai.usedToday}</b>/{ai.dailyLimit} lượt hôm nay
              (mỗi lượt dự toán dùng tối đa 2 lượt).
            </p>
          )}
        </div>
      )}

      <Panel title="Trạng thái" bodyClassName="space-y-4">
        <Switch
          id="est-enabled"
          checked={cfg.enabled}
          disabled={!canEdit}
          onChange={(v) => setCfg({ ...cfg, enabled: v })}
          label="Hiển thị công cụ dự toán trên website"
          description="Chỉ hiển thị công cụ tại trang /bang-gia"
        />
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Biên độ khoảng giá (±%)" htmlFor="est-range" hint="Khách thấy khoảng giá thấp – cao quanh con số ước tính">
            <TextInput id="est-range" type="number" min={0} max={50} value={cfg.rangePercent} disabled={!canEdit} onChange={(e) => setCfg({ ...cfg, rangePercent: Number(e.target.value) })} />
          </Field>
          <Field label="Diện tích tum so với sàn (%)" htmlFor="est-tum" hint="Dùng khi khách chọn có tum">
            <TextInput
              id="est-tum"
              type="number"
              min={0}
              max={100}
              value={Math.round(cfg.tumAreaRatio * 100)}
              disabled={!canEdit}
              onChange={(e) => setCfg({ ...cfg, tumAreaRatio: Number(e.target.value) / 100 })}
            />
          </Field>
        </div>
        <Field label="Lưu ý hiển thị dưới kết quả" htmlFor="est-disc">
          <TextArea id="est-disc" rows={2} value={cfg.disclaimer} disabled={!canEdit} onChange={(e) => setCfg({ ...cfg, disclaimer: e.target.value })} />
        </Field>
      </Panel>

      {cfg.packages.map((pkg) => (
        <Panel
          key={pkg.id}
          title={pkg.label}
          description={`${pkg.description} · Đơn vị: đồng/m² ${pkg.basis === "floor_area" ? "sàn sử dụng" : "diện tích xây dựng quy đổi"}`}
          bodyClassName="overflow-x-auto"
        >
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-2 font-medium">Loại công trình</th>
                {pkg.byFinish ? FINISHES.map((f) => <th key={f.id} className="pb-2 font-medium">{f.label}</th>) : <th className="pb-2 font-medium">Đơn giá</th>}
              </tr>
            </thead>
            <tbody>
              {TYPES.map((t) => (
                <tr key={t.id} className="border-t border-slate-100">
                  <td className="py-2 pr-3 font-medium text-slate-700">{t.label}</td>
                  {pkg.byFinish ? (
                    FINISHES.map((f) => (
                      <td key={f.id} className="py-2 pr-3">
                        <MoneyInput
                          value={(pkg.prices[t.id] as Record<string, number>)?.[f.id] ?? 0}
                          disabled={!canEdit}
                          onChange={(v) => setPrice(pkg.id, t.id, v, f.id)}
                          label={`${pkg.label} – ${t.label} – ${f.label}`}
                        />
                      </td>
                    ))
                  ) : (
                    <td className="py-2 pr-3">
                      <MoneyInput value={(pkg.prices[t.id] as number) ?? 0} disabled={!canEdit} onChange={(v) => setPrice(pkg.id, t.id, v)} label={`${pkg.label} – ${t.label}`} />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      ))}

      <Panel title="Hệ số diện tích quy đổi" description="Tỉ lệ % diện tích tính giá cho từng hạng mục (theo quy ước báo giá xây dựng phổ biến – chỉnh theo cách tính của công ty)">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CoefInput label="Móng đơn" value={cfg.coefficients.foundation.don} disabled={!canEdit} onChange={(v) => setCoef(["foundation", "don"], v)} />
          <CoefInput label="Móng băng" value={cfg.coefficients.foundation.bang} disabled={!canEdit} onChange={(v) => setCoef(["foundation", "bang"], v)} />
          <CoefInput label="Móng cọc" value={cfg.coefficients.foundation.coc} disabled={!canEdit} onChange={(v) => setCoef(["foundation", "coc"], v)} />
          <CoefInput label="Tầng hầm" value={cfg.coefficients.basement} disabled={!canEdit} onChange={(v) => setCoef(["basement"], v)} />
          <CoefInput label="Sàn các tầng" value={cfg.coefficients.floor} disabled={!canEdit} onChange={(v) => setCoef(["floor"], v)} />
          <CoefInput label="Tum" value={cfg.coefficients.tum} disabled={!canEdit} onChange={(v) => setCoef(["tum"], v)} />
          <CoefInput label="Mái BTCT" value={cfg.coefficients.roof.btct} disabled={!canEdit} onChange={(v) => setCoef(["roof", "btct"], v)} />
          <CoefInput label="Mái ngói (kèo thép)" value={cfg.coefficients.roof.ngoi} disabled={!canEdit} onChange={(v) => setCoef(["roof", "ngoi"], v)} />
          <CoefInput label="Mái tôn" value={cfg.coefficients.roof.ton} disabled={!canEdit} onChange={(v) => setCoef(["roof", "ton"], v)} />
          <CoefInput label="Sân" value={cfg.coefficients.yard} disabled={!canEdit} onChange={(v) => setCoef(["yard"], v)} />
        </div>
      </Panel>

      {canEdit && (
        <div className={cn("sticky bottom-4 z-20 flex justify-end", !dirty && "opacity-90")}>
          <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-2xl">
            <span>{dirty ? "Có thay đổi chưa lưu" : "Đã lưu"}</span>
            <Btn size="sm" onClick={save} loading={saving} disabled={!dirty}>
              {!saving && <Save />} Lưu cấu hình
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

function MoneyInput({ value, onChange, disabled, label }: { value: number; onChange: (v: number) => void; disabled?: boolean; label: string }) {
  const [text, setText] = React.useState(value ? value.toLocaleString("vi-VN") : "");
  React.useEffect(() => setText(value ? value.toLocaleString("vi-VN") : ""), [value]);
  return (
    <div className="relative">
      <TextInput
        aria-label={label}
        inputMode="numeric"
        className="h-9 pr-10 text-right tabular-nums"
        placeholder="—"
        value={text}
        disabled={disabled}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "");
          setText(digits ? Number(digits).toLocaleString("vi-VN") : "");
        }}
        onBlur={() => onChange(Number(text.replace(/[^\d]/g, "")) || 0)}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">đ</span>
    </div>
  );
}

function CoefInput({ label, value, onChange, disabled }: { label: string; value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <Field label={label}>
      <div className="relative">
        <TextInput
          type="number"
          min={0}
          max={300}
          step={5}
          className="h-9 pr-8 tabular-nums"
          value={Math.round(value * 100)}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value) / 100)}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">%</span>
      </div>
    </Field>
  );
}
