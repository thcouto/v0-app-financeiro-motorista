"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Navigation, TrendingUp, Clock, Wallet, Calendar } from "lucide-react"
import { classifyDayPerformance } from "@/lib/utils/classification"

interface WeeklyReportModalProps {
  isOpen: boolean
  onClose: () => void
  records: any[]
}

export function WeeklyReportModal({ isOpen, onClose, records }: WeeklyReportModalProps) {
  const [weekStart, setWeekStart] = useState("")

  const getWeekEnd = (startDate: string) => {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return end.toISOString().split("T")[0]
  }

  const getWeekRecords = () => {
    if (!weekStart) return []

    const start = new Date(weekStart)
    start.setHours(0, 0, 0, 0)
    const end = new Date(getWeekEnd(weekStart))
    end.setHours(23, 59, 59, 999)

    return records.filter((record) => {
      const recordDate = new Date(record.record_date)
      return recordDate >= start && recordDate <= end
    })
  }

  const weekRecords = getWeekRecords()

  const weekTotals = weekRecords.reduce(
    (acc, r) => ({
      grossRevenue: acc.grossRevenue + (Number(r.gross_revenue) || 0),
      totalCosts: acc.totalCosts + (Number(r.total_operational_costs) || 0),
      operationalProfit: acc.operationalProfit + (Number(r.operational_profit) || 0),
      personalExpenses: acc.personalExpenses + (Number(r.personal_expenses) || 0),
      realProfit: acc.realProfit + (Number(r.net_profit) || 0),
      km: acc.km + (Number(r.km_driven) || 0),
      hoursOnline: acc.hoursOnline + (Number(r.hours_online) || 0),
      hoursWorking: acc.hoursWorking + (Number(r.hours_working) || 0),
    }),
    {
      grossRevenue: 0,
      totalCosts: 0,
      operationalProfit: 0,
      personalExpenses: 0,
      realProfit: 0,
      km: 0,
      hoursOnline: 0,
      hoursWorking: 0,
    },
  )

  const weekClassification =
    weekRecords.length > 0
      ? (() => {
          const avgRecord = {
            operational_profit: weekTotals.operationalProfit / weekRecords.length,
            gross_revenue: weekTotals.grossRevenue / weekRecords.length,
            km_driven: weekTotals.km / weekRecords.length,
          }
          return classifyDayPerformance(avgRecord, records)
        })()
      : null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Relatório Semanal</DialogTitle>
          <DialogDescription className="text-slate-400">
            Selecione a segunda-feira para ver o consolidado da semana (segunda a domingo)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="week_start" className="text-slate-200">
              Segunda-feira da semana
            </Label>
            <Input
              id="week_start"
              type="date"
              value={weekStart}
              onChange={(e) => setWeekStart(e.target.value)}
              className="bg-slate-800 border-slate-700 text-white"
            />
            {weekStart && (
              <p className="text-xs text-slate-500">
                Período: {new Date(weekStart).toLocaleDateString("pt-BR")} a{" "}
                {new Date(getWeekEnd(weekStart)).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>

          {weekStart && weekRecords.length === 0 && (
            <Card className="border-slate-700 bg-slate-800/50">
              <CardContent className="py-8">
                <p className="text-center text-slate-400">Nenhum registro encontrado para esta semana</p>
              </CardContent>
            </Card>
          )}

          {weekRecords.length > 0 && (
            <div className="space-y-4">
              <Card className="border-slate-700 bg-slate-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-emerald-400" />
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Semana de{" "}
                          {new Date(weekStart).toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                        </h3>
                        <p className="text-sm text-slate-400">{weekRecords.length} dias registrados</p>
                      </div>
                    </div>
                    {weekClassification && (
                      <Badge variant="outline" className={weekClassification.colors.badge}>
                        {weekClassification.classification}
                      </Badge>
                    )}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2 mb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <DollarSign className="h-4 w-4" />
                        <span className="text-sm">Faturamento Bruto Total</span>
                      </div>
                      <p className="text-2xl font-bold text-green-400">R$ {weekTotals.grossRevenue.toFixed(2)}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Wallet className="h-4 w-4" />
                        <span className="text-sm">Custos Totais</span>
                      </div>
                      <p className="text-2xl font-bold text-red-400">R$ {weekTotals.totalCosts.toFixed(2)}</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Lucro Operacional</span>
                      </div>
                      <p
                        className={`text-2xl font-bold ${weekTotals.operationalProfit >= 0 ? "text-green-400" : "text-red-400"}`}
                      >
                        R$ {weekTotals.operationalProfit.toFixed(2)}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm">Lucro Real</span>
                      </div>
                      <p
                        className={`text-2xl font-bold ${weekTotals.realProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        R$ {weekTotals.realProfit.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3 pt-4 border-t border-slate-700">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Navigation className="h-4 w-4" />
                        <span className="text-sm">KM Rodados</span>
                      </div>
                      <p className="text-lg font-bold text-blue-400">{weekTotals.km.toFixed(1)} km</p>
                    </div>

                    {weekTotals.hoursOnline > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Horas Online</span>
                        </div>
                        <p className="text-lg font-bold text-purple-400">{weekTotals.hoursOnline.toFixed(1)}h</p>
                      </div>
                    )}

                    {weekTotals.hoursWorking > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Horas Trabalhadas</span>
                        </div>
                        <p className="text-lg font-bold text-indigo-400">{weekTotals.hoursWorking.toFixed(1)}h</p>
                      </div>
                    )}

                    {weekTotals.personalExpenses > 0 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-400">
                          <DollarSign className="h-4 w-4" />
                          <span className="text-sm">Gastos Pessoais</span>
                        </div>
                        <p className="text-lg font-bold text-amber-400">R$ {weekTotals.personalExpenses.toFixed(2)}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600 text-white">
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
