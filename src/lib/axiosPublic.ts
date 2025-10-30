// lib/axiosPublic.ts
import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const axiosPublic = axios.create({
  baseURL: typeof window === "undefined" ? BASE_URL : "",
  // server dùng BASE_URL tuyệt đối, client để trống dùng relative path
});

export default axiosPublic;
