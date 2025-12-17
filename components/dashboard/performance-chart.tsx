"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { useMemo } from "react"

interface PerformanceChartProps {
  trips: any[]
  expenses: any[]
}

export function PerformanceChart({ trips, expenses }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    const dailyData: Record<string, { date: string; faturamento: number; despesas: number; lucro: number }> = {}

    trips.forEach((trip) => {
      const date = new Date(trip.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      if (!dailyData[date]) {
        dailyData[date] = { date, faturamento: 0, despesas: 0, lucro: 0 }
      }
      dailyData[date].faturamento += Number(trip.earnings)
    })

    expenses.forEach((expense) => {
      const date = new Date(expense.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
      if (!dailyData[date]) {
        dailyData[date] = { date, faturamento: 0, despesas: 0, lucro: 0 }
      }
      dailyData[date].despesas += Number(expense.amount)
    })

    Object.values(dailyData).forEach((day) => {
      day.lucro = day.faturamento - day.despesas
    })

    return Object.values(dailyData).sort((a, b) => {
      const [dayA, monthA] = a.date.split("/").map(Number)
      const [dayB, monthB] = b.date.split("/").map(Number)
      return monthA !== monthB ? monthA - monthB : dayA - dayB
    })
  }, [trips, expenses])

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Desempenho Diário</CardTitle>
        <CardDescription className="text-slate-400">Faturamento, despesas e lucro por dia</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
            <XAxis dataKey="date" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #475569",
                borderRadius: "6px",
                color: "#fff",
              }}
              formatter={(value: number) =>
                new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)
              }
            />
            <Legend wrapperStyle={{ color: "#94a3b8" }} />
            <Bar dataKey="faturamento" fill="#10b981" name="Faturamento" />
            <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
            <Bar dataKey="lucro" fill="#3b82f6" name="Lucro" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
