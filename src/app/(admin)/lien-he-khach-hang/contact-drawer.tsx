"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Eye, Mail, MapPin, MessageSquareText, Phone, Send, Trash2, UserCheck, X } from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { AdminContact, AdminUser, ContactStatus } from "@/types/admin";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import { Btn, ConfirmDialog, SelectInput, Skel, TextArea } from "@/components/admin/primitives";
import { CONTACT_STATUS, fmtDateTime, initials, timeAgo } from "@/components/admin/format";

export function ContactDrawer({
  contactId,
  onClose,
  onChanged,
  users,
}: {
  contactId: string | null;
  onClose: () => void;
  onChanged: () => void;
  users: AdminUser[];
}) {
  const me = useAppSelector((s) => s.auth.user);
  const [contact, setContact] = React.useState<AdminContact | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await adminApi.getContact(id);
      setContact(res.data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không tải được liên hệ"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (contactId) {
      setContact(null);
      setNote("");
      load(contactId).then(onChanged); // mở = đã xem -> cập nhật danh sách/badge
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contactId]);

  const update = async (patch: Partial<AdminContact>, success: string) => {
    if (!contact) return;
    try {
      await adminApi.updateContact(contact.id, patch);
      toast.success(success);
      await load(contact.id);
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const addNote = async () => {
    if (!contact || !note.trim()) return;
    setSending(true);
    try {
      await adminApi.addContactLog(contact.id, note.trim());
      setNote("");
      await load(contact.id);
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSending(false);
    }
  };

  const removeNote = async (logId: string) => {
    if (!contact) return;
    try {
      await adminApi.deleteContactLog(logId);
      await load(contact.id);
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleDelete = async () => {
    if (!contact) return;
    setDeleting(true);
    try {
      await adminApi.deleteContact(contact.id);
      toast.success("Đã xoá liên hệ");
      setConfirmDelete(false);
      onClose();
      onChanged();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  const phoneDigits = contact?.phone?.replace(/[^\d+]/g, "");
  const canDelete = me?.role === "admin" || me?.role === "editor";

  return (
    <DialogPrimitive.Root open={!!contactId} onOpenChange={(v) => !v && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xl flex-col bg-white shadow-2xl outline-none data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=open]:duration-300">
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-base font-semibold text-white">
                {initials(contact?.name)}
              </div>
              <div className="min-w-0">
                <DialogPrimitive.Title className="truncate text-lg font-semibold text-slate-900">
                  {contact?.name || "Đang tải…"}
                </DialogPrimitive.Title>
                <DialogPrimitive.Description className="text-xs text-slate-500">
                  {contact ? `Gửi lúc ${fmtDateTime(contact.created_at)} (${timeAgo(contact.created_at)}) · nguồn: ${contact.source || "website"}` : " "}
                </DialogPrimitive.Description>
              </div>
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Đóng">
              <X className="size-5" />
            </DialogPrimitive.Close>
          </div>

          {loading && !contact ? (
            <div className="space-y-4 p-6">
              <Skel className="h-20 w-full" />
              <Skel className="h-32 w-full" />
              <Skel className="h-40 w-full" />
            </div>
          ) : contact ? (
            <div className="min-h-0 flex-1 overflow-y-auto">
              {/* Quick actions */}
              <div className="grid grid-cols-3 gap-2 border-b border-slate-100 px-6 py-4">
                <a
                  href={phoneDigits ? `tel:${phoneDigits}` : undefined}
                  aria-disabled={!phoneDigits}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-xs font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700",
                    !phoneDigits && "pointer-events-none opacity-40"
                  )}
                >
                  <Phone className="size-4" /> Gọi điện
                </a>
                <a
                  href={phoneDigits ? `https://zalo.me/${phoneDigits.replace(/^\+84/, "0")}` : undefined}
                  target="_blank"
                  rel="noreferrer"
                  aria-disabled={!phoneDigits}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-xs font-medium text-slate-700 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700",
                    !phoneDigits && "pointer-events-none opacity-40"
                  )}
                >
                  <MessageSquareText className="size-4" /> Zalo
                </a>
                <a
                  href={contact.email ? `mailto:${contact.email}?subject=${encodeURIComponent("Hưng Phúc phản hồi yêu cầu tư vấn")}` : undefined}
                  aria-disabled={!contact.email}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl border border-slate-200 py-3 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700",
                    !contact.email && "pointer-events-none opacity-40"
                  )}
                >
                  <Mail className="size-4" /> Gửi email
                </a>
              </div>

              <div className="space-y-6 px-6 py-5">
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <InfoRow icon={Phone} label="Điện thoại" value={contact.phone} copy />
                  <InfoRow icon={Mail} label="Email" value={contact.email} copy />
                  <InfoRow icon={MapPin} label="Địa chỉ" value={contact.address} className="sm:col-span-2" />
                </dl>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Nội dung yêu cầu</p>
                  <div className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 ring-1 ring-inset ring-slate-200/70">
                    {contact.message || <span className="italic text-slate-400">Khách không để lại lời nhắn</span>}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="cstatus" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Trạng thái
                    </label>
                    <SelectInput
                      id="cstatus"
                      value={contact.status}
                      onChange={(e) => update({ status: e.target.value as ContactStatus }, "Đã cập nhật trạng thái")}
                    >
                      {(Object.keys(CONTACT_STATUS) as ContactStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {CONTACT_STATUS[s].label}
                        </option>
                      ))}
                    </SelectInput>
                  </div>
                  <div>
                    <label htmlFor="cassign" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Người phụ trách
                    </label>
                    {users.length > 0 ? (
                      <SelectInput
                        id="cassign"
                        value={contact.assigned_to || ""}
                        onChange={(e) => e.target.value && update({ assigned_to: e.target.value }, "Đã phân công người phụ trách")}
                      >
                        <option value="">— Chưa phân công —</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name}
                          </option>
                        ))}
                      </SelectInput>
                    ) : (
                      <div className="flex h-10 items-center gap-2">
                        <span className="text-sm text-slate-700">{contact.assigned_to_name || "Chưa phân công"}</span>
                        {me && contact.assigned_to !== me.id && (
                          <Btn size="sm" variant="outline" onClick={() => update({ assigned_to: me.id }, "Bạn đã nhận xử lý liên hệ này")}>
                            <UserCheck /> Nhận xử lý
                          </Btn>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline */}
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Lịch sử chăm sóc ({contact.logs?.length || 0})
                  </p>
                  <ol className="relative space-y-4 border-l border-slate-200 pl-5">
                    <li className="relative">
                      <span className="absolute -left-[26px] top-1 size-3 rounded-full bg-sky-500 ring-4 ring-white" />
                      <p className="text-sm text-slate-700">Khách gửi yêu cầu tư vấn qua {contact.source || "website"}</p>
                      <p className="text-xs text-slate-400">{fmtDateTime(contact.created_at)}</p>
                    </li>
                    {contact.logs?.map((log) => (
                      <li key={log.id} className="group relative">
                        <span className="absolute -left-[26px] top-1 size-3 rounded-full bg-indigo-500 ring-4 ring-white" />
                        <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200">
                          <div className="mb-1 flex items-center justify-between gap-2">
                            <p className="text-xs font-semibold text-slate-800">{log.user_name || "Người dùng đã xoá"}</p>
                            <div className="flex items-center gap-1">
                              <span className="text-[11px] text-slate-400">{fmtDateTime(log.created_at)}</span>
                              {(log.user_id === me?.id || me?.role === "admin") && (
                                <button
                                  type="button"
                                  aria-label="Xoá ghi chú"
                                  onClick={() => removeNote(log.id)}
                                  className="rounded p-1 text-slate-300 opacity-0 transition hover:bg-rose-50 hover:text-rose-600 group-hover:opacity-100 focus:opacity-100"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="whitespace-pre-line text-sm text-slate-700">{log.note}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>

                {contact.viewers && contact.viewers.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <Eye className="size-3.5" /> Đã xem
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {contact.viewers.map((v) => (
                        <span key={v.id} className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 py-1 pl-1 pr-2.5 text-xs text-slate-600" title={fmtDateTime(v.viewed_at)}>
                          <span className="flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-semibold">{initials(v.name)}</span>
                          {v.name} · {timeAgo(v.viewed_at)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {contact && (
            <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-4">
              <div className="flex gap-2">
                <TextArea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) addNote();
                  }}
                  rows={2}
                  className="min-h-0 resize-none bg-white"
                  placeholder="Thêm ghi chú chăm sóc: đã gọi, hẹn khảo sát, đã gửi báo giá… (Ctrl+Enter để gửi)"
                />
                <Btn onClick={addNote} loading={sending} disabled={!note.trim()} className="h-auto self-stretch" aria-label="Gửi ghi chú">
                  {!sending && <Send />}
                </Btn>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className="flex gap-2">
                  {contact.status !== "resolved" && (
                    <Btn size="sm" variant="success" onClick={() => update({ status: "resolved" }, "Đã đánh dấu xử lý xong")}>
                      Đánh dấu đã xử lý
                    </Btn>
                  )}
                  {contact.status !== "archived" && (
                    <Btn size="sm" variant="outline" onClick={() => update({ status: "archived" }, "Đã lưu trữ liên hệ")}>
                      Lưu trữ
                    </Btn>
                  )}
                </div>
                {canDelete && (
                  <Btn size="sm" variant="ghost" className="text-rose-600 hover:bg-rose-50" onClick={() => setConfirmDelete(true)}>
                    <Trash2 /> Xoá
                  </Btn>
                )}
              </div>
            </div>
          )}

          <ConfirmDialog
            open={confirmDelete}
            onOpenChange={setConfirmDelete}
            title="Xoá liên hệ này?"
            description="Liên hệ cùng toàn bộ ghi chú chăm sóc sẽ bị xoá vĩnh viễn."
            confirmLabel="Xoá liên hệ"
            loading={deleting}
            onConfirm={handleDelete}
          />
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
  copy,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
  copy?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start gap-3 rounded-xl border border-slate-200 p-3", className)}>
      <Icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <dt className="text-[11px] uppercase tracking-wide text-slate-400">{label}</dt>
        <dd className="break-words font-medium text-slate-800">{value || <span className="font-normal text-slate-400">—</span>}</dd>
      </div>
      {copy && value && (
        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(value).then(() => toast.success(`Đã sao chép ${label.toLowerCase()}`));
          }}
          className="rounded-md px-1.5 py-0.5 text-[11px] font-medium text-indigo-600 hover:bg-indigo-50"
        >
          Sao chép
        </button>
      )}
    </div>
  );
}

