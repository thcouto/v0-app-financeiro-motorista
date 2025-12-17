"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DollarSign, Navigation, TrendingUp, Calendar, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface HistoryListProps {
  records: any[]
  settings: any
}

export function HistoryList({ records, settings }: HistoryListProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async (recordId: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) {
      return
    }

    const { error } = await supabase.from("daily_records").delete().eq("id", recordId)

    if (error) {
      alert("Erro ao excluir registro: " + error.message)
      return
    }

    router.refresh()
  }

  if (records.length === 0) {
    return (
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardContent className="py-12">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Nenhum registro encontrado</p>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
              <Link href="/record">Criar Primeiro Registro</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Group records by month
  const recordsByMonth = records.reduce(
    (acc, record) => {
      const date = new Date(record.record_date)
      const monthYear = date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
      if (!acc[monthYear]) {
        acc[monthYear] = []
      }
      acc[monthYear].push(record)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <div className="space-y-8">
      {Object.entries(recordsByMonth).map(([monthYear, monthRecords]) => {
        // Calculate monthly totals
        const monthlyGrossRevenue = monthRecords.reduce((sum, r) => sum + Number(r.gross_revenue), 0)
        const monthlyKm = monthRecords.reduce((sum, r) => sum + Number(r.km_driven), 0)

        const monthlyNetProfit = monthRecords.reduce((sum, r) => {
          const fuelCost = (Number(r.km_driven) / settings.fuel_efficiency) * settings.gas_price
          const maintenanceCost = Number(r.km_driven) * settings.maintenance_cost_per_km
          const appFees = Number(r.total_rides) * settings.app_fee_per_ride
          const carWashDaily = settings.monthly_car_wash / settings.avg_work_days_per_month
          const totalCosts = fuelCost + maintenanceCost + appFees + carWashDaily + (Number(r.personal_expenses) || 0)
          return sum + (Number(r.gross_revenue) - totalCosts)
        }, 0)

        return (
          <div key={monthYear} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white capitalize">{monthYear}</h2>
              <div className="flex gap-4 text-sm">
                <span className="text-slate-400">
                  Total: <span className="text-green-400 font-semibold">R$ {monthlyGrossRevenue.toFixed(2)}</span>
                </span>
                <span className="text-slate-400">
                  Lucro:{" "}
                  <span className={`font-semibold ${monthlyNetProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    R$ {monthlyNetProfit.toFixed(2)}
                  </span>
                </span>
                <span className="text-slate-400">
                  KM: <span className="text-blue-400 font-semibold">{monthlyKm.toFixed(1)}</span>
                </span>
              </div>
            </div>

            <div className="grid gap-4">
              {monthRecords.map((record) => {
                const fuelCost = (record.km_driven / settings.fuel_efficiency) * settings.gas_price
                const maintenanceCost = record.km_driven * settings.maintenance_cost_per_km
                const appFees = record.total_rides * settings.app_fee_per_ride
                const carWashDaily = settings.monthly_car_wash / settings.avg_work_days_per_month
                const totalCosts = fuelCost + maintenanceCost + appFees + carWashDaily + (record.personal_expenses || 0)
                const netProfit = record.gross_revenue - totalCosts

                return (
                  <Card key={record.id} className="border-slate-700 bg-slate-800/50 backdrop-blur">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-slate-400" />
                          <span className="text-lg font-semibold text-white">
                            {new Date(record.record_date).toLocaleDateString("pt-BR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            asChild
                            variant="ghost"
                            size="icon"
                            className="text-slate-400 hover:text-white hover:bg-slate-700"
                          >
                            <Link href={`/record?date=${record.record_date}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(record.id)}
                            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-sm">Faturamento</span>
                          </div>
                          <p className="text-xl font-bold text-green-400">R$ {record.gross_revenue.toFixed(2)}</p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">Lucro Líquido</span>
                          </div>
                          <p className={`text-xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                            R$ {netProfit.toFixed(2)}
                          </p>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Navigation className="h-4 w-4" />
                            <span className="text-sm">Distância</span>
                          </div>
                          <p className="text-xl font-bold text-white">
                            {record.km_driven.toFixed(1)} km • {record.total_rides} corridas
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
