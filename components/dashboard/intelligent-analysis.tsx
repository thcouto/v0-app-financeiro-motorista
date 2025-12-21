"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, TrendingUp, Info } from "lucide-react"
import { classifyDayPerformance } from "@/lib/utils/classification"

interface IntelligentAnalysisProps {
  todayRecord: any
  monthRecords: any[]
  settings: any
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
    const historicalRecords = monthRecords.filter((r) => r.id !== todayRecord.id)
    const { classification } = classifyDayPerformance(todayRecord, historicalRecords)

    const operationalProfit = Number(todayRecord.operational_profit) || 0
    const grossRevenue = Number(todayRecord.gross_revenue) || 0
    const kmDriven = Number(todayRecord.km_driven) || 0

    const profitMargin = grossRevenue > 0 ? (operationalProfit / grossRevenue) * 100 : 0
    const profitPerKm = kmDriven > 0 ? operationalProfit / kmDriven : 0
    const profitPerHour = todayRecord.hours_working ? operationalProfit / todayRecord.hours_working : null

    // Calculate averages from historical data
    let avgProfitPerKm = profitPerKm
    let avgProfitPerHour = profitPerHour || 0
    let avgProfitMargin = profitMargin

    if (historicalRecords.length > 0) {
      avgProfitPerKm =
        historicalRecords.reduce((sum, r) => {
          const op = Number(r.operational_profit) || 0
          const km = Number(r.km_driven) || 0
          return sum + (km > 0 ? op / km : 0)
        }, 0) / historicalRecords.length

      const recordsWithHours = historicalRecords.filter((r) => r.hours_working)
      if (recordsWithHours.length > 0) {
        avgProfitPerHour =
          recordsWithHours.reduce((sum, r) => {
            const op = Number(r.operational_profit) || 0
            const hw = Number(r.hours_working) || 0
            return sum + (hw > 0 ? op / hw : 0)
          }, 0) / recordsWithHours.length
      }

      avgProfitMargin =
        historicalRecords.reduce((sum, r) => {
          const op = Number(r.operational_profit) || 0
          const gr = Number(r.gross_revenue) || 0
          return sum + (gr > 0 ? (op / gr) * 100 : 0)
        }, 0) / historicalRecords.length
    }

    // Generate insights based on metrics
    if (profitPerKm > avgProfitPerKm * 1.15) {
      insights.push({
        type: "success",
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        title: "Excelente Lucro por KM",
        message: `Você teve um ótimo desempenho hoje! Lucro de R$ ${profitPerKm.toFixed(2)}/km está ${((profitPerKm / avgProfitPerKm - 1) * 100).toFixed(0)}% acima da sua média histórica de R$ ${avgProfitPerKm.toFixed(2)}/km.`,
      })
    } else if (profitPerKm < avgProfitPerKm * 0.85) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
        color: "text-yellow-400",
        bgColor: "bg-yellow-500/10",
        title: "Lucro por KM Abaixo da Média",
        message: `Seu lucro por km hoje (R$ ${profitPerKm.toFixed(2)}/km) está ${((1 - profitPerKm / avgProfitPerKm) * 100).toFixed(0)}% abaixo da média histórica de R$ ${avgProfitPerKm.toFixed(2)}/km. Considere aceitar corridas mais longas ou com melhor valor.`,
      })
    }

    if (profitPerHour && avgProfitPerHour > 0) {
      if (profitPerHour > avgProfitPerHour * 1.15) {
        insights.push({
          type: "success",
          icon: TrendingUp,
          color: "text-green-400",
          bgColor: "bg-green-500/10",
          title: "Alta Produtividade por Hora",
          message: `Excelente! Você lucrou R$ ${profitPerHour.toFixed(2)}/hora, ${((profitPerHour / avgProfitPerHour - 1) * 100).toFixed(0)}% acima da sua média de R$ ${avgProfitPerHour.toFixed(2)}/hora. Continue nesse ritmo!`,
        })
      } else if (profitPerHour < avgProfitPerHour * 0.85) {
        insights.push({
          type: "error",
          icon: AlertTriangle,
          color: "text-red-400",
          bgColor: "bg-red-500/10",
          title: "Baixo Retorno por Hora",
          message: `O lucro por hora ficou em R$ ${profitPerHour.toFixed(2)}, ${((1 - profitPerHour / avgProfitPerHour) * 100).toFixed(0)}% abaixo da média de R$ ${avgProfitPerHour.toFixed(2)}. Isso sugere muitas horas online sem retorno adequado. Considere ajustar seus horários de trabalho.`,
        })
      }
    }

    if (profitMargin > avgProfitMargin * 1.1 || profitMargin >= 40) {
      insights.push({
        type: "success",
        icon: CheckCircle,
        color: "text-green-400",
        bgColor: "bg-green-500/10",
        title: "Margem de Lucro Excelente",
        message: `Margem de ${profitMargin.toFixed(1)}% está ${profitMargin > avgProfitMargin ? `acima da média de ${avgProfitMargin.toFixed(1)}%` : "excelente"}! O custo de combustível e manutenção ficaram dentro da faixa ideal.`,
      })
    } else if (profitMargin < avgProfitMargin * 0.9 || profitMargin < 30) {
      insights.push({
        type: "error",
        icon: AlertTriangle,
        color: "text-red-400",
        bgColor: "bg-red-500/10",
        title: "Margem de Lucro Baixa",
        message: `Margem de apenas ${profitMargin.toFixed(1)}% ${profitMargin < avgProfitMargin ? `está abaixo da média de ${avgProfitMargin.toFixed(1)}%` : "está baixa"}. Considere trabalhar mais horas ou reduzir custos operacionais.`,
      })
    }

    const avgRevenuePerRide = grossRevenue / todayRecord.total_rides
    if (avgRevenuePerRide < 15) {
      insights.push({
        type: "warning",
        icon: AlertTriangle,
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

    const fuelCost = Number(todayRecord.fuel_cost) || 0
    const fuelCostPercentage = (fuelCost / grossRevenue) * 100
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
      monthRecords.reduce((sum, r) => sum + (Number(r.operational_profit) || 0), 0) / monthRecords.length

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
