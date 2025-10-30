"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { User, Lock, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useAppDispatch } from "@/store/hooks"
import { setCredentials } from "@/store/slices/authSlice"
import { toast } from "sonner"
import axios from "axios"

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Gọi Next.js internal API route
      const response = await axios.post('/api/login', {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // Lưu user và accessToken vào Redux
        dispatch(
          setCredentials({
            user: response.data.user,
            accessToken: response.data.accessToken,
          })
        );

        // Hiển thị thông báo thành công
        toast.success(response.data.message || 'Đăng nhập thành công!');

        // Chuyển hướng đến trang admin
        router.push('/thong-ke');
      } else {
        toast.error(response.data.message || 'Đăng nhập thất bại!');
      }
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMessage =
        error.response?.data?.message || 'Đã có lỗi xảy ra khi đăng nhập!';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in-up">
      <div className="flex justify-center mb-12">
        <div className="relative px-8 py-4 rounded-2xl bg-white/50 backdrop-blur-md border border-white/20 shadow-2xl">
          <Image
            src="https://res.cloudinary.com/dizk1uwv3/image/upload/v1758561417/Hungphuc/logo-hung-phuc-ngang.png"
            width={800}
            height={200}
            priority
            alt="Hưng Phúc Logo"
            className="h-16 w-auto object-contain transition-transform duration-300 hover:scale-105"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="relative group">
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            required
            disabled={isLoading}
            className="h-14 pl-4 pr-12 text-base bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-white/70 focus:bg-white/25 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-300 shadow-lg"
          />
          <User className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 group-focus-within:text-white transition-colors" />
        </div>

        <div className="relative group">
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            disabled={isLoading}
            required
            className="h-14 pl-4 pr-12 text-base bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-white/70 focus:bg-white/25 focus:border-white/50 focus:ring-2 focus:ring-white/30 transition-all duration-300 shadow-lg"
          />
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/70 group-focus-within:text-white transition-colors" />
        </div>

        {/* {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-900/50 p-3 rounded-lg border border-red-400/50">
            <AlertCircle className="h-5 w-5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )} */}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-14 text-base font-semibold bg-slate-800/80 backdrop-blur-sm text-white hover:bg-slate-700/80 hover:shadow-xl hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none border border-white/10"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Đang xử lý...
            </span>
          ) : (
            "Đăng Nhập"
          )}
        </Button>
      </form>
    </div>
  )
}
