import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"
import { AppStore } from "@/store"
import { updateAccessToken } from "@/store/slices/authSlice"

let store: AppStore

export const injectStore = (_store: AppStore) => {
  store = _store
}

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Quan trọng: gửi cookie tự động
})

axiosClient.interceptors.request.use(
  (config) => {
    if (!store) {
      // This case should ideally not happen if StoreProvider is set up correctly
      console.warn("Redux store has not been injected into axiosClient.")
      return config
    }
    const state = store.getState()
    const accessToken = state.auth.accessToken

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve()
    }
  })
  failedQueue = []
}

// Response interceptor để xử lý refresh token
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean
    }

    // Nếu lỗi 401 và chưa retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, đẩy request vào queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(() => {
            return axiosClient(originalRequest)
          })
          .catch((err) => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Gọi API refresh
        const response = await axios.post(
          "/api/refresh",
          {},
          {
            withCredentials: true,
          },
        )

        const newAccessToken = response.data.accessToken
        if (response.data.success && newAccessToken) {
          // Cập nhật accessToken mới vào Redux store
          store.dispatch(updateAccessToken(newAccessToken))

          // Xử lý các request đang chờ
          processQueue()

          // Retry request gốc với token mới (đã được thêm vào header bởi request interceptor)
          return axiosClient(originalRequest)
        } else {
          throw new Error("Refresh token failed")
        }
      } catch (refreshError) {
        // Refresh thất bại, xử lý queue và logout
        processQueue(refreshError as Error)
        // Có thể dispatch logout action ở đây nếu cần
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login"
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default axiosClient