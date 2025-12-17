"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Navigation, TrendingUp, Clock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface TodayOverviewProps {
  todayRecord: any
  settings: any
}

export function TodayOverview({ todayRecord, settings }: TodayOverviewProps) {
  if (!todayRecord) {
    return (
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-white">Hoje</CardTitle>
          <CardDescription className="text-slate-400">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center py-8">
            <p className="text-slate-400 mb-4">Nenhum registro para hoje ainda</p>
            <Button asChild className="bg-green-600 hover:bg-green-700 text-white">
              <Link href="/record">Registrar Dia</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Calculate costs
  const fuelCost = (todayRecord.km_driven / settings.fuel_efficiency) * settings.gas_price
  const maintenanceCost = todayRecord.km_driven * settings.maintenance_cost_per_km
  const appFees = todayRecord.total_rides * settings.app_fee_per_ride
  const carWashDaily = settings.monthly_car_wash / settings.avg_work_days_per_month
  const totalCosts = fuelCost + maintenanceCost + appFees + carWashDaily + (todayRecord.personal_expenses || 0)
  const netProfit = todayRecord.gross_revenue - totalCosts

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-white">Hoje</CardTitle>
          <CardDescription className="text-slate-400">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </CardDescription>
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-slate-600 text-slate-200 hover:bg-slate-700 bg-transparent"
        >
          <Link href="/record">Editar</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">Faturamento</span>
            </div>
            <p className="text-2xl font-bold text-green-400">R$ {todayRecord.gross_revenue.toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Navigation className="h-4 w-4" />
              <span className="text-sm">KM Rodados</span>
            </div>
            <p className="text-2xl font-bold text-white">{todayRecord.km_driven.toFixed(1)} km</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Lucro Líquido</span>
            </div>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              R$ {netProfit.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Corridas</span>
            </div>
            <p className="text-2xl font-bold text-white">{todayRecord.total_rides}</p>
          </div>
        </div>

        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg">
          <h4 className="text-sm font-medium text-slate-300 mb-3">Resumo de Custos</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-400">
              <span>Combustível</span>
              <span>R$ {fuelCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Manutenção</span>
              <span>R$ {maintenanceCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Taxas do App</span>
              <span>R$ {appFees.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Lavagem (diária)</span>
              <span>R$ {carWashDaily.toFixed(2)}</span>
            </div>
            {todayRecord.personal_expenses > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Despesas Pessoais</span>
                <span>R$ {todayRecord.personal_expenses.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-white font-semibold pt-2 border-t border-slate-700">
              <span>Total de Custos</span>
              <span>R$ {totalCosts.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
