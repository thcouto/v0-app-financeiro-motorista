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
} from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { HistoryFilters } from "./history-filters"

interface HistoryListProps {
  records: any[]
  settings: any
}

function calculateRecordMetrics(record: any, settings: any) {
  const fuelCost = (record.km_driven / settings.fuel_efficiency) * settings.gas_price
  const maintenanceCost = record.km_driven * settings.maintenance_cost_per_km
  const appFees = record.total_rides * settings.app_fee_per_ride
  const carWashDaily = settings.monthly_car_wash / settings.avg_work_days_per_month

  // Calculate payment machine fees
  const debitFee = ((record.received_debit || 0) * (settings.debit_fee_percent || 0)) / 100
  const creditFee = ((record.received_credit || 0) * (settings.credit_fee_percent || 0)) / 100
  const paymentMachineFees = debitFee + creditFee

  const totalOperationalCosts = fuelCost + maintenanceCost + appFees + carWashDaily + paymentMachineFees
  const operationalNetProfit = record.gross_revenue - totalOperationalCosts

  const personalExpenses = record.personal_expenses || 0
  const realProfit = operationalNetProfit - personalExpenses

  return {
    fuelCost,
    maintenanceCost,
    appFees,
    carWashDaily,
    paymentMachineFees,
    totalOperationalCosts,
    operationalNetProfit,
    personalExpenses,
    realProfit,
  }
}

function classifyDay(record: any, settings: any, monthRecords: any[]) {
  const metrics = calculateRecordMetrics(record, settings)
  const profitMargin = (metrics.operationalNetProfit / record.gross_revenue) * 100
  const profitPerKm = metrics.operationalNetProfit / record.km_driven
  const profitPerHour = record.hours_working ? metrics.operationalNetProfit / record.hours_working : null

  // Calculate historical averages
  let avgProfitPerKm = profitPerKm
  let avgProfitPerHour = profitPerHour || 0
  let avgProfitMargin = profitMargin

  if (monthRecords.length > 1) {
    const otherRecords = monthRecords.filter((r) => r.id !== record.id)
    if (otherRecords.length > 0) {
      avgProfitPerKm =
        otherRecords.reduce((sum, r) => {
          const m = calculateRecordMetrics(r, settings)
          return sum + m.operationalNetProfit / r.km_driven
        }, 0) / otherRecords.length

      const recordsWithHours = otherRecords.filter((r) => r.hours_working)
      if (recordsWithHours.length > 0) {
        avgProfitPerHour =
          recordsWithHours.reduce((sum, r) => {
            const m = calculateRecordMetrics(r, settings)
            return sum + m.operationalNetProfit / r.hours_working
          }, 0) / recordsWithHours.length
      }

      avgProfitMargin =
        otherRecords.reduce((sum, r) => {
          const m = calculateRecordMetrics(r, settings)
          return sum + (m.operationalNetProfit / r.gross_revenue) * 100
        }, 0) / otherRecords.length
    }
  }

  // Classification logic
  let classification = "Médio"
  const explanation = []

  // Check profit per km
  if (profitPerKm > avgProfitPerKm * 1.1) {
    explanation.push("Lucro por km acima da média")
  } else if (profitPerKm < avgProfitPerKm * 0.9) {
    explanation.push("Lucro por km abaixo da média")
  }

  // Check profit per hour
  if (profitPerHour && avgProfitPerHour) {
    if (profitPerHour > avgProfitPerHour * 1.1) {
      explanation.push("Produtividade por hora excelente")
    } else if (profitPerHour < avgProfitPerHour * 0.9) {
      explanation.push("Produtividade por hora baixa - muitas horas online sem retorno adequado")
    }
  }

  // Check profit margin
  if (profitMargin > avgProfitMargin * 1.1 || profitMargin >= 40) {
    explanation.push("Margem de lucro excelente")
  } else if (profitMargin < avgProfitMargin * 0.9 || profitMargin < 30) {
    explanation.push("Margem de lucro baixa")
  }

  // Check fuel efficiency
  const fuelCostPercent = (metrics.fuelCost / record.gross_revenue) * 100
  if (fuelCostPercent > 25) {
    explanation.push("Custo de combustível alto - considere ajustar estratégia")
  } else if (fuelCostPercent < 15) {
    explanation.push("Custo de combustível controlado")
  }

  // Final classification
  if (profitMargin >= 40 && profitPerKm > avgProfitPerKm) {
    classification = "Bom"
  } else if (profitMargin < 30 || profitPerKm < avgProfitPerKm * 0.8) {
    classification = "Ruim"
  }

  return {
    classification,
    explanation: explanation.length > 0 ? explanation.join(". ") + "." : "Desempenho dentro da média histórica.",
  }
}

export function HistoryList({ records, settings }: HistoryListProps) {
  const router = useRouter()
  const supabase = createClient()
  const [filter, setFilter] = useState<"day" | "week" | "month" | "all">("all")

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
      <HistoryFilters currentFilter={filter} onFilterChange={setFilter} />

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
            const monthlyGrossRevenue = monthRecords.reduce((sum, r) => sum + Number(r.gross_revenue), 0)
            const monthlyKm = monthRecords.reduce((sum, r) => sum + Number(r.km_driven), 0)

            const monthlyTotals = monthRecords.reduce(
              (acc, r) => {
                const metrics = calculateRecordMetrics(r, settings)
                return {
                  totalCosts: acc.totalCosts + metrics.totalOperationalCosts,
                  operationalProfit: acc.operationalProfit + metrics.operationalNetProfit,
                  personalExpenses: acc.personalExpenses + metrics.personalExpenses,
                  realProfit: acc.realProfit + metrics.realProfit,
                }
              },
              { totalCosts: 0, operationalProfit: 0, personalExpenses: 0, realProfit: 0 },
            )

            return (
              <div key={monthYear} className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <h2 className="text-xl font-bold text-white capitalize">{monthYear}</h2>
                  <div className="flex flex-wrap gap-3 text-sm">
                    <span className="text-slate-400">
                      Faturamento:{" "}
                      <span className="text-green-400 font-semibold">R$ {monthlyGrossRevenue.toFixed(2)}</span>
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
                      KM: <span className="text-blue-400 font-semibold">{monthlyKm.toFixed(1)}</span>
                    </span>
                  </div>
                </div>

                <div className="grid gap-4">
                  {monthRecords.map((record) => {
                    const metrics = calculateRecordMetrics(record, settings)
                    const { classification, explanation } = classifyDay(record, settings, monthRecords)

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
                              <p className="text-lg font-bold text-green-400">R$ {record.gross_revenue.toFixed(2)}</p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Navigation className="h-4 w-4" />
                                <span className="text-xs">Distância • Corridas</span>
                              </div>
                              <p className="text-lg font-bold text-white">
                                {record.km_driven.toFixed(1)} km • {record.total_rides}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Fuel className="h-4 w-4" />
                                <span className="text-xs">Preço Pago ao App</span>
                              </div>
                              <p className="text-lg font-bold text-orange-400">R$ {metrics.appFees.toFixed(2)}</p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <Wallet className="h-4 w-4" />
                                <span className="text-xs">Custo Total</span>
                              </div>
                              <p className="text-lg font-bold text-red-400">
                                R$ {metrics.totalOperationalCosts.toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs">Lucro Líquido Op.</span>
                              </div>
                              <p
                                className={`text-lg font-bold ${metrics.operationalNetProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                              >
                                R$ {metrics.operationalNetProfit.toFixed(2)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <DollarSign className="h-4 w-4" />
                                <span className="text-xs">Gastos Pessoais</span>
                              </div>
                              <p className="text-lg font-bold text-amber-400">
                                R$ {metrics.personalExpenses.toFixed(2)}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-slate-400">
                                <TrendingUp className="h-4 w-4" />
                                <span className="text-xs">Lucro Real</span>
                              </div>
                              <p
                                className={`text-lg font-bold ${metrics.realProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}
                              >
                                R$ {metrics.realProfit.toFixed(2)}
                              </p>
                            </div>

                            {(record.hours_online || record.hours_working) && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 text-slate-400">
                                  <Clock className="h-4 w-4" />
                                  <span className="text-xs">Horas Online • Trabalhadas</span>
                                </div>
                                <p className="text-lg font-bold text-blue-400">
                                  {record.hours_online?.toFixed(1) || "0"}h • {record.hours_working?.toFixed(1) || "0"}h
                                </p>
                              </div>
                            )}
                          </div>

                          <details className="text-xs text-slate-400">
                            <summary className="cursor-pointer hover:text-slate-300">
                              Ver detalhamento de custos
                            </summary>
                            <div className="mt-2 space-y-1 pl-4 border-l-2 border-slate-700">
                              <div className="flex justify-between">
                                <span>Combustível:</span>
                                <span>R$ {metrics.fuelCost.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Manutenção:</span>
                                <span>R$ {metrics.maintenanceCost.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Taxa do App:</span>
                                <span>R$ {metrics.appFees.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Lava-jato (diário):</span>
                                <span>R$ {metrics.carWashDaily.toFixed(2)}</span>
                              </div>
                              {metrics.paymentMachineFees > 0 && (
                                <div className="flex justify-between">
                                  <span>Taxas Maquininha:</span>
                                  <span>R$ {metrics.paymentMachineFees.toFixed(2)}</span>
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
