"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Navigation, TrendingUp } from "lucide-react"
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

  const operationalProfit = Number(todayRecord.operational_profit) || 0
  const netProfit = Number(todayRecord.net_profit) || 0
  const totalCosts = Number(todayRecord.total_operational_costs) || 0
  const fuelCost = Number(todayRecord.fuel_cost) || 0
  const maintenanceCost = Number(todayRecord.maintenance_cost) || 0
  const appFees = Number(todayRecord.app_fees) || 0
  const carWashCost = Number(todayRecord.car_wash_cost) || 0
  const debitFee = Number(todayRecord.debit_fee) || 0
  const creditFee = Number(todayRecord.credit_fee) || 0
  const dailyIpvaCost = Number(todayRecord.daily_ipva_cost) || 0
  const dailyInsuranceCost = Number(todayRecord.daily_insurance_cost) || 0
  const personalExpenses = Number(todayRecord.personal_expenses) || 0

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
            <p className="text-2xl font-bold text-green-400">R$ {Number(todayRecord.gross_revenue).toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <Navigation className="h-4 w-4" />
              <span className="text-sm">KM Rodados</span>
            </div>
            <p className="text-2xl font-bold text-white">{Number(todayRecord.km_driven).toFixed(1)} km</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Lucro Operacional</span>
            </div>
            <p className={`text-2xl font-bold ${operationalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              R$ {operationalProfit.toFixed(2)}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Lucro Real</span>
            </div>
            <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              R$ {netProfit.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Custos Operacionais</h4>
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
                <span>R$ {carWashCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxa Débito</span>
                <span>R$ {debitFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Taxa Crédito</span>
                <span>R$ {creditFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>IPVA (diário)</span>
                <span>R$ {dailyIpvaCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Seguro (diário)</span>
                <span>R$ {dailyInsuranceCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-400 font-semibold pt-2 border-t border-slate-700">
                <span>Total Operacional</span>
                <span>R$ {totalCosts.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-900/50 rounded-lg">
            <h4 className="text-sm font-medium text-slate-300 mb-3">Resumo Financeiro</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-white">
                <span>Corridas</span>
                <span className="font-semibold">{todayRecord.total_rides}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Média por corrida</span>
                <span>
                  R${" "}
                  {todayRecord.total_rides > 0
                    ? (todayRecord.gross_revenue / todayRecord.total_rides).toFixed(2)
                    : "0.00"}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Lucro por km</span>
                <span>
                  R$ {todayRecord.km_driven > 0 ? (operationalProfit / todayRecord.km_driven).toFixed(2) : "0.00"}
                </span>
              </div>
              {personalExpenses > 0 && (
                <>
                  <div className="flex justify-between text-amber-400 pt-2 border-t border-slate-700">
                    <span>Despesas Pessoais</span>
                    <span>R$ {personalExpenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-xs italic">
                    <span>Lucro Op. - Pessoais</span>
                    <span>= Lucro Real</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
