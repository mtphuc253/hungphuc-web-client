import axios from 'axios';

const axiosPublic = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
  // withCredentials: true,
});

export default axiosPublic;
