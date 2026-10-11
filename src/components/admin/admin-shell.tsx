"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { usePathname, useRouter } from "next/navigation";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  Bell,
  Building2,
  Calculator,
  ChevronDown,
  DraftingCompass,
  ExternalLink,
  Images,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings2,
  ShieldCheck,
  Sparkles,
  UserCircle2,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout, setCredentials } from "@/store/slices/authSlice";
import { adminApi } from "@/services/adminApi";
import type { UserRole } from "@/types/admin";
import { initials, ROLE_LABEL } from "./format";

const LOGO =
  "https://res.cloudinary.com/dizk1uwv3/image/upload/v1758561417/Hungphuc/logo-hung-phuc-ngang.png";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles?: UserRole[];
  badge?: "contacts";
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Tổng quan",
    items: [
      { href: "/thong-ke", label: "Bảng điều khiển", icon: LayoutDashboard },
      { href: "/lien-he-khach-hang", label: "Liên hệ khách hàng", icon: Users, badge: "contacts" },
      { href: "/du-toan-ai", label: "Dự toán AI", icon: Sparkles },
    ],
  },
  {
    title: "Nội dung",
    items: [
      { href: "/bai-viet", label: "Bài viết", icon: Newspaper },
      { href: "/quan-ly-du-an/thiet-ke-kien-truc", label: "Thiết kế kiến trúc", icon: DraftingCompass },
      { href: "/quan-ly-du-an/thi-cong-xay-dung", label: "Thi công xây dựng", icon: Building2 },
      { href: "/bao-gia", label: "Bảng giá", icon: Calculator },
      { href: "/khac", label: "Banner & Đối tác", icon: Images },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      { href: "/tuy-chinh", label: "Thông tin website", icon: Settings2, roles: ["admin", "editor"] },
      { href: "/nguoi-dung", label: "Tài khoản quản trị", icon: ShieldCheck, roles: ["admin"] },
      { href: "/tai-khoan", label: "Hồ sơ của tôi", icon: UserCircle2 },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

interface AdminContextValue {
  unviewed: number;
  refreshUnviewed: () => void;
}
const AdminContext = React.createContext<AdminContextValue>({ unviewed: 0, refreshUnviewed: () => {} });
export const useAdmin = () => React.useContext(AdminContext);

export function AdminShell({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  const [ready, setReady] = React.useState(isAuthenticated);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [unviewed, setUnviewed] = React.useState(0);

  // Khôi phục phiên khi tải lại trang (Redux mất state, nhưng cookie refreshToken còn)
  React.useEffect(() => {
    if (isAuthenticated) {
      setReady(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await axios.post("/api/refresh", {}, { withCredentials: true });
        if (!res.data?.success || !res.data.accessToken) throw new Error("no session");
        let sessionUser = res.data.user;
        dispatch(setCredentials({ user: sessionUser ?? { id: "", name: "", email: "", role: "staff" }, accessToken: res.data.accessToken }));
        if (!sessionUser) {
          const profile = await adminApi.getProfile();
          sessionUser = profile.data;
          dispatch(setCredentials({ user: sessionUser, accessToken: res.data.accessToken }));
        }
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) router.replace(`/auth/login?next=${encodeURIComponent(pathname)}`);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refreshUnviewed = React.useCallback(() => {
    adminApi
      .getUnviewedCount()
      .then((r) => setUnviewed(r.data.count))
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (!ready) return;
    refreshUnviewed();
    const t = setInterval(refreshUnviewed, 60_000);
    return () => clearInterval(t);
  }, [ready, refreshUnviewed]);

  React.useEffect(() => setMobileOpen(false), [pathname]);

  const role = (user?.role || "staff") as UserRole;
  const current = ALL_ITEMS.find((i) => pathname === i.href || pathname.startsWith(i.href + "/"));

  // Chặn truy cập trang không đủ quyền
  React.useEffect(() => {
    if (ready && current?.roles && !current.roles.includes(role)) {
      toast.error("Bạn không có quyền truy cập trang này");
      router.replace("/thong-ke");
    }
  }, [ready, current, role, router]);

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
    } catch {
      // vẫn đăng xuất phía client
    }
    dispatch(logout());
    toast.success("Đã đăng xuất");
    router.replace("/auth/login");
  };

  if (!ready) {
    return (
      <div className="admin-theme flex min-h-screen items-center justify-center bg-[#f5f6fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative size-12">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-indigo-100 border-t-indigo-600" />
          </div>
          <p className="text-sm text-slate-500">Đang xác thực phiên đăng nhập…</p>
        </div>
      </div>
    );
  }

  const sidebar = (
    <SidebarContent
      pathname={pathname}
      role={role}
      unviewed={unviewed}
      onNavigate={() => setMobileOpen(false)}
    />
  );

  return (
    <AdminContext.Provider value={{ unviewed, refreshUnviewed }}>
      <div className="admin-theme min-h-screen bg-[#f5f6fa] text-slate-900">
        {/* Sidebar desktop */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] lg:block">{sidebar}</aside>

        {/* Sidebar mobile */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-slate-950/60" onClick={() => setMobileOpen(false)} />
            <aside className="absolute inset-y-0 left-0 w-[280px] animate-in slide-in-from-left duration-200">
              {sidebar}
              <button
                type="button"
                aria-label="Đóng menu"
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <X className="size-5" />
              </button>
            </aside>
          </div>
        )}

        <div className="lg:pl-[264px]">
          {/* Topbar */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/70 bg-white/85 px-4 backdrop-blur-md sm:px-6">
            <button
              type="button"
              aria-label="Mở menu điều hướng"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800">{current?.label ?? "Quản trị"}</p>
              <p className="hidden text-xs text-slate-500 sm:block">Hưng Phúc · Trang quản trị nội dung</p>
            </div>

            <Link
              href="/"
              target="_blank"
              className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 sm:inline-flex"
            >
              <ExternalLink className="size-4" /> Xem website
            </Link>

            <Link
              href="/lien-he-khach-hang?viewed=unviewed"
              aria-label={`${unviewed} liên hệ chưa xem`}
              className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell className="size-5" />
              {unviewed > 0 && (
                <span className="absolute right-1 top-1 flex min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-[18px] text-white ring-2 ring-white">
                  {unviewed > 99 ? "99+" : unviewed}
                </span>
              )}
            </Link>

            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2.5 rounded-xl py-1 pl-1 pr-2 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-indigo-500/40"
                >
                  <span className="flex size-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-semibold text-white">
                    {initials(user?.name)}
                  </span>
                  <span className="hidden text-left md:block">
                    <span className="block max-w-[140px] truncate text-sm font-medium text-slate-800">{user?.name}</span>
                    <span className="block text-xs text-slate-500">{ROLE_LABEL[role]?.label}</span>
                  </span>
                  <ChevronDown className="hidden size-4 text-slate-400 md:block" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  align="end"
                  sideOffset={8}
                  className="z-50 w-60 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95"
                >
                  <div className="px-2.5 py-2">
                    <p className="truncate text-sm font-semibold text-slate-900">{user?.name}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                  <DropdownMenu.Item asChild>
                    <Link href="/tai-khoan" className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-slate-100">
                      <UserCircle2 className="size-4" /> Hồ sơ & mật khẩu
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Item asChild>
                    <Link href="/" target="_blank" className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-slate-700 outline-none data-[highlighted]:bg-slate-100">
                      <ExternalLink className="size-4" /> Xem website
                    </Link>
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator className="my-1 h-px bg-slate-100" />
                  <DropdownMenu.Item
                    onSelect={handleLogout}
                    className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm text-rose-600 outline-none data-[highlighted]:bg-rose-50"
                  >
                    <LogOut className="size-4" /> Đăng xuất
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </header>

          <main className="mx-auto w-full max-w-[1400px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </AdminContext.Provider>
  );
}

function SidebarContent({
  pathname,
  role,
  unviewed,
  onNavigate,
}: {
  pathname: string;
  role: UserRole;
  unviewed: number;
  onNavigate: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-[#0f1629] text-slate-300">
      <div className="flex h-16 items-center gap-3 border-b border-white/[0.06] px-5">
        <div className="flex h-10 items-center rounded-lg bg-white px-2.5 py-1">
          <Image src={LOGO} alt="Hưng Phúc" width={120} height={36} className="h-7 w-auto object-contain" priority />
        </div>
        <span className="rounded-md bg-indigo-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-indigo-300">
          Admin
        </span>
      </div>

      <nav className="admin-scroll flex-1 space-y-6 overflow-y-auto px-3 py-5" aria-label="Điều hướng quản trị">
        {NAV_GROUPS.map((group) => {
          const items = group.items.filter((i) => !i.roles || i.roles.includes(role));
          if (!items.length) return null;
          return (
            <div key={group.title}>
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">{group.title}</p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(item.href + "/");
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onNavigate}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
                          active
                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/40"
                            : "text-slate-400 hover:bg-white/[0.05] hover:text-white"
                        )}
                      >
                        <item.icon className={cn("size-[18px]", active ? "text-white" : "text-slate-500 group-hover:text-slate-300")} />
                        <span className="flex-1 truncate">{item.label}</span>
                        {item.badge === "contacts" && unviewed > 0 && (
                          <span
                            className={cn(
                              "rounded-full px-1.5 text-[11px] font-semibold leading-5",
                              active ? "bg-white/20 text-white" : "bg-rose-500 text-white"
                            )}
                          >
                            {unviewed}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-4">
        <div className="rounded-xl bg-gradient-to-br from-indigo-600/25 to-violet-600/10 p-4 ring-1 ring-inset ring-white/[0.06]">
          <p className="text-sm font-semibold text-white">Viết bài mới</p>
          <p className="mt-0.5 text-xs text-slate-400">Chia sẻ kiến thức, tăng thứ hạng Google.</p>
          <Link
            href="/bai-viet/tao-moi"
            onClick={onNavigate}
            className="mt-3 inline-flex h-8 items-center justify-center rounded-lg bg-white px-3 text-xs font-semibold text-slate-900 hover:bg-slate-100"
          >
            + Tạo bài viết
          </Link>
        </div>
      </div>
    </div>
  );
}
