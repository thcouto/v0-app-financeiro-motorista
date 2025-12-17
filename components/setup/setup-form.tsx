"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface SetupFormProps {
  initialData: any
  userId: string
}

export function SetupForm({ initialData, userId }: SetupFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    car_model: initialData?.car_model || "Chevrolet Onix 2020 1.0 Turbo",
    gas_price: initialData?.gas_price || "6.04",
    fuel_efficiency: initialData?.fuel_efficiency || "11.5",
    maintenance_cost_per_km: initialData?.maintenance_cost_per_km || "0.20",
    app_fee_per_ride: initialData?.app_fee_per_ride || "1.50",
    monthly_car_wash: initialData?.monthly_car_wash || "25.00",
    avg_work_days_per_month: initialData?.avg_work_days_per_month || "26",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const dataToSave = {
        user_id: userId,
        car_model: formData.car_model,
        gas_price: Number.parseFloat(formData.gas_price),
        fuel_efficiency: Number.parseFloat(formData.fuel_efficiency),
        maintenance_cost_per_km: Number.parseFloat(formData.maintenance_cost_per_km),
        app_fee_per_ride: Number.parseFloat(formData.app_fee_per_ride),
        monthly_car_wash: Number.parseFloat(formData.monthly_car_wash),
        avg_work_days_per_month: Number.parseInt(formData.avg_work_days_per_month),
      }

      if (initialData) {
        const { error } = await supabase.from("user_settings").update(dataToSave).eq("user_id", userId)

        if (error) throw error
      } else {
        const { error } = await supabase.from("user_settings").insert(dataToSave)

        if (error) throw error
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Erro ao salvar configurações")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-white">Informações do Veículo</CardTitle>
        <CardDescription className="text-slate-400">
          Essas informações são usadas para calcular seus custos operacionais automaticamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="car_model" className="text-slate-200">
              Carro
            </Label>
            <Input
              id="car_model"
              value={formData.car_model}
              onChange={(e) => setFormData({ ...formData, car_model: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gas_price" className="text-slate-200">
                Preço da gasolina (R$/L)
              </Label>
              <Input
                id="gas_price"
                type="number"
                step="0.01"
                value={formData.gas_price}
                onChange={(e) => setFormData({ ...formData, gas_price: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fuel_efficiency" className="text-slate-200">
                Consumo médio (km/L)
              </Label>
              <Input
                id="fuel_efficiency"
                type="number"
                step="0.1"
                value={formData.fuel_efficiency}
                onChange={(e) => setFormData({ ...formData, fuel_efficiency: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="maintenance_cost_per_km" className="text-slate-200">
                Custo de manutenção (R$/km)
              </Label>
              <Input
                id="maintenance_cost_per_km"
                type="number"
                step="0.01"
                value={formData.maintenance_cost_per_km}
                onChange={(e) => setFormData({ ...formData, maintenance_cost_per_km: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="app_fee_per_ride" className="text-slate-200">
                Taxa do app por corrida (R$)
              </Label>
              <Input
                id="app_fee_per_ride"
                type="number"
                step="0.01"
                value={formData.app_fee_per_ride}
                onChange={(e) => setFormData({ ...formData, app_fee_per_ride: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="monthly_car_wash" className="text-slate-200">
                Lavagem média mensal (R$)
              </Label>
              <Input
                id="monthly_car_wash"
                type="number"
                step="0.01"
                value={formData.monthly_car_wash}
                onChange={(e) => setFormData({ ...formData, monthly_car_wash: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="avg_work_days_per_month" className="text-slate-200">
                Dias médios trabalhados/mês
              </Label>
              <Input
                id="avg_work_days_per_month"
                type="number"
                value={formData.avg_work_days_per_month}
                onChange={(e) => setFormData({ ...formData, avg_work_days_per_month: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Configurações"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
