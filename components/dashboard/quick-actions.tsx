"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, TrendingUp, Target } from "lucide-react"
import Link from "next/link"

interface QuickActionsProps {
  hasRecordToday: boolean
}

export function QuickActions({ hasRecordToday }: QuickActionsProps) {
  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Ações Rápidas</CardTitle>
        <CardDescription className="text-slate-400">Acesso rápido às principais funcionalidades</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button asChild className="w-full bg-green-600 hover:bg-green-700 text-white justify-start">
          <Link href="/record">
            <Plus className="h-4 w-4 mr-2" />
            {hasRecordToday ? "Editar Registro de Hoje" : "Registrar Dia"}
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full border-slate-600 text-slate-200 hover:bg-slate-700 justify-start bg-transparent"
        >
          <Link href="/history">
            <TrendingUp className="h-4 w-4 mr-2" />
            Ver Histórico Completo
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          className="w-full border-slate-600 text-slate-200 hover:bg-slate-700 justify-start bg-transparent"
        >
          <Link href="/setup">
            <Target className="h-4 w-4 mr-2" />
            Ajustar Configurações
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
