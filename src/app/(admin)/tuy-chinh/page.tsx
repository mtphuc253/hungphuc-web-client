"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { SettingRow } from "@/types/admin";
import { useAppDispatch } from "@/store/hooks";
import { fetchSettings } from "@/store/slices/settingsSlice";
import { cn } from "@/lib/utils";
import {
  Btn,
  ConfirmDialog,
  Field,
  LoadingBlock,
  PageHeader,
  Panel,
  Pill,
  TextArea,
  TextInput,
} from "@/components/admin/primitives";
import { ImageUploader } from "@/components/admin/image-uploader";
import { fmtDateTime } from "@/components/admin/format";
import { joinList, KNOWN_SETTING_KEYS, parseList, SETTING_GROUPS, type SettingField } from "@/lib/site-settings";

export default function SettingsPage() {
  const dispatch = useAppDispatch();
  const [rows, setRows] = React.useState<SettingRow[]>([]);
  const [values, setValues] = React.useState<Record<string, string>>({});
  const [original, setOriginal] = React.useState<Record<string, string>>({});
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [section, setSection] = React.useState(SETTING_GROUPS[0].id);
  const [newKey, setNewKey] = React.useState({ key: "", value: "" });
  const [toDelete, setToDelete] = React.useState<string | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const apply = (data: SettingRow[]) => {
    setRows(data);
    const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
    setValues(map);
    setOriginal(map);
  };

  React.useEffect(() => {
    adminApi
      .getSettings()
      .then((r) => apply(r.data))
      .catch((e) => toast.error(getErrorMessage(e, "Không tải được cài đặt")))
      .finally(() => setLoading(false));
  }, []);

  const changedKeys = Object.keys(values).filter((k) => (values[k] ?? "") !== (original[k] ?? ""));
  const dirty = changedKeys.length > 0;

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const save = async () => {
    const payload = Object.fromEntries(changedKeys.map((k) => [k, values[k] ?? ""]));
    if (!Object.keys(payload).length) return;
    setSaving(true);
    try {
      const res = await adminApi.saveSettings(payload);
      apply(res.data);
      dispatch(fetchSettings());
      toast.success(`Đã lưu ${Object.keys(payload).length} thay đổi`);
    } catch (e) {
      toast.error(getErrorMessage(e, "Lưu cài đặt thất bại"));
    } finally {
      setSaving(false);
    }
  };

  const addCustom = async () => {
    const key = newKey.key.trim();
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(key)) return toast.error("Khoá chỉ gồm chữ, số, dấu gạch dưới và bắt đầu bằng chữ");
    if (key in values) return toast.error("Khoá này đã tồn tại");
    setSaving(true);
    try {
      const res = await adminApi.saveSettings({ [key]: newKey.value });
      apply(res.data);
      setNewKey({ key: "", value: "" });
      toast.success("Đã thêm cài đặt");
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
      await adminApi.deleteSetting(toDelete);
      const res = await adminApi.getSettings();
      apply(res.data);
      dispatch(fetchSettings());
      toast.success("Đã xoá cài đặt");
      setToDelete(null);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (loading) return <LoadingBlock />;

  const customRows = rows.filter((r) => !KNOWN_SETTING_KEYS.includes(r.key));
  const sections = [...SETTING_GROUPS.map((g) => ({ id: g.id, title: g.title })), { id: "advanced", title: "Nâng cao" }];

  return (
    <>
      <PageHeader
        title="Thông tin website"
        description="Thông tin công ty, liên hệ, mạng xã hội và SEO mặc định hiển thị trên toàn website."
        actions={
          <>
            {dirty && (
              <Btn variant="ghost" onClick={() => setValues(original)}>
                <RotateCcw /> Hoàn tác
              </Btn>
            )}
            <Btn onClick={save} loading={saving} disabled={!dirty}>
              {!saving && <Save />} Lưu thay đổi {dirty && `(${changedKeys.length})`}
            </Btn>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav className="lg:sticky lg:top-24 lg:self-start" aria-label="Nhóm cài đặt">
          <ul className="flex gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-white p-1.5 lg:flex-col">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setSection(s.id)}
                  className={cn(
                    "block whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition",
                    section === s.id ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="space-y-6">
          {SETTING_GROUPS.map((g) => (
            <div id={g.id} key={g.id} className="scroll-mt-24">
              <Panel title={g.title} description={g.description}>
                <div className="grid gap-5 md:grid-cols-2">
                  {g.fields.map((f) => (
                    <SettingInput
                      key={f.key}
                      field={f}
                      value={values[f.key] ?? ""}
                      changed={(values[f.key] ?? "") !== (original[f.key] ?? "")}
                      onChange={(v) => set(f.key, v)}
                    />
                  ))}
                </div>
              </Panel>
            </div>
          ))}

          <div id="advanced" className="scroll-mt-24">
            <Panel title="Cài đặt nâng cao" description="Các khoá tuỳ chỉnh khác trong bảng Settings (dành cho kỹ thuật)" bodyClassName="space-y-4">
              {customRows.length > 0 ? (
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {customRows.map((r) => (
                    <li key={r.key} className="flex flex-col gap-2 p-3 sm:flex-row sm:items-start">
                      <div className="sm:w-48">
                        <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-700">{r.key}</code>
                        <p className="mt-1 text-[11px] text-slate-400">{fmtDateTime(r.updated_at)}</p>
                      </div>
                      <TextArea rows={2} className="min-h-0 flex-1" value={values[r.key] ?? ""} onChange={(e) => set(r.key, e.target.value)} />
                      <Btn variant="ghost" size="icon" className="text-rose-600 hover:bg-rose-50" aria-label={`Xoá ${r.key}`} onClick={() => setToDelete(r.key)}>
                        <Trash2 />
                      </Btn>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500">Không có khoá tuỳ chỉnh nào.</p>
              )}
              <div className="flex flex-col gap-2 rounded-xl bg-slate-50 p-3 sm:flex-row">
                <TextInput className="sm:w-48" placeholder="ten_khoa" value={newKey.key} onChange={(e) => setNewKey({ ...newKey, key: e.target.value })} aria-label="Tên khoá mới" />
                <TextInput className="flex-1" placeholder="Giá trị" value={newKey.value} onChange={(e) => setNewKey({ ...newKey, value: e.target.value })} aria-label="Giá trị" />
                <Btn variant="outline" onClick={addCustom} disabled={!newKey.key.trim()}>
                  <Plus /> Thêm khoá
                </Btn>
              </div>
            </Panel>
          </div>
        </div>
      </div>

      {dirty && (
        <div className="fixed inset-x-0 bottom-4 z-30 flex justify-center px-4 lg:pl-[264px]">
          <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm text-white shadow-2xl">
            <span>Bạn có {changedKeys.length} thay đổi chưa lưu</span>
            <Btn size="sm" variant="ghost" className="text-slate-300 hover:bg-white/10 hover:text-white" onClick={() => setValues(original)}>
              Huỷ
            </Btn>
            <Btn size="sm" onClick={save} loading={saving}>
              Lưu ngay
            </Btn>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Xoá cài đặt "${toDelete}"?`}
        confirmLabel="Xoá"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}

function SettingInput({
  field,
  value,
  onChange,
  changed,
}: {
  field: SettingField;
  value: string;
  onChange: (v: string) => void;
  changed: boolean;
}) {
  const label = (
    <span className="inline-flex items-center gap-2">
      {field.label}
      {changed && <Pill tone="amber">Đã sửa</Pill>}
    </span>
  );
  const id = `s-${field.key}`;
  const counter = field.max ? { value: value.length, max: field.max } : undefined;

  if (field.type === "image") {
    return (
      <Field label={label} hint={field.hint} className="md:col-span-2">
        <div className="max-w-sm">
          <ImageUploader value={value || null} onChange={(url) => onChange(url || "")} aspect="aspect-[2/1]" fit="contain" />
        </div>
      </Field>
    );
  }
  if (field.type === "list") {
    return <ListEditor value={value} onChange={onChange} />;
  }
  if (field.type === "textarea") {
    return (
      <Field label={label} htmlFor={id} hint={field.hint} counter={counter} className="md:col-span-2">
        <TextArea id={id} rows={3} value={value} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} />
      </Field>
    );
  }
  return (
    <Field label={label} htmlFor={id} hint={field.hint} counter={counter}>
      <TextInput
        id={id}
        type={field.type === "url" ? "url" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
        value={value}
        placeholder={field.placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function ListEditor({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const items = parseList(value);
  const [draft, setDraft] = React.useState("");
  const update = (list: string[]) => onChange(joinList(list));

  return (
    <div className="space-y-3 md:col-span-2">
      {items.length === 0 && <p className="text-sm text-slate-500">Chưa có thông điệp nào.</p>}
      <ul className="space-y-2">
        {items.map((it, i) => (
          <li key={`${i}-${it}`} className="flex items-center gap-2">
            <span className="w-6 text-right text-xs tabular-nums text-slate-400">{i + 1}</span>
            <TextInput
              defaultValue={it}
              onBlur={(e) => {
                const next = [...items];
                next[i] = e.target.value;
                update(next);
              }}
              aria-label={`Thông điệp ${i + 1}`}
            />
            <Btn variant="ghost" size="icon" aria-label="Đưa lên" disabled={i === 0} onClick={() => {
              const n = [...items];
              [n[i - 1], n[i]] = [n[i], n[i - 1]];
              update(n);
            }}>
              <ArrowUp />
            </Btn>
            <Btn variant="ghost" size="icon" aria-label="Đưa xuống" disabled={i === items.length - 1} onClick={() => {
              const n = [...items];
              [n[i + 1], n[i]] = [n[i], n[i + 1]];
              update(n);
            }}>
              <ArrowDown />
            </Btn>
            <Btn variant="ghost" size="icon" className="text-rose-600 hover:bg-rose-50" aria-label="Xoá thông điệp" onClick={() => update(items.filter((_, idx) => idx !== i))}>
              <X />
            </Btn>
          </li>
        ))}
      </ul>
      <div className="flex gap-2 pl-8">
        <TextInput
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draft.trim()) {
              e.preventDefault();
              update([...items, draft]);
              setDraft("");
            }
          }}
          placeholder="📞 Hotline 0903 938 463 – Tư vấn miễn phí"
          aria-label="Thông điệp mới"
        />
        <Btn
          variant="outline"
          disabled={!draft.trim()}
          onClick={() => {
            update([...items, draft]);
            setDraft("");
          }}
        >
          <Plus /> Thêm
        </Btn>
      </div>
      <p className="pl-8 text-xs text-slate-500">Lưu ý: dấu phẩy trong thông điệp sẽ được thay bằng khoảng trắng.</p>
    </div>
  );
}
