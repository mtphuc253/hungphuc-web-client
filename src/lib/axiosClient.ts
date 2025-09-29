import axios, { type AxiosInstance, type AxiosResponse } from "axios";
import { refreshTokenAsync, clearCredentials } from "@/store/slices/authSlice";
import type { EnhancedStore } from "@reduxjs/toolkit";

const BASE_URL = "http://localhost:8017";

// Create axios instance
const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupAxiosInterceptors = (store: EnhancedStore) => {
  axiosClient.interceptors.request.use(
    (config) => {
      const state = store.getState() as any; // Use any to avoid type issues with RootState
      const accessToken = state.auth.accessToken;

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axiosClient.interceptors.response.use(
    (response: AxiosResponse) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const result: any = await store.dispatch(refreshTokenAsync());

          if (refreshTokenAsync.fulfilled.match(result)) {
            const newAccessToken = result.payload.accessToken;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          store.dispatch(clearCredentials());
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default axiosClient;
export const apiCall = axiosClient;

export const setAccessToken = (token: string | null) => {
  console.warn("setAccessToken is deprecated. Use Redux actions instead.");
};

export const getAccessToken = () => {
  console.warn("getAccessToken is deprecated. Use Redux selector instead. This function will not work correctly after the refactor.");
  return null;
};
