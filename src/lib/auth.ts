import { jwtDecode } from 'jwt-decode';

interface JWTPayload {
  id: string;
  iat: number;
  exp: number;
}

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
};

export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return true;

  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

export const getTokenExpiryTime = (token: string): number | null => {
  const decoded = decodeToken(token);
  return decoded ? decoded.exp * 1000 : null;
};

// Tính thời gian delay để refresh token (2 phút trước khi hết hạn cho testing)
export const calculateRefreshDelay = (token: string): number => {
  const expiryTime = getTokenExpiryTime(token);
  if (!expiryTime) return 0;

  const now = Date.now();
  const timeUntilExpiry = expiryTime - now;
  
  // Refresh 2 phút trước khi hết hạn (120000ms)
  // Nếu thời gian còn lại < 2 phút, refresh ngay
  const refreshOffset = 120000; // 2 phút
  const delay = timeUntilExpiry - refreshOffset;

  return delay > 0 ? delay : 0;
};