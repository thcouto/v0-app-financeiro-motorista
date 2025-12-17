"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, TrendingUp, AlertCircle, Info } from "lucide-react"

interface IntelligentAnalysisProps {
  todayRecord: any
  monthRecords: any[]
  settings: any
}

function calculateMetrics(record: any, settings: any) {
  const fuelCost = (record.km_driven / settings.fuel_efficiency) * settings.gas_price
  const maintenanceCost = record.km_driven * settings.maintenance_cost_per_km
  const appFees = record.total_rides * settings.app_fee_per_ride
  const carWashDaily = settings.monthly_car_wash / settings.avg_work_days_per_month

  const debitFee = ((record.received_debit || 0) * (settings.debit_fee_percent || 0)) / 100
  const creditFee = ((record.received_credit || 0) * (settings.credit_fee_percent || 0)) / 100
  const paymentMachineFees = debitFee + creditFee

  const totalCosts =
    fuelCost + maintenanceCost + appFees + carWashDaily + paymentMachineFees + (record.personal_expenses || 0)
  const netProfit = record.gross_revenue - totalCosts

  return {
    fuelCost,
    maintenanceCost,
    appFees,
    carWashDaily,
    paymentMachineFees,
    totalCosts,
    netProfit,
    profitMargin: (netProfit / record.gross_revenue) * 100,
    profitPerKm: netProfit / record.km_driven,
    profitPerHour: record.hours_working ? netProfit / record.hours_working : null,
  }
}

export function IntelligentAnalysis({ todayRecord, monthRecords, settings }: IntelligentAnalysisProps) {
  const insights = []

  if (!todayRecord) {
    insights.push({
      type: "info",
      icon: Info,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      title: "Nenhum Registro Hoje",
      message: "Registre seu dia de trabalho para ver a análise inteligente.",
    })
  } else {
    const today = calculateMetrics(todayRecord, settings)

    let avgProfitPerKm = today.profitPerKm
    let avgProfitPerHour = today.profitPerHour || 0
    let avgProfitMargin = today.profitMargin

    if (monthRecords.length > 1) {
      const otherRecords = monthRecords.filter((r) => r.id !== todayRecord.id)
      if (otherRecords.length > 0) {
        avgProfitPerKm =
          otherRecords.reduce((sum, r) => {
            const m = calculateMetrics(r, settings)
            return sum + m.profitPerKm
          }, 0) / otherRecords.length

        const recordsWithHours = otherRecords.filter((r) => r.hours_working)
        if (recordsWithHours.length > 0) {
          avgProfitPerHour =
            recordsWithHours.reduce((sum, r) => {
              const m = calculateMetrics(r, settings)
              return sum + (m.profitPerHour || 0)
            }, 0) / recordsWithHours.length
        }

        avgProfitMargin =
          otherRecords.reduce((sum, r) => {
            const m = calculateMetrics(r, settings)
            return sum + m.profitMargin
          }, 0) / otherRecords.length
      }
    }

    if (today.profitPerKm > avgProfitPerKm * 1.15) {
      insights.push({
        type: "success",
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        title: "Excelente Lucro por KM",
        message: `Você teve um ótimo desempenho hoje! Lucro de R$ ${today.profitPerKm.toFixed(2)}/km está ${((today.profitPerKm / avgProfitPerKm - 1) * 100).toFixed(0)}% acima da sua média histórica de R$ ${avgProfitPerKm.toFixed(2)}/km.`,
      })
    } else if (today.profitPerKm < avgProfitPerKm * 0.85) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        title: "Lucro por KM Abaixo da Média",
        message: `Seu lucro por km hoje (R$ ${today.profitPerKm.toFixed(2)}/km) está ${((1 - today.profitPerKm / avgProfitPerKm) * 100).toFixed(0)}% abaixo da média histórica de R$ ${avgProfitPerKm.toFixed(2)}/km. Considere aceitar corridas mais longas ou com melhor valor.`,
      })
    }

    if (today.profitPerHour && avgProfitPerHour > 0) {
      if (today.profitPerHour > avgProfitPerHour * 1.15) {
        insights.push({
          type: "success",
          icon: TrendingUp,
          color: "text-green-400",
          bgColor: "bg-green-500/10",
          title: "Alta Produtividade por Hora",
          message: `Excelente! Você lucrou R$ ${today.profitPerHour.toFixed(2)}/hora, ${((today.profitPerHour / avgProfitPerHour - 1) * 100).toFixed(0)}% acima da sua média de R$ ${avgProfitPerHour.toFixed(2)}/hora. Continue nesse ritmo!`,
        })
      } else if (today.profitPerHour < avgProfitPerHour * 0.85) {
        insights.push({
          type: "error",
          icon: AlertTriangle,
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          title: "Baixo Retorno por Hora",
          message: `O lucro por hora ficou em R$ ${today.profitPerHour.toFixed(2)}, ${((1 - today.profitPerHour / avgProfitPerHour) * 100).toFixed(0)}% abaixo da média de R$ ${avgProfitPerHour.toFixed(2)}. Isso sugere muitas horas online sem retorno adequado. Considere ajustar seus horários de trabalho.`,
        })
      }
    }

    if (today.profitMargin > avgProfitMargin * 1.1 || today.profitMargin >= 40) {
      insights.push({
        type: "success",
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        title: "Margem de Lucro Excelente",
        message: `Margem de ${today.profitMargin.toFixed(1)}% está ${today.profitMargin > avgProfitMargin ? `acima da média de ${avgProfitMargin.toFixed(1)}%` : "excelente"}! O custo de combustível e manutenção ficaram dentro da faixa ideal.`,
      })
    } else if (today.profitMargin < avgProfitMargin * 0.9 || today.profitMargin < 30) {
      insights.push({
        type: "error",
        icon: AlertCircle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        title: "Margem de Lucro Baixa",
        message: `Margem de apenas ${today.profitMargin.toFixed(1)}% ${today.profitMargin < avgProfitMargin ? `está abaixo da média de ${avgProfitMargin.toFixed(1)}%` : "está baixa"}. Considere trabalhar mais horas ou reduzir custos operacionais.`,
      })
    }

    // Average revenue per ride
    const avgRevenuePerRide = todayRecord.gross_revenue / todayRecord.total_rides
    if (avgRevenuePerRide < 15) {
      insights.push({
        type: "warning",
        icon: AlertCircle,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        title: "Corridas de Baixo Valor",
        message: `Média de R$ ${avgRevenuePerRide.toFixed(2)} por corrida. Evite corridas muito curtas para aumentar o lucro. Priorize corridas acima de R$ 15.`,
      })
    } else if (avgRevenuePerRide >= 25) {
      insights.push({
        type: "success",
        icon: TrendingUp,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        title: "Corridas Rentáveis",
        message: `Média excelente de R$ ${avgRevenuePerRide.toFixed(2)} por corrida. Continue focando nesse padrão de corridas mais longas e rentáveis!`,
      })
    }

    const fuelCostPercentage = (today.fuelCost / todayRecord.gross_revenue) * 100
    if (fuelCostPercentage > 25) {
      insights.push({
        type: "error",
        icon: AlertTriangle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        title: "Alto Custo de Combustível",
        message: `Combustível representa ${fuelCostPercentage.toFixed(1)}% do faturamento (ideal: 15-20%). Hoje o custo por km foi acima da média. Considere ajustar sua estratégia de corridas para rotas mais eficientes.`,
      })
    } else if (fuelCostPercentage < 15) {
      insights.push({
        type: "success",
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        title: "Custo de Combustível Controlado",
        message: `Ótimo! Combustível representa apenas ${fuelCostPercentage.toFixed(1)}% do faturamento. Você está fazendo corridas eficientes.`,
      })
    }
  }

  if (monthRecords.length >= 5) {
    const monthlyAvgProfit =
      monthRecords.reduce((sum, r) => {
        const m = calculateMetrics(r, settings)
        return sum + m.netProfit
      }, 0) / monthRecords.length

    if (monthlyAvgProfit < 100) {
      insights.push({
        type: "error",
        icon: AlertTriangle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        title: "Lucro Médio Mensal Baixo",
        message: `Lucro médio mensal de R$ ${monthlyAvgProfit.toFixed(2)}/dia está abaixo do ideal. Revise sua estratégia: trabalhe mais horas, escolha horários de pico, ou reduza custos operacionais.`,
      })
    } else if (monthlyAvgProfit >= 150) {
      insights.push({
        type: "success",
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        title: "Excelente Desempenho Mensal",
        message: `Parabéns! Seu lucro médio mensal de R$ ${monthlyAvgProfit.toFixed(2)}/dia está excelente. Continue mantendo esse padrão!`,
      })
    }
  }

  if (insights.length === 0) {
    insights.push({
      type: "info",
      icon: CheckCircle,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      title: "Desempenho Dentro da Média",
      message: "Continue trabalhando bem. Seus números estão dentro do esperado e alinhados com sua média histórica.",
    })
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Análise Inteligente</CardTitle>
        <CardDescription className="text-slate-400">
          Comparação com sua média histórica e insights automáticos
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div key={index} className={`p-4 rounded-lg ${insight.bgColor} border border-slate-700`}>
            <div className="flex items-start gap-3">
              <insight.icon className={`h-5 w-5 ${insight.color} mt-0.5 flex-shrink-0`} />
              <div className="space-y-1 flex-1">
                <h4 className={`font-semibold ${insight.color}`}>{insight.title}</h4>
                <p className="text-sm text-slate-300 leading-relaxed">{insight.message}</p>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
