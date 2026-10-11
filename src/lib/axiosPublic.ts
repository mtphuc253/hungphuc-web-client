import axios from 'axios';

const axiosPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  // Backend (Render free) có thể "ngủ" ~1 phút: không để trang/bản build treo vô hạn
  timeout: 20000,
  // withCredentials: true,
});

export default axiosPublic;
