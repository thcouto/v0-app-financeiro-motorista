"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DollarSign,
  Navigation,
  TrendingUp,
  Calendar,
  Edit,
  Trash2,
  Clock,
  Fuel,
  Wallet,
  AlertCircle,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { HistoryFilters } from "./history-filters"

interface HistoryListProps {
  records: any[]
}

export function HistoryList({ records }: HistoryListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [filter, setFilter] = useState<"day" | "week" | "month" | "all" | "custom">("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  const filteredRecords = records.filter((record) => {
    const recordDate = new Date(record.record_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (filter === "day") {
      const recordDay = new Date(recordDate)
      recordDay.setHours(0, 0, 0, 0)
      return recordDay.getTime() === today.getTime()
    } else if (filter === "week") {
      const weekAgo = new Date(today)
      weekAgo.setDate(today.getDate() - 7)
      return recordDate >= weekAgo
    } else if (filter === "month") {
      return recordDate.getMonth() === today.getMonth() && recordDate.getFullYear() === today.getFullYear()
    } else if (filter === "custom") {
      if (!startDate || !endDate) return true
      const start = new Date(startDate)
      const end = new Date(endDate)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      return recordDate >= start && recordDate <= end
    }
    return true
  })

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

  const handleDateRangeChange = (start: string, end: string) => {
    setStartDate(start)
    setEndDate(end)
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

  const recordsByMonth = filteredRecords.reduce(
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
    <div className="space-y-6">
      <HistoryFilters
        currentFilter={filter}
        onFilterChange={setFilter}
        startDate={startDate}
        endDate={endDate}
        onDateRangeChange={handleDateRangeChange}
      />

      {filteredRecords.length === 0 ? (
        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-slate-400">Nenhum registro encontrado para o período selecionado</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(recordsByMonth).map(([monthYear, monthRecords]) => {
            const monthlyTotals = monthRecords.reduce(
              (acc, r) => {
                return {
                  grossRevenue: acc.grossRevenue + (Number(r.gross_revenue) || 0),
                  totalCosts: acc.totalCosts + (Number(r.total_operational_costs) || 0),
                  operationalProfit: acc.operationalProfit + (Number(r.operational_profit) || 0),
                  personalExpenses: acc.personalExpenses + (Number(r.personal_expenses) || 0),
                  realProfit: acc.realProfit + (Number(r.net_profit) || 0),
                  km: acc.km + (Number(r.km_driven) || 0),
                }
              },
              { grossRevenue: 0, totalCosts: 0, operationalProfit: 0, personalExpenses: 0, realProfit: 0, km: 0 },
            )

            return (
              <div key={monthYear} className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-white capitalize">{monthYear}</h2>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="text-slate-400">
                      Faturamento:{" "}
                      <span className="text-green-400 font-semibold">R$ {monthlyTotals.grossRevenue.toFixed(2)}</span>
                    </span>
                    <span className="text-slate-400">
                      Custos:{" "}
                      <span className="text-red-400 font-semibold">R$ {monthlyTotals.totalCosts.toFixed(2)}</span>
                    </span>
                    <span className="text-slate-400">
                      Lucro Op.:{" "}
                      <span
                        className={`font-semibold ${monthlyTotals.operationalProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        R$ {monthlyTotals.operationalProfit.toFixed(2)}
                      </span>
                    </span>
                    <span className="text-slate-400">
                      Lucro Real:{" "}
                      <span
                        className={`font-semibold ${monthlyTotals.realProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        R$ {monthlyTotals.realProfit.toFixed(2)}
                      </span>
                    </span>
                    <span className="text-slate-400">
                      KM: <span className="text-blue-400 font-semibold">{monthlyTotals.km.toFixed(1)}</span>
                    </span>
                  </div>
                </div>

                <div className="grid gap-4">
                  {monthRecords.map((record) => {
                    const operationalProfit = Number(record.operational_profit) || 0
                    const netProfit = Number(record.net_profit) || 0
                    const totalCosts = Number(record.total_operational_costs) || 0

                    // Simple classification based on stored values
                    const profitMargin = record.gross_revenue > 0 ? (operationalProfit / record.gross_revenue) * 100 : 0
                    const profitPerKm = record.km_driven > 0 ? operationalProfit / record.km_driven : 0

                    let classification = "Médio"
                    let explanation = "Desempenho dentro da média."

                    if (profitMargin >= 40 && profitPerKm > 3) {
                      classification = "Bom"
                      explanation = "Excelente margem de lucro e rentabilidade por km rodado."
                    } else if (profitMargin < 30 || profitPerKm < 2) {
                      classification = "Ruim"
                      explanation = "Margem de lucro baixa. Considere revisar estratégia ou custos."
                    }

                    const classificationColors = {
                      Bom: { badge: "bg-green-500/20 text-green-400 border-green-500/50", icon: "text-green-400" },
                      Médio: {
                        badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
                        icon: "text-yellow-400",
                      },
                      Ruim: { badge: "bg-red-500/20 text-red-400 border-red-500/50", icon: "text-red-400" },
                    }

                    const colors = classificationColors[classification as keyof typeof classificationColors]

                    return (
                      <Card key={record.id} className="border-slate-700 bg-slate-800/50 backdrop-blur">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Calendar className="h-5 w-5 text-slate-400" />
                              <div>
                                <span className="text-lg font-semibold text-white block">
                                  {new Date(record.record_date).toLocaleDateString("pt-BR", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                  })}
                                </span>
                                <Badge variant="outline" className={`${colors.badge} mt-1`}>
                                  {classification}
                                </Badge>
                              </div>
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

                          <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                            <div className="flex items-start gap-2">
                              <AlertCircle className={`h-4 w-4 ${colors.icon} mt-0.5 flex-shrink-0`} />
                              <p className="text-sm text-slate-300">{explanation}</p>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs">Faturamento Bruto</span>
                              </div>
                              <p className="text-lg font-bold text-green-400">
                                R$ {Number(record.gross_revenue).toFixed(2)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Navigation className="h-4 w-4" />
                                <span className="text-xs">Distância • Corridas</span>
                              </div>
                              <p className="text-lg font-bold text-white">
                                {Number(record.km_driven).toFixed(1)} km • {record.total_rides}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Fuel className="h-4 w-4" />
                                <span className="text-xs">Taxas do App</span>
                              </div>
                              <p className="text-lg font-bold text-orange-400">
                                R$ {Number(record.app_fees || 0).toFixed(2)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Wallet className="h-4 w-4" />
                                <span className="text-xs">Custo Total</span>
                              </div>
                              <p className="text-lg font-bold text-red-400">R$ {totalCosts.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs">Lucro Líquido Op.</span>
                              </div>
                              <p
                                className={`text-lg font-bold ${operationalProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                              >
                                R$ {operationalProfit.toFixed(2)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs">Gastos Pessoais</span>
                              </div>
                              <p className="text-lg font-bold text-amber-400">
                                R$ {Number(record.personal_expenses || 0).toFixed(2)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs">Lucro Real</span>
                              </div>
                              <p
                                className={`text-lg font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}
                              >
                                R$ {netProfit.toFixed(2)}
                              </p>
                            </div>

                            {(record.hours_online || record.hours_working) && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Clock className="h-4 w-4" />
                                  <span className="text-xs">Horas Online • Trabalhadas</span>
                                </div>
                                <p className="text-lg font-bold text-blue-400">
                                  {Number(record.hours_online || 0).toFixed(1)}h •{" "}
                                  {Number(record.hours_working || 0).toFixed(1)}h
                                </p>
                              </div>
                            )}
                          </div>

                          <details className="text-xs text-slate-400">
                            <summary className="cursor-pointer hover:text-slate-300">
                              Ver detalhamento de custos e configuração
                            </summary>
                            <div className="mt-2 space-y-3">
                              <div className="space-y-1 pl-4 border-l-2 border-slate-700">
                                <h4 className="text-slate-300 font-semibold mb-1">Custos Operacionais:</h4>
                                <div className="flex justify-between">
                                  <span>Combustível:</span>
                                  <span>R$ {Number(record.fuel_cost || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Manutenção:</span>
                                  <span>R$ {Number(record.maintenance_cost || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Taxa do App:</span>
                                  <span>R$ {Number(record.app_fees || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Lava-jato (diário):</span>
                                  <span>R$ {Number(record.car_wash_cost || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Taxa débito:</span>
                                  <span>R$ {Number(record.debit_fee || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Taxa crédito:</span>
                                  <span>R$ {Number(record.credit_fee || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>IPVA (diário):</span>
                                  <span>R$ {Number(record.daily_ipva_cost || 0).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Seguro (diário):</span>
                                  <span>R$ {Number(record.daily_insurance_cost || 0).toFixed(2)}</span>
                                </div>
                              </div>

                              {record.config_version_id && (
                                <div className="pl-4 border-l-2 border-emerald-700/50">
                                  <div className="flex items-center gap-2 text-emerald-400/70">
                                    <Settings className="h-3 w-3" />
                                    <span className="text-xs">
                                      Este registro usou a configuração válida na data e não será alterado por mudanças
                                      futuras.
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </details>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
