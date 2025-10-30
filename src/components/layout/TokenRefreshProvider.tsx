// src/components/layout/TokenRefreshProvider.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { updateAccessToken } from '@/store/slices/authSlice';
import { calculateRefreshDelay } from '@/lib/auth';
import axios from 'axios';

export default function TokenRefreshProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = async () => {
    try {
      const response = await axios.post(
        '/api/refresh',
        {},
        {
          withCredentials: true,
        }
      );

      if (response.data.success && response.data.accessToken) {
        // Cập nhật accessToken mới vào Redux
        dispatch(updateAccessToken(response.data.accessToken));
        
        // Schedule refresh tiếp theo
        scheduleRefresh(response.data.accessToken);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Nếu refresh fail, redirect về login
      window.location.href = '/auth/login';
    }
  };

  const scheduleRefresh = (token: string) => {
    // Clear timeout cũ nếu có
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Tính delay (2 phút trước khi token hết hạn)
    const delay = calculateRefreshDelay(token);

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        refreshToken();
      }, delay);
    } else {
      // Nếu token sắp hết hạn hoặc đã hết hạn, refresh ngay
      refreshToken();
    }
  };

  useEffect(() => {
    // Chỉ schedule refresh nếu user đã authenticated và có accessToken
    if (isAuthenticated && accessToken) {
      scheduleRefresh(accessToken);
    }

    // Cleanup timeout khi component unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isAuthenticated, accessToken]);

  return <>{children}</>;
}