"use client"

import { Card, CardContent } from "@/components/ui/card"
import { DollarSign, TrendingUp, Navigation, Zap } from "lucide-react"

interface QuickStatsProps {
  records: any[]
  settings: any
}

export function QuickStats({ records, settings }: QuickStatsProps) {
  // Calculate monthly totals
  const monthlyGrossRevenue = records.reduce((sum, r) => sum + Number(r.gross_revenue), 0)
  const monthlyKm = records.reduce((sum, r) => sum + Number(r.km_driven), 0)
  const monthlyRides = records.reduce((sum, r) => sum + Number(r.total_rides), 0)

  // Calculate monthly costs
  const monthlyFuelCost = records.reduce(
    (sum, r) => sum + (Number(r.km_driven) / settings.fuel_efficiency) * settings.gas_price,
    0,
  )
  const monthlyMaintenanceCost = records.reduce(
    (sum, r) => sum + Number(r.km_driven) * settings.maintenance_cost_per_km,
    0,
  )
  const monthlyAppFees = records.reduce((sum, r) => sum + Number(r.total_rides) * settings.app_fee_per_ride, 0)
  const monthlyCarWash = settings.monthly_car_wash
  const monthlyPersonalExpenses = records.reduce((sum, r) => sum + (Number(r.personal_expenses) || 0), 0)

  const monthlyTotalCosts =
    monthlyFuelCost + monthlyMaintenanceCost + monthlyAppFees + monthlyCarWash + monthlyPersonalExpenses
  const monthlyNetProfit = monthlyGrossRevenue - monthlyTotalCosts

  // Calculate averages
  const workDays = records.length || 1
  const avgDailyRevenue = monthlyGrossRevenue / workDays
  const avgDailyProfit = monthlyNetProfit / workDays

  const stats = [
    {
      title: "Faturamento Mensal",
      value: `R$ ${monthlyGrossRevenue.toFixed(2)}`,
      subtitle: `Média: R$ ${avgDailyRevenue.toFixed(2)}/dia`,
      icon: DollarSign,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Lucro Líquido Mensal",
      value: `R$ ${monthlyNetProfit.toFixed(2)}`,
      subtitle: `Média: R$ ${avgDailyProfit.toFixed(2)}/dia`,
      icon: TrendingUp,
      color: monthlyNetProfit >= 0 ? "text-green-400" : "text-red-400",
      bgColor: monthlyNetProfit >= 0 ? "bg-green-500/10" : "bg-red-500/10",
    },
    {
      title: "KM Rodados",
      value: `${monthlyKm.toFixed(1)} km`,
      subtitle: `Média: ${(monthlyKm / workDays).toFixed(1)} km/dia`,
      icon: Navigation,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Total de Corridas",
      value: monthlyRides.toString(),
      subtitle: `Média: ${Math.round(monthlyRides / workDays)} corridas/dia`,
      icon: Zap,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index} className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm text-slate-400">{stat.title}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500">{stat.subtitle}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
