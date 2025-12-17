import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Car } from "lucide-react"

interface StatsCardsProps {
  totalEarnings: number
  totalExpenses: number
  netProfit: number
  totalTrips: number
}

export function StatsCards({ totalEarnings, totalExpenses, netProfit, totalTrips }: StatsCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const profitPerTrip = totalTrips > 0 ? netProfit / totalTrips : 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Faturamento</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalEarnings)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Despesas</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-red-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Lucro Líquido</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                {formatCurrency(netProfit)}
              </p>
            </div>
            <div
              className={`h-12 w-12 rounded-full flex items-center justify-center ${
                netProfit >= 0 ? "bg-green-500/20" : "bg-red-500/20"
              }`}
            >
              <DollarSign className={`h-6 w-6 ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">Total de Viagens</p>
              <p className="text-2xl font-bold text-white">{totalTrips}</p>
              <p className="text-xs text-slate-500 mt-1">Média: {formatCurrency(profitPerTrip)}/viagem</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Car className="h-6 w-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
