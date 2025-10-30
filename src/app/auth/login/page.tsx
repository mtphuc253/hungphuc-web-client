import Image from "next/image"
import { LoginForm } from "./components/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src="https://res.cloudinary.com/dizk1uwv3/image/upload/v1759072664/Hungphuc/cong-trinh-hoang-hon.jpg"
          alt="Construction site background"
          fill
          priority
          className="object-cover scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/85 via-slate-800/75 to-slate-900/90" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <LoginForm />
      </div>
    </div>
  )
}
