"use client";

import type React from "react"
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store";
import { fetchSettings } from "@/store/slices/settingsSlice";
import { Header } from "@/components/layout/header"
import { Ticker } from "@/components/layout/ticker";
import { Bai_Jamjuree } from "next/font/google"
import { cn } from "@/lib/utils"
import { Footer } from "@/components/layout/footer";
import { Toaster } from "@/components/ui/sonner";
import { Masthead } from "@/components/layout/masthead";
import { FloatingContactButtons } from '@/components/layout/FloatingContactButtons';

const baiJamjuree = Bai_Jamjuree({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-bai-jamjuree",
})

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  return (
    <div className={cn("min-h-screen bg-background font-sans antialiased", baiJamjuree.variable)}>
      <Masthead />
      <div className="sticky top-0 z-50">
        <Header />
        <Ticker />
      </div>
      <main>{children}</main>
      <Footer />
      <Toaster />
      <FloatingContactButtons />
    </div>
  )
}
