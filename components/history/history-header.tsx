"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function HistoryHeader() {
  return (
    <header className="border-b border-slate-700 bg-slate-800/50 backdrop-blur">
      <div className="container mx-auto flex items-center gap-4 p-4">
        <Button asChild variant="ghost" size="icon" className="text-slate-300 hover:text-white">
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Histórico</h1>
          <p className="text-sm text-slate-400">Todos os seus registros diários</p>
        </div>
      </div>
    </header>
  )
}
