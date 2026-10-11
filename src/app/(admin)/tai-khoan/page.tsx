"use client";

import * as React from "react";
import { Eye, EyeOff, KeyRound, Save, UserCircle2 } from "lucide-react";
import { toast } from "sonner";
import { adminApi, getErrorMessage } from "@/services/adminApi";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setCredentials } from "@/store/slices/authSlice";
import { Btn, Field, PageHeader, Panel, Pill, TextInput } from "@/components/admin/primitives";
import { initials, ROLE_LABEL } from "@/components/admin/format";
import type { UserRole } from "@/types/admin";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const [info, setInfo] = React.useState({ name: user?.name || "", email: user?.email || "" });
  const [pw, setPw] = React.useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = React.useState(false);
  const [savingInfo, setSavingInfo] = React.useState(false);
  const [savingPw, setSavingPw] = React.useState(false);

  React.useEffect(() => {
    if (user) setInfo({ name: user.name, email: user.email });
  }, [user]);

  const saveInfo = async () => {
    setSavingInfo(true);
    try {
      const res = await adminApi.updateProfile({ name: info.name.trim(), email: info.email.trim() });
      dispatch(setCredentials({ user: res.data, accessToken: accessToken! }));
      toast.success("Đã cập nhật thông tin");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSavingInfo(false);
    }
  };

  const strength = (() => {
    const p = pw.next;
    let s = 0;
    if (p.length >= 8) s++;
    if (p.length >= 12) s++;
    if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++;
    if (/\d/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();

  const savePw = async () => {
    if (!pw.current) return toast.error("Vui lòng nhập mật khẩu hiện tại");
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,}$/.test(pw.next)) return toast.error("Mật khẩu mới tối thiểu 8 ký tự, có chữ và số");
    if (pw.next !== pw.confirm) return toast.error("Xác nhận mật khẩu không khớp");
    setSavingPw(true);
    try {
      await adminApi.updateProfile({ name: info.name.trim(), email: info.email.trim(), password: pw.next, currentPassword: pw.current });
      setPw({ current: "", next: "", confirm: "" });
      toast.success("Đã đổi mật khẩu");
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setSavingPw(false);
    }
  };

  const role = (user?.role || "staff") as UserRole;

  return (
    <>
      <PageHeader title="Hồ sơ của tôi" description="Cập nhật thông tin cá nhân và mật khẩu đăng nhập." />
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <Panel bodyClassName="flex flex-col items-center p-8 text-center">
          <span className="flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl font-semibold text-white shadow-lg">
            {initials(user?.name)}
          </span>
          <p className="mt-4 text-lg font-semibold text-slate-900">{user?.name}</p>
          <p className="text-sm text-slate-500">{user?.email}</p>
          <Pill tone={ROLE_LABEL[role].tone} className="mt-3">
            {ROLE_LABEL[role].label}
          </Pill>
          <p className="mt-3 text-xs text-slate-500">{ROLE_LABEL[role].description}</p>
        </Panel>

        <div className="space-y-6">
          <Panel
            title={
              <span className="inline-flex items-center gap-2">
                <UserCircle2 className="size-4" /> Thông tin cá nhân
              </span>
            }
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Họ tên" htmlFor="p-name">
                <TextInput id="p-name" value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} />
              </Field>
              <Field label="Email đăng nhập" htmlFor="p-email">
                <TextInput id="p-email" type="email" value={info.email} onChange={(e) => setInfo({ ...info, email: e.target.value })} />
              </Field>
            </div>
            <div className="mt-5 flex justify-end">
              <Btn onClick={saveInfo} loading={savingInfo} disabled={info.name === user?.name && info.email === user?.email}>
                {!savingInfo && <Save />} Lưu thông tin
              </Btn>
            </div>
          </Panel>

          <Panel
            title={
              <span className="inline-flex items-center gap-2">
                <KeyRound className="size-4" /> Đổi mật khẩu
              </span>
            }
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Mật khẩu hiện tại" htmlFor="pw-cur">
                <TextInput id="pw-cur" type={show ? "text" : "password"} autoComplete="current-password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} />
              </Field>
              <Field label="Mật khẩu mới" htmlFor="pw-new">
                <TextInput id="pw-new" type={show ? "text" : "password"} autoComplete="new-password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} />
              </Field>
              <Field label="Nhập lại mật khẩu mới" htmlFor="pw-cf" error={pw.confirm && pw.confirm !== pw.next ? "Không khớp" : null}>
                <TextInput id="pw-cf" type={show ? "text" : "password"} autoComplete="new-password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} />
              </Field>
            </div>
            {pw.next && (
              <div className="mt-3 flex items-center gap-3">
                <div className="flex flex-1 gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 flex-1 rounded-full ${i < strength ? (strength >= 4 ? "bg-emerald-500" : strength >= 3 ? "bg-amber-500" : "bg-rose-500") : "bg-slate-200"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500">{strength >= 4 ? "Mạnh" : strength >= 3 ? "Trung bình" : "Yếu"}</span>
              </div>
            )}
            <div className="mt-5 flex items-center justify-between">
              <button type="button" onClick={() => setShow((v) => !v)} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
                {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {show ? "Ẩn" : "Hiện"} mật khẩu
              </button>
              <Btn onClick={savePw} loading={savingPw}>
                Đổi mật khẩu
              </Btn>
            </div>
          </Panel>
        </div>
      </div>
    </>
  );
}
