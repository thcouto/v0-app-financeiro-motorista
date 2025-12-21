"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface RecordFormProps {
  initialData: any
  configVersion: any
  userId: string
}

export function RecordForm({ initialData, configVersion, userId }: RecordFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    record_date: initialData?.record_date || new Date().toISOString().split("T")[0],
    gross_revenue: initialData?.gross_revenue?.toString() || "",
    km_driven: initialData?.km_driven?.toString() || "",
    total_rides: initialData?.total_rides?.toString() || "",
    hours_online: initialData?.hours_online?.toString() || "",
    hours_working: initialData?.hours_working?.toString() || "",
    received_in_app: initialData?.received_in_app?.toString() || "",
    received_outside_app: initialData?.received_outside_app?.toString() || "",
    received_debit: initialData?.received_debit?.toString() || "",
    received_credit: initialData?.received_credit?.toString() || "",
    received_cash_pix: initialData?.received_cash_pix?.toString() || "",
    personal_expenses: initialData?.personal_expenses?.toString() || "",
    personal_expenses_description: initialData?.personal_expenses_description || "",
  })

  const calculateNetAmounts = () => {
    const debit = Number.parseFloat(formData.received_debit) || 0
    const credit = Number.parseFloat(formData.received_credit) || 0
    const cashPix = Number.parseFloat(formData.received_cash_pix) || 0

    const debitFee = (debit * (configVersion?.debit_fee_percent || 1.99)) / 100
    const creditFee = (credit * (configVersion?.credit_fee_percent || 3.99)) / 100

    const netDebit = debit - debitFee
    const netCredit = credit - creditFee
    const totalNet = netDebit + netCredit + cashPix

    return { netDebit, netCredit, totalNet, debitFee, creditFee }
  }

  const validateReceivedAmounts = () => {
    const gross = Number.parseFloat(formData.gross_revenue) || 0
    const { totalNet, debitFee, creditFee } = calculateNetAmounts()

    const debit = Number.parseFloat(formData.received_debit) || 0
    const credit = Number.parseFloat(formData.received_credit) || 0
    const cashPix = Number.parseFloat(formData.received_cash_pix) || 0
    const totalReceived = debit + credit + cashPix

    if (totalReceived > 0 && Math.abs(totalReceived - gross) > 0.01) {
      const diff = Math.abs(totalReceived - gross)
      setWarning(
        `A soma dos valores recebidos (R$ ${totalReceived.toFixed(2)}) difere do faturamento bruto (R$ ${gross.toFixed(2)}). ` +
          `Diferença de R$ ${diff.toFixed(2)}. ${totalReceived > gross ? "Pode indicar gorjeta recebida!" : "Verifique os valores."}` +
          `\n\nTaxas: Débito R$ ${debitFee.toFixed(2)} | Crédito R$ ${creditFee.toFixed(2)} | Líquido Real: R$ ${totalNet.toFixed(2)}`,
      )
    } else {
      setWarning(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const kmDriven = Number.parseFloat(formData.km_driven)
      const totalRides = Number.parseInt(formData.total_rides)
      const grossRevenue = Number.parseFloat(formData.gross_revenue)
      const personalExpenses = Number.parseFloat(formData.personal_expenses) || 0

      const fuelCost = (kmDriven / configVersion.fuel_efficiency) * configVersion.gas_price
      const maintenanceCost = kmDriven * configVersion.maintenance_cost_per_km
      const appFees = totalRides * configVersion.app_fee_per_ride
      const carWashCost = configVersion.monthly_car_wash / configVersion.avg_work_days_per_month

      const debit = Number.parseFloat(formData.received_debit) || 0
      const credit = Number.parseFloat(formData.received_credit) || 0
      const debitFee = (debit * configVersion.debit_fee_percent) / 100
      const creditFee = (credit * configVersion.credit_fee_percent) / 100

      const dailyIpvaCost = configVersion.annual_ipva / configVersion.work_days_per_year
      const dailyInsuranceCost = configVersion.annual_insurance / configVersion.work_days_per_year

      const totalOperationalCosts =
        fuelCost + maintenanceCost + appFees + carWashCost + debitFee + creditFee + dailyIpvaCost + dailyInsuranceCost

      const operationalProfit = grossRevenue - totalOperationalCosts
      const netProfit = operationalProfit - personalExpenses

      const dataToSave = {
        user_id: userId,
        record_date: formData.record_date,
        gross_revenue: grossRevenue,
        km_driven: kmDriven,
        total_rides: totalRides,
        hours_online: formData.hours_online ? Number.parseFloat(formData.hours_online) : null,
        hours_working: formData.hours_working ? Number.parseFloat(formData.hours_working) : null,
        received_in_app: Number.parseFloat(formData.received_in_app) || 0,
        received_outside_app: Number.parseFloat(formData.received_outside_app) || 0,
        received_debit: debit,
        received_credit: credit,
        received_cash_pix: Number.parseFloat(formData.received_cash_pix) || 0,
        personal_expenses: personalExpenses,
        personal_expenses_description: formData.personal_expenses_description || null,
        config_version_id: configVersion.id,
        fuel_cost: fuelCost,
        maintenance_cost: maintenanceCost,
        app_fees: appFees,
        car_wash_cost: carWashCost,
        debit_fee: debitFee,
        credit_fee: creditFee,
        daily_ipva_cost: dailyIpvaCost,
        daily_insurance_cost: dailyInsuranceCost,
        total_operational_costs: totalOperationalCosts,
        operational_profit: operationalProfit,
        net_profit: netProfit,
      }

      if (initialData) {
        const { error } = await supabase.from("daily_records").update(dataToSave).eq("id", initialData.id)

        if (error) throw error
      } else {
        const { error } = await supabase.from("daily_records").insert(dataToSave)

        if (error) throw error
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Erro ao salvar registro")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Dados Obrigatórios</CardTitle>
          <CardDescription className="text-slate-400">Informações essenciais do dia</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="record_date" className="text-slate-200">
              Data
            </Label>
            <Input
              id="record_date"
              type="date"
              value={formData.record_date}
              onChange={(e) => setFormData({ ...formData, record_date: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
              required
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="gross_revenue" className="text-slate-200">
                Faturamento bruto (R$)
              </Label>
              <Input
                id="gross_revenue"
                type="number"
                step="0.01"
                value={formData.gross_revenue}
                onChange={(e) => {
                  setFormData({ ...formData, gross_revenue: e.target.value })
                  setTimeout(validateReceivedAmounts, 100)
                }}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="km_driven" className="text-slate-200">
                Quilômetros rodados
              </Label>
              <Input
                id="km_driven"
                type="number"
                step="0.1"
                value={formData.km_driven}
                onChange={(e) => setFormData({ ...formData, km_driven: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_rides" className="text-slate-200">
                Total de corridas
              </Label>
              <Input
                id="total_rides"
                type="number"
                value={formData.total_rides}
                onChange={(e) => setFormData({ ...formData, total_rides: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Tempo (opcional)</CardTitle>
          <CardDescription className="text-slate-400">Recomendado para análise de produtividade</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="hours_online" className="text-slate-200">
                Horas online no app
              </Label>
              <Input
                id="hours_online"
                type="number"
                step="0.1"
                placeholder="Ex: 8.5"
                value={formData.hours_online}
                onChange={(e) => setFormData({ ...formData, hours_online: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours_working" className="text-slate-200">
                Horas efetivamente trabalhadas
              </Label>
              <Input
                id="hours_working"
                type="number"
                step="0.1"
                placeholder="Ex: 7.0"
                value={formData.hours_working}
                onChange={(e) => setFormData({ ...formData, hours_working: e.target.value })}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Pagamentos Recebidos</CardTitle>
          <CardDescription className="text-slate-400">
            Informe como você recebeu o dinheiro (as taxas serão descontadas automaticamente)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="received_debit" className="text-slate-200">
                Valor recebido no débito (R$)
              </Label>
              <Input
                id="received_debit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.received_debit}
                onChange={(e) => {
                  setFormData({ ...formData, received_debit: e.target.value })
                  setTimeout(validateReceivedAmounts, 100)
                }}
                className="bg-slate-800 border-slate-700 text-white"
              />
              {configVersion && <p className="text-xs text-slate-500">Taxa: {configVersion.debit_fee_percent}%</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="received_credit" className="text-slate-200">
                Valor recebido no crédito (R$)
              </Label>
              <Input
                id="received_credit"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.received_credit}
                onChange={(e) => {
                  setFormData({ ...formData, received_credit: e.target.value })
                  setTimeout(validateReceivedAmounts, 100)
                }}
                className="bg-slate-800 border-slate-700 text-white"
              />
              {configVersion && <p className="text-xs text-slate-500">Taxa: {configVersion.credit_fee_percent}%</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="received_cash_pix" className="text-slate-200">
                Valor em dinheiro / PIX (R$)
              </Label>
              <Input
                id="received_cash_pix"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.received_cash_pix}
                onChange={(e) => {
                  setFormData({ ...formData, received_cash_pix: e.target.value })
                  setTimeout(validateReceivedAmounts, 100)
                }}
                className="bg-slate-800 border-slate-700 text-white"
              />
              <p className="text-xs text-slate-500">Sem taxa</p>
            </div>
          </div>

          {(formData.received_debit || formData.received_credit || formData.received_cash_pix) && (
            <div className="p-4 bg-slate-700/30 rounded-lg border border-slate-700">
              <h4 className="text-sm font-semibold text-slate-300 mb-2">Valores Líquidos (após taxas)</h4>
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-400">Débito líquido:</span>
                  <span className="text-white font-semibold">R$ {calculateNetAmounts().netDebit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Crédito líquido:</span>
                  <span className="text-white font-semibold">R$ {calculateNetAmounts().netCredit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dinheiro/PIX:</span>
                  <span className="text-white font-semibold">
                    R$ {(Number.parseFloat(formData.received_cash_pix) || 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-600">
                  <span className="text-slate-300 font-semibold">Total líquido real:</span>
                  <span className="text-green-400 font-bold text-base">
                    R$ {calculateNetAmounts().totalNet.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {warning && (
            <Alert className="bg-amber-500/10 border-amber-500/50">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-400 text-sm whitespace-pre-line">{warning}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900/50">
        <CardHeader>
          <CardTitle className="text-white">Gastos Pessoais do Dia</CardTitle>
          <CardDescription className="text-slate-400">
            Almoço, café, lanche (não afeta eficiência do carro)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="personal_expenses" className="text-slate-200">
              Valor total (R$)
            </Label>
            <Input
              id="personal_expenses"
              type="number"
              step="0.01"
              value={formData.personal_expenses}
              onChange={(e) => setFormData({ ...formData, personal_expenses: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="personal_expenses_description" className="text-slate-200">
              Descrição (opcional)
            </Label>
            <Textarea
              id="personal_expenses_description"
              placeholder="Ex: Almoço R$ 25, Café R$ 5"
              value={formData.personal_expenses_description}
              onChange={(e) => setFormData({ ...formData, personal_expenses_description: e.target.value })}
              className="bg-slate-800 border-slate-700 text-white"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert className="bg-red-500/10 border-red-500/50">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-400">{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
        >
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Registro"
          )}
        </Button>
      </div>
    </form>
  )
}
