"use client"

import { useSelector } from "react-redux"
import type { RootState } from "@/store"
import { Phone, Mail } from "lucide-react"

export function FloatingContactButtons() {
  const { settings } = useSelector((state: RootState) => state.settings)

  if (!settings.phone && !settings.email) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-center gap-4">
      {settings.phone && (
        <a
          href={`tel:${settings.phone}`}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-blue-500/50 hover:from-blue-400 hover:to-blue-500"
          aria-label={`Call ${settings.phone}`}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-sm"></div>
          <div className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-20"></div>
          <Phone className="relative z-10 h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-bounce shadow-lg">
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping"></div>
          </div>
        </a>
      )}
      {settings.email && (
        <a
          href={`mailto:${settings.email}`}
          className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-2xl transition-all duration-500 hover:scale-110 hover:shadow-emerald-500/50 hover:from-emerald-400 hover:to-emerald-500"
          aria-label={`Email ${settings.email}`}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 blur-sm"></div>
          <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20"></div>
          <Mail className="relative z-10 h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
          <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 animate-bounce shadow-lg">
            <div className="absolute inset-0 rounded-full bg-red-400 animate-ping"></div>
          </div>
        </a>
      )}
    </div>
  )
}
