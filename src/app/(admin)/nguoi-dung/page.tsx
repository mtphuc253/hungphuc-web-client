"use client";

import * as React from "react";
import { Eye, EyeOff, KeyRound, Pencil, Search, ShieldCheck, Trash2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import type { AdminUser, UserRole } from "@/types/admin";
import { useAppSelector } from "@/store/hooks";
import { cn } from "@/lib/utils";
import {
  Btn,
  ConfirmDialog,
  EmptyState,
  Field,
  LoadingBlock,
  Modal,
  PageHeader,
  Pill,
  TextInput,
} from "@/components/admin/primitives";
import { fmtDate, initials, ROLE_LABEL, timeAgo } from "@/components/admin/format";

type UserForm = { id?: string; name: string; email: string; password: string; role: UserRole };

export default function UsersPage() {
  const me = useAppSelector((s) => s.auth.user);
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [form, setForm] = React.useState<UserForm | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const [toDelete, setToDelete] = React.useState<AdminUser | null>(null);
  const [deleting, setDeleting] = React.useState(false);

  const load = React.useCallback(async () => {
    try {
      const res = await adminApi.getUsers();
      setUsers(res.data);
    } catch (e) {
      toast.error(getErrorMessage(e, "Không tải được danh sách tài khoản"));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = users.filter(
    (u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
  );

  const save = async () => {
    if (!form) return;
    if (form.name.trim().length < 2) return toast.error("Tên phải có ít nhất 2 ký tự");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error("Email không hợp lệ");
    if ((!form.id || form.password) && !/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(form.password)) {
      return toast.error("Mật khẩu tối thiểu 8 ký tự, có chữ và số");
    }
    setSaving(true);
    try {
      if (form.id) {
        await adminApi.updateUser(form.id, {
          name: form.name.trim(),
          email: form.email.trim(),
          role: form.role,
          ...(form.password ? { password: form.password } : {}),
        });
        toast.success("Đã cập nhật tài khoản");
      } else {
        await adminApi.createUser({ name: form.name.trim(), email: form.email.trim(), password: form.password, role: form.role });
        toast.success("Đã tạo tài khoản. Hãy gửi email & mật khẩu cho người dùng.");
      }
      setForm(null);
      load();
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
      await adminApi.deleteUser(toDelete.id);
      toast.success("Đã xoá tài khoản");
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setDeleting(false);
    }
  };

  const genPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let pw = "";
    const arr = new Uint32Array(12);
    crypto.getRandomValues(arr);
    arr.forEach((n) => (pw += chars[n % chars.length]));
    pw = pw.slice(0, 10) + "a7";
    setForm((f) => (f ? { ...f, password: pw } : f));
    setShowPw(true);
  };

  return (
    <>
      <PageHeader
        title="Tài khoản quản trị"
        description="Quản lý người có quyền đăng nhập trang quản trị và phân quyền."
        actions={
          <Btn
            onClick={() => {
              setShowPw(false);
              setForm({ name: "", email: "", password: "", role: "staff" });
            }}
          >
            <UserPlus /> Thêm tài khoản
          </Btn>
        }
      />

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => (
          <div key={r} className="rounded-xl border border-slate-200/80 bg-white p-4">
            <div className="flex items-center justify-between">
              <Pill tone={ROLE_LABEL[r].tone}>{ROLE_LABEL[r].label}</Pill>
              <span className="text-xl font-bold tabular-nums text-slate-900">{users.filter((u) => u.role === r).length}</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">{ROLE_LABEL[r].description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        <div className="border-b border-slate-100 p-4">
          <div className="relative max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <TextInput className="h-9 pl-9" placeholder="Tìm theo tên hoặc email…" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Tìm tài khoản" />
          </div>
        </div>
        {loading ? (
          <LoadingBlock />
        ) : filtered.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="Không có tài khoản phù hợp" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Người dùng</th>
                  <th className="px-3 py-3">Vai trò</th>
                  <th className="px-3 py-3">Bài viết</th>
                  <th className="px-3 py-3">Đăng nhập gần nhất</th>
                  <th className="px-3 py-3">Ngày tạo</th>
                  <th className="px-3 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-semibold text-white">
                          {initials(u.name)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900">
                            {u.name} {u.id === me?.id && <span className="text-xs font-normal text-slate-400">(bạn)</span>}
                          </p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Pill tone={ROLE_LABEL[u.role]?.tone ?? "slate"}>{ROLE_LABEL[u.role]?.label ?? u.role}</Pill>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">{u.article_count ?? 0}</td>
                    <td className="px-3 py-3 text-slate-600">{u.last_login_at ? timeAgo(u.last_login_at) : "—"}</td>
                    <td className="px-3 py-3 text-slate-600">{fmtDate(u.created_at)}</td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <Btn
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Sửa ${u.name}`}
                          onClick={() => {
                            setShowPw(false);
                            setForm({ id: u.id, name: u.name, email: u.email, password: "", role: u.role });
                          }}
                        >
                          <Pencil />
                        </Btn>
                        <Btn
                          variant="ghost"
                          size="icon-sm"
                          className="text-rose-600 hover:bg-rose-50"
                          aria-label={`Xoá ${u.name}`}
                          disabled={u.id === me?.id}
                          onClick={() => setToDelete(u)}
                        >
                          <Trash2 />
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        open={!!form}
        onOpenChange={(v) => !v && setForm(null)}
        title={form?.id ? "Sửa tài khoản" : "Thêm tài khoản quản trị"}
        footer={
          <>
            <Btn variant="outline" onClick={() => setForm(null)}>
              Huỷ
            </Btn>
            <Btn onClick={save} loading={saving}>
              {form?.id ? "Lưu" : "Tạo tài khoản"}
            </Btn>
          </>
        }
      >
        {form && (
          <div className="space-y-4">
            <Field label="Họ tên" required htmlFor="u-name">
              <TextInput id="u-name" autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Email đăng nhập" required htmlFor="u-email">
              <TextInput id="u-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field
              label={form.id ? "Đặt lại mật khẩu" : "Mật khẩu"}
              required={!form.id}
              htmlFor="u-pw"
              hint={form.id ? "Để trống nếu không đổi. Đổi mật khẩu sẽ đăng xuất người dùng khỏi mọi thiết bị." : "Tối thiểu 8 ký tự, có chữ và số."}
            >
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <TextInput
                    id="u-pw"
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    autoComplete="new-password"
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
                  >
                    {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <Btn variant="outline" onClick={genPassword}>
                  <KeyRound /> Tạo ngẫu nhiên
                </Btn>
              </div>
            </Field>
            <Field label="Vai trò">
              <div className="grid gap-2">
                {(Object.keys(ROLE_LABEL) as UserRole[]).map((r) => (
                  <label
                    key={r}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition",
                      form.role === r ? "border-indigo-400 bg-indigo-50/50 ring-2 ring-indigo-500/10" : "border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      className="mt-0.5 accent-indigo-600"
                      checked={form.role === r}
                      disabled={form.id === me?.id && r !== "admin"}
                      onChange={() => setForm({ ...form, role: r })}
                    />
                    <span>
                      <span className="block text-sm font-medium text-slate-900">{ROLE_LABEL[r].label}</span>
                      <span className="block text-xs text-slate-500">{ROLE_LABEL[r].description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(v) => !v && setToDelete(null)}
        title={`Xoá tài khoản ${toDelete?.name}?`}
        description="Người này sẽ không thể đăng nhập nữa. Bài viết của họ vẫn được giữ lại (không còn tên tác giả)."
        confirmLabel="Xoá tài khoản"
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </>
  );
}
