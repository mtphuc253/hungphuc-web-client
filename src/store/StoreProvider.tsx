// src/store/StoreProvider.tsx
'use client';

import { useRef } from 'react';
import { Provider } from 'react-redux';
import { makeStore, AppStore } from './index';
import { injectStore } from '@/lib/axiosClient';

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const storeRef = useRef<AppStore>(undefined);
  if (!storeRef.current) {
    storeRef.current = makeStore();
    injectStore(storeRef.current);
  }

  return <Provider store={storeRef.current}>{children}</Provider>;
}