"use client";

import { useEffect } from "react";
import { captureAttribution } from "@/lib/attribution";

/** Ghi nhận nguồn truy cập (UTM, referrer) ngay khi khách vào website */
export function AttributionTracker() {
  useEffect(() => {
    captureAttribution();
  }, []);
  return null;
}
