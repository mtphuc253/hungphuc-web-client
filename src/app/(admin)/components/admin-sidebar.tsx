"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ADMIN_NAV_ITEMS } from "@/lib/constants";
import { LogOut } from "lucide-react";
import clsx from "clsx";
import { useAppDispatch } from "@/store/hooks";
import axios from "axios";
import { toast } from "sonner";
import { logout } from "@/store/slices/authSlice";
import Image from "next/image";

export function AdminSidebar() {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post("/api/logout", {}, { withCredentials: true });
      dispatch(logout());
      toast.success("Đăng xuất thành công!");
      router.push("/auth/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Đã có lỗi xảy ra khi đăng xuất!");
    }
  };

  return (
    <aside className="sticky top-0 h-screen w-64 flex-shrink-0 bg-foreground text-slate-200 flex flex-col">

      {/* Company Logo */}
      <div className="flex items-center justify-center h-24 border-b border-slate-800 px-4">
        <div className="bg-white p-0 rounded-xl shadow-md inline-block">
          <Image
            src="https://res.cloudinary.com/dizk1uwv3/image/upload/v1758561417/Hungphuc/logo-hung-phuc-ngang.png"
            alt="HUNG PHUC Logo"
            width={120}
            height={80}
            priority
            style={{ width: "auto", height: "auto" }}
            className="block max-w-full h-auto"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-grow p-4">
        <ul className="space-y-2">
          {ADMIN_NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 ease-in-out transform hover:-translate-y-0.5",
                  {
                    "bg-blue-600 text-white shadow-lg": pathname === item.href,
                    "text-slate-400 hover:bg-slate-800 hover:text-white":
                      pathname !== item.href,
                  }
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 mt-auto">
        <Button
          onClick={handleLogout}
          variant="destructive"
          className="w-full group flex items-center gap-3 px-4 py-3 rounded-md bg-red-600/80 text-white font-semibold shadow-md hover:bg-red-600 hover:shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
        >
          <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:rotate-[-15deg]" />
          <span>Đăng xuất</span>
        </Button>
      </div>
    </aside>
  );
}
