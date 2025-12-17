"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, TrendingUp, AlertCircle } from "lucide-react"

interface IntelligentAnalysisProps {
  todayRecord: any
  monthRecords: any[]
  settings: any
}

export function IntelligentAnalysis({ todayRecord, monthRecords, settings }: IntelligentAnalysisProps) {
  const insights = []

  if (todayRecord) {
    // Calculate today's metrics
    const fuelCost = (todayRecord.km_driven / settings.fuel_efficiency) * settings.gas_price
    const maintenanceCost = todayRecord.km_driven * settings.maintenance_cost_per_km
    const appFees = todayRecord.total_rides * settings.app_fee_per_ride
    const carWashDaily = settings.monthly_car_wash / settings.avg_work_days_per_month
    const totalCosts = fuelCost + maintenanceCost + appFees + carWashDaily + (todayRecord.personal_expenses || 0)
    const netProfit = todayRecord.gross_revenue - totalCosts
    const profitMargin = (netProfit / todayRecord.gross_revenue) * 100

    // Average revenue per ride
    const avgRevenuePerRide = todayRecord.gross_revenue / todayRecord.total_rides

    // KM per ride
    const kmPerRide = todayRecord.km_driven / todayRecord.total_rides

    // Analysis: Profit margin
    if (profitMargin < 30) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        title: "Margem de Lucro Baixa",
        message: `Sua margem de lucro hoje está em ${profitMargin.toFixed(
          1,
        )}%. Considere trabalhar mais horas ou reduzir custos.`,
      })
    } else if (profitMargin >= 40) {
      insights.push({
        type: "success",
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        title: "Excelente Margem",
        message: `Parabéns! Sua margem de lucro de ${profitMargin.toFixed(1)}% está excelente hoje.`,
      })
    }

    // Analysis: Revenue per ride
    if (avgRevenuePerRide < 15) {
      insights.push({
        type: "warning",
        icon: AlertCircle,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        title: "Corridas de Baixo Valor",
        message: `Média de R$ ${avgRevenuePerRide.toFixed(
          2,
        )} por corrida. Evite corridas muito curtas para aumentar o lucro.`,
      })
    } else if (avgRevenuePerRide >= 25) {
      insights.push({
        type: "success",
        icon: TrendingUp,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        title: "Corridas Rentáveis",
        message: `Média excelente de R$ ${avgRevenuePerRide.toFixed(2)} por corrida. Continue focando nesse padrão!`,
      })
    }

    // Analysis: KM efficiency
    if (kmPerRide > 10) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        title: "Muitos KM por Corrida",
        message: `Média de ${kmPerRide.toFixed(
          1,
        )} km/corrida. Corridas muito longas podem não compensar. Avalie a relação valor x distância.`,
      })
    }

    // Analysis: Fuel efficiency
    const fuelCostPercentage = (fuelCost / todayRecord.gross_revenue) * 100
    if (fuelCostPercentage > 25) {
      insights.push({
        type: "error",
        icon: AlertTriangle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        title: "Alto Custo de Combustível",
        message: `Combustível representa ${fuelCostPercentage.toFixed(
          1,
        )}% do faturamento. Considere ajustar sua estratégia de corridas.`,
      })
    }
  }

  // Monthly analysis
  if (monthRecords.length >= 5) {
    const monthlyAvgProfit =
      monthRecords.reduce((sum, r) => {
        const fuelCost = (r.km_driven / settings.fuel_efficiency) * settings.gas_price
        const maintenanceCost = r.km_driven * settings.maintenance_cost_per_km
        const appFees = r.total_rides * settings.app_fee_per_ride
        const carWashDaily = settings.monthly_car_wash / settings.avg_work_days_per_month
        const totalCosts = fuelCost + maintenanceCost + appFees + carWashDaily + (r.personal_expenses || 0)
        return sum + (r.gross_revenue - totalCosts)
      }, 0) / monthRecords.length

    if (monthlyAvgProfit < 100) {
      insights.push({
        type: "error",
        icon: AlertTriangle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        title: "Lucro Médio Baixo",
        message: `Lucro médio mensal de R$ ${monthlyAvgProfit.toFixed(
          2,
        )}/dia está abaixo do ideal. Revise sua estratégia de trabalho.`,
      })
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: "info",
      icon: CheckCircle,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      title: "Tudo Certo!",
      message: "Continue trabalhando bem. Seus números estão dentro do esperado.",
    })
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Análise Inteligente</CardTitle>
        <CardDescription className="text-slate-400">Insights automáticos sobre seu desempenho</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg ${insight.bgColor} border border-slate-700`}>
            <div className="flex items-start gap-3">
              <insight.icon className={`h-5 w-5 ${insight.color} mt-0.5 flex-shrink-0`} />
              <div className="space-y-1 flex-1">
                <h4 className={`font-semibold ${insight.color}`}>{insight.title}</h4>
                <p className="text-sm text-slate-300">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
