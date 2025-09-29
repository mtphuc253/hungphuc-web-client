/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { authService } from "../../lib/auth"
import type { User, LoginRequest } from "../../types"

interface AuthState {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
}

export const loginAsync = createAsyncThunk("auth/login", async (credentials: LoginRequest, { rejectWithValue }) => {
  try {
    const response = await authService.login(credentials)
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || "Đăng nhập thất bại")
  }
})

export const logoutAsync = createAsyncThunk("auth/logout", async (_, { rejectWithValue }) => {
  try {
    await authService.logout()
  } catch (error: any) {
    return rejectWithValue(error.message || "Đăng xuất thất bại")
  }
})

export const refreshTokenAsync = createAsyncThunk("auth/refreshToken", async (_, { rejectWithValue }) => {
  try {
    const response = await authService.refreshToken()
    return response
  } catch (error: any) {
    return rejectWithValue(error.message || "Làm mới token thất bại")
  }
})

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      state.error = null
      // Lưu vào localStorage
      localStorage.setItem("accessToken", action.payload.accessToken)
      localStorage.setItem("user", JSON.stringify(action.payload.user))
    },
    clearCredentials: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.error = null
      // Xóa khỏi localStorage
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
    },
    loadFromStorage: (state) => {
      const token = localStorage.getItem("accessToken")
      const userData = localStorage.getItem("user")

      if (token && userData) {
        try {
          state.accessToken = token
          state.user = JSON.parse(userData)
          state.isAuthenticated = true
        } catch (error) {
          // Nếu parse lỗi thì clear storage
          localStorage.removeItem("accessToken")
          localStorage.removeItem("user")
        }
      }
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload.user
        state.accessToken = action.payload.accessToken
        state.isAuthenticated = true
        state.error = null
        // Lưu vào localStorage
        localStorage.setItem("accessToken", action.payload.accessToken)
        localStorage.setItem("user", JSON.stringify(action.payload.user))
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Logout cases
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        state.error = null
        // Xóa khỏi localStorage
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
      })
      // Refresh token cases
      .addCase(refreshTokenAsync.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken
        state.user = action.payload.user
        state.isAuthenticated = true
        // Cập nhật localStorage
        localStorage.setItem("accessToken", action.payload.accessToken)
        localStorage.setItem("user", JSON.stringify(action.payload.user))
      })
      .addCase(refreshTokenAsync.rejected, (state) => {
        state.user = null
        state.accessToken = null
        state.isAuthenticated = false
        // Xóa khỏi localStorage
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
      })
  },
})

export const { setCredentials, clearCredentials, loadFromStorage, clearError } = authSlice.actions
export default authSlice.reducer
