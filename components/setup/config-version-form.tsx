"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ConfigVersionFormProps {
  initialData?: any
  userId: string
  onCancel: () => void
}

export function ConfigVersionForm({ initialData, userId, onCancel }: ConfigVersionFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    effective_date: initialData?.effective_date || new Date().toISOString().split("T")[0],
    car_model: initialData?.car_model || "Chevrolet Onix 2020 1.0 Turbo",
    gas_price: initialData?.gas_price?.toString() || "6.04",
    fuel_efficiency: initialData?.fuel_efficiency?.toString() || "11.5",
    maintenance_cost_per_km: initialData?.maintenance_cost_per_km?.toString() || "0.20",
    app_fee_per_ride: initialData?.app_fee_per_ride?.toString() || "1.50",
    monthly_car_wash: initialData?.monthly_car_wash?.toString() || "25.00",
    avg_work_days_per_month: initialData?.avg_work_days_per_month?.toString() || "26",
    debit_fee_percent: initialData?.debit_fee_percent?.toString() || "1.99",
    credit_fee_percent: initialData?.credit_fee_percent?.toString() || "3.99",
    annual_ipva: initialData?.annual_ipva?.toString() || "0",
    annual_insurance: initialData?.annual_insurance?.toString() || "0",
    work_days_per_year: initialData?.work_days_per_year?.toString() || "260",
  })

  const calculateDailyCosts = () => {
    const ipva = Number.parseFloat(formData.annual_ipva) || 0
    const insurance = Number.parseFloat(formData.annual_insurance) || 0
    const workDays = Number.parseInt(formData.work_days_per_year) || 260

    return {
      dailyIpva: ipva / workDays,
      dailyInsurance: insurance / workDays,
      total: (ipva + insurance) / workDays,
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const dataToSave = {
        user_id: userId,
        effective_date: formData.effective_date,
        car_model: formData.car_model,
        gas_price: Number.parseFloat(formData.gas_price),
        fuel_efficiency: Number.parseFloat(formData.fuel_efficiency),
        maintenance_cost_per_km: Number.parseFloat(formData.maintenance_cost_per_km),
        app_fee_per_ride: Number.parseFloat(formData.app_fee_per_ride),
        monthly_car_wash: Number.parseFloat(formData.monthly_car_wash),
        avg_work_days_per_month: Number.parseInt(formData.avg_work_days_per_month),
        debit_fee_percent: Number.parseFloat(formData.debit_fee_percent),
        credit_fee_percent: Number.parseFloat(formData.credit_fee_percent),
        annual_ipva: Number.parseFloat(formData.annual_ipva),
        annual_insurance: Number.parseFloat(formData.annual_insurance),
        work_days_per_year: Number.parseInt(formData.work_days_per_year),
      }

      if (initialData?.id) {
        const { error } = await supabase.from("config_versions").update(dataToSave).eq("id", initialData.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("config_versions").insert(dataToSave)
        if (error) throw error
      }

      router.refresh()
      onCancel()
    } catch (err: any) {
      setError(err.message || "Erro ao salvar configuração")
    } finally {
      setIsLoading(false)
    }
  }

  const dailyCosts = calculateDailyCosts()

  return (
    <Card className="border-slate-800 bg-slate-900/50">
      <CardHeader>
        <CardTitle className="text-white">{initialData ? "Editar Configuração" : "Nova Configuração"}</CardTitle>
        <CardDescription className="text-slate-400">
          Configure a data de início e os valores. Registros anteriores não serão afetados.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-300 text-sm">
              Esta configuração será aplicada a partir da data selecionada. Registros anteriores manterão suas
              configurações originais.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="effective_date" className="text-slate-200">
              Data de início da vigência *
            </Label>
            <Input
              id="effective_date"
              type="date"
              value={formData.effective_date}
              onChange={(e) => setFormData({ ...formData, effective_date: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
            <p className="text-xs text-slate-500">A partir desta data, novos registros usarão esta configuração</p>
          </div>

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

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Taxas da Maquininha</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="debit_fee_percent" className="text-slate-200">
                  Taxa de débito (%)
                </Label>
                <Input
                  id="debit_fee_percent"
                  type="number"
                  step="0.01"
                  value={formData.debit_fee_percent}
                  onChange={(e) => setFormData({ ...formData, debit_fee_percent: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="credit_fee_percent" className="text-slate-200">
                  Taxa de crédito (%)
                </Label>
                <Input
                  id="credit_fee_percent"
                  type="number"
                  step="0.01"
                  value={formData.credit_fee_percent}
                  onChange={(e) => setFormData({ ...formData, credit_fee_percent: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-2">Custos Fixos Anuais</h3>
            <p className="text-sm text-slate-400 mb-4">
              IPVA e Seguro são diluídos por dia trabalhado para refletir o custo real de manter o carro ativo. Mesmo
              sem rodar, esse custo existe.
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="annual_ipva" className="text-slate-200">
                  IPVA Anual (R$)
                </Label>
                <Input
                  id="annual_ipva"
                  type="number"
                  step="0.01"
                  value={formData.annual_ipva}
                  onChange={(e) => setFormData({ ...formData, annual_ipva: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annual_insurance" className="text-slate-200">
                  Seguro Anual (R$)
                </Label>
                <Input
                  id="annual_insurance"
                  type="number"
                  step="0.01"
                  value={formData.annual_insurance}
                  onChange={(e) => setFormData({ ...formData, annual_insurance: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="work_days_per_year" className="text-slate-200">
                  Dias trabalhados/ano
                </Label>
                <Input
                  id="work_days_per_year"
                  type="number"
                  value={formData.work_days_per_year}
                  onChange={(e) => setFormData({ ...formData, work_days_per_year: e.target.value })}
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Custos Fixos Diários Calculados</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">IPVA por dia:</span>
                  <span className="text-white font-semibold">R$ {dailyCosts.dailyIpva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Seguro por dia:</span>
                  <span className="text-white font-semibold">R$ {dailyCosts.dailyInsurance.toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-600">
                  <span className="text-slate-300 font-semibold">Custo fixo total/dia:</span>
                  <span className="text-amber-400 font-bold">R$ {dailyCosts.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/50">
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configuração"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
