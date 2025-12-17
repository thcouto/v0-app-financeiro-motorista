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
  settings: any
  userId: string
}

export function RecordForm({ initialData, settings, userId }: RecordFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    record_date: initialData?.record_date || new Date().toISOString().split("T")[0],
    gross_revenue: initialData?.gross_revenue || "",
    km_driven: initialData?.km_driven || "",
    total_rides: initialData?.total_rides || "",
    hours_online: initialData?.hours_online || "",
    hours_working: initialData?.hours_working || "",
    received_in_app: initialData?.received_in_app || "",
    received_outside_app: initialData?.received_outside_app || "",
    personal_expenses: initialData?.personal_expenses || "",
    personal_expenses_description: initialData?.personal_expenses_description || "",
  })

  // Validate received amounts
  const validateReceivedAmounts = () => {
    const gross = Number.parseFloat(formData.gross_revenue) || 0
    const inApp = Number.parseFloat(formData.received_in_app) || 0
    const outside = Number.parseFloat(formData.received_outside_app) || 0
    const total = inApp + outside

    if (total !== gross) {
      const diff = Math.abs(total - gross)
      if (diff > 0) {
        setWarning(
          `A soma dos valores recebidos (R$ ${total.toFixed(2)}) difere do faturamento bruto (R$ ${gross.toFixed(2)}). ` +
            `Diferença de R$ ${diff.toFixed(2)}. ${total > gross ? "Pode indicar gorjeta recebida!" : "Verifique os valores."}`,
        )
      } else {
        setWarning(null)
      }
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
      const dataToSave = {
        user_id: userId,
        record_date: formData.record_date,
        gross_revenue: Number.parseFloat(formData.gross_revenue),
        km_driven: Number.parseFloat(formData.km_driven),
        total_rides: Number.parseInt(formData.total_rides),
        hours_online: formData.hours_online ? Number.parseFloat(formData.hours_online) : null,
        hours_working: formData.hours_working ? Number.parseFloat(formData.hours_working) : null,
        received_in_app: Number.parseFloat(formData.received_in_app) || 0,
        received_outside_app: Number.parseFloat(formData.received_outside_app) || 0,
        personal_expenses: Number.parseFloat(formData.personal_expenses) || 0,
        personal_expenses_description: formData.personal_expenses_description || null,
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
          <CardTitle className="text-white">Formas de Recebimento</CardTitle>
          <CardDescription className="text-slate-400">Como você recebeu o dinheiro hoje</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="received_in_app" className="text-slate-200">
                Recebido no app (cartão)
              </Label>
              <Input
                id="received_in_app"
                type="number"
                step="0.01"
                value={formData.received_in_app}
                onChange={(e) => {
                  setFormData({ ...formData, received_in_app: e.target.value })
                  setTimeout(validateReceivedAmounts, 100)
                }}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="received_outside_app" className="text-slate-200">
                Recebido fora do app (dinheiro/pix)
              </Label>
              <Input
                id="received_outside_app"
                type="number"
                step="0.01"
                value={formData.received_outside_app}
                onChange={(e) => {
                  setFormData({ ...formData, received_outside_app: e.target.value })
                  setTimeout(validateReceivedAmounts, 100)
                }}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>

          {warning && (
            <Alert className="bg-amber-500/10 border-amber-500/50">
              <AlertCircle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-amber-400 text-sm">{warning}</AlertDescription>
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
