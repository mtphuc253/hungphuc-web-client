import axiosClient from "./axiosClient"
import type { LoginRequest, LoginResponse, RefreshResponse, LogoutResponse, User } from "@/types"

export const authService = {
  async login(credentials: LoginRequest): Promise<{ user: User; accessToken: string }> {
    const response = await axiosClient.post<LoginResponse>("/api/auth/login", credentials)

    if (response.data.success) {
      const { id, name, email, role, accessToken } = response.data.data

      return {
        user: { id, name, email, role },
        accessToken,
      }
    }

    throw new Error(response.data.message || "Đăng nhập thất bại")
  },

  async logout(): Promise<void> {
    try {
      await axiosClient.post<LogoutResponse>("/api/auth/logout")
    } catch (error) {
      // Vẫn logout local state ngay cả khi API call thất bại
      console.warn("Logout API call failed, but clearing local state")
    }
  },

  async refreshToken(): Promise<{ user: User; accessToken: string }> {
    const response = await axiosClient.get<RefreshResponse>("/api/auth/refresh")

    if (response.data.success) {
      return {
        user: response.data.data.user,
        accessToken: response.data.data.accessToken,
      }
    }

    throw new Error(response.data.message || "Làm mới token thất bại")
  },

  getCurrentUser(): User | null {
    console.warn("getCurrentUser is deprecated. Use Redux selector instead.")
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user")
      return userData ? JSON.parse(userData) : null
    }
    return null
  },

  isAuthenticated(): boolean {
    console.warn("isAuthenticated is deprecated. Use Redux selector instead.")
    return this.getCurrentUser() !== null
  },
}

export type { LoginRequest, LoginResponse, RefreshResponse, LogoutResponse, User }
