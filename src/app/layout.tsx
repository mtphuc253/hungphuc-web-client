// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import StoreProvider from '@/store/StoreProvider';
import TokenRefreshProvider from '@/components/layout/TokenRefreshProvider';
import { Toaster } from '@/components/ui/sonner';

export const metadata: Metadata = {
  title: 'Công ty Hưng Phúc',
  description: 'Công ty TNHH Tư vấn đầu tư Xây dựng Hưng Phúc',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <StoreProvider>
          <TokenRefreshProvider>
            {children}
            <Toaster position="top-right" />
          </TokenRefreshProvider>
        </StoreProvider>
      </body>
    </html>
  );
}