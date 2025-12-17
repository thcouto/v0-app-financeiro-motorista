import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RecentTripsProps {
  trips: any[]
}

export function RecentTrips({ trips }: RecentTripsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  const getPlatformColor = (platform: string) => {
    const colors: Record<string, string> = {
      uber: "bg-slate-900 text-white",
      "99": "bg-orange-500 text-white",
      indriver: "bg-red-500 text-white",
      outros: "bg-slate-600 text-white",
    }
    return colors[platform.toLowerCase()] || colors.outros
  }

  return (
    <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-white">Viagens Recentes</CardTitle>
        <CardDescription className="text-slate-400">Suas últimas 5 viagens registradas</CardDescription>
      </CardHeader>
      <CardContent>
        {trips.length === 0 ? (
          <p className="text-slate-400 text-center py-8">Nenhuma viagem registrada ainda</p>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-900/50">
                <div className="flex items-center gap-4">
                  <div>
                    <Badge className={getPlatformColor(trip.platform)}>{trip.platform}</Badge>
                  </div>
                  <div>
                    <p className="font-medium text-white">{formatDate(trip.date)}</p>
                    <p className="text-sm text-slate-400">
                      {trip.trips_count} {trip.trips_count === 1 ? "viagem" : "viagens"}
                      {trip.distance && ` • ${trip.distance}km`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-400">{formatCurrency(Number(trip.earnings))}</p>
                  {trip.duration && <p className="text-xs text-slate-400">{trip.duration} min</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
