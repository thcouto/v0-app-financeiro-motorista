"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/login")
  }

  const initials = user.email?.charAt(0).toUpperCase() || "U"

  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden text-slate-300">
            <Menu className="h-5 w-5" />
          </Button>
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold text-white">FinMotorista</h1>
          </Link>
        </div>

        <nav className="hidden lg:flex items-center gap-6">
          <Link href="/dashboard" className="text-slate-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/record" className="text-slate-300 hover:text-white transition-colors">
            Registrar
          </Link>
          <Link href="/history" className="text-slate-300 hover:text-white transition-colors">
            Histórico
          </Link>
          <Link href="/setup" className="text-slate-300 hover:text-white transition-colors">
            Configurações
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-white">{user.email}</p>
          </div>
          <Avatar className="bg-blue-600">
            <AvatarFallback className="bg-blue-600 text-white">{initials}</AvatarFallback>
          </Avatar>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-slate-300 hover:text-white hover:bg-slate-700"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
