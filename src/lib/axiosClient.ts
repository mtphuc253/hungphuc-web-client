import type { AppDispatch, RootState } from "@/store";
import type { AxiosInstance, AxiosResponse } from "axios";
import axios from "axios";
import { refreshTokenAsync, clearCredentials } from "@/store/slices/authSlice";

// Create axios instance
const BASE_URL = "https://hungphuc-web-server-production.up.railway.app/";

const axiosClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setupAxiosInterceptors = (store: { dispatch: AppDispatch; getState: () => RootState }) => {
  axiosClient.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const accessToken = state.auth.accessToken;

      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosClient.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const result = await store.dispatch(refreshTokenAsync());

          if (refreshTokenAsync.fulfilled.match(result)) {
            const newAccessToken = result.payload.accessToken;
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return axiosClient(originalRequest);
          }
        } catch (refreshError) {
          store.dispatch(clearCredentials());
          if (typeof window !== "undefined") window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

export default axiosClient;
