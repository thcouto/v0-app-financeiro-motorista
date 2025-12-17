"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar, Settings } from "lucide-react"
import { ConfigVersionForm } from "./config-version-form"

interface ConfigVersion {
  id: string
  effective_date: string
  car_model: string
  gas_price: number
  fuel_efficiency: number
  maintenance_cost_per_km: number
  app_fee_per_ride: number
  debit_fee_percent: number
  credit_fee_percent: number
  monthly_car_wash: number
  avg_work_days_per_month: number
  annual_ipva: number
  annual_insurance: number
  work_days_per_year: number
}

interface ConfigVersionsListProps {
  configVersions: ConfigVersion[]
  userId: string
}

export function ConfigVersionsList({ configVersions, userId }: ConfigVersionsListProps) {
  const [isCreating, setIsCreating] = useState(configVersions.length === 0)
  const [editingId, setEditingId] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR")
  }

  const calculateDailyCosts = (config: ConfigVersion) => {
    const dailyIpva = config.annual_ipva / config.work_days_per_year
    const dailyInsurance = config.annual_insurance / config.work_days_per_year
    return { dailyIpva, dailyInsurance, total: dailyIpva + dailyInsurance }
  }

  if (isCreating || editingId) {
    const editData = editingId ? configVersions.find((c) => c.id === editingId) : null
    return (
      <ConfigVersionForm
        initialData={editData}
        userId={userId}
        onCancel={() => {
          setIsCreating(false)
          setEditingId(null)
        }}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Histórico de Configurações</h2>
        <Button onClick={() => setIsCreating(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Nova Configuração
        </Button>
      </div>

      {configVersions.length === 0 ? (
        <Card className="border-slate-800 bg-slate-900/50">
          <CardContent className="p-8 text-center">
            <Settings className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Nenhuma configuração encontrada</p>
            <Button onClick={() => setIsCreating(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Criar Primeira Configuração
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {configVersions.map((config, index) => {
            const dailyCosts = calculateDailyCosts(config)
            const isActive = index === 0

            return (
              <Card
                key={config.id}
                className={`border-slate-800 ${isActive ? "bg-emerald-900/20" : "bg-slate-900/50"}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-emerald-500" />
                      <div>
                        <CardTitle className="text-white text-lg">Desde {formatDate(config.effective_date)}</CardTitle>
                        {isActive && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded">
                            Configuração Ativa
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingId(config.id)}
                      className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Editar
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Veículo</h4>
                      <p className="text-white font-medium">{config.car_model}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Gasolina</h4>
                      <p className="text-white">R$ {config.gas_price.toFixed(2)}/L</p>
                      <p className="text-slate-400 text-sm">{config.fuel_efficiency} km/L</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Manutenção</h4>
                      <p className="text-white">R$ {config.maintenance_cost_per_km.toFixed(4)}/km</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Taxa do App</h4>
                      <p className="text-white">R$ {config.app_fee_per_ride.toFixed(2)}/corrida</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Taxas Maquininha</h4>
                      <p className="text-white">
                        Débito: {config.debit_fee_percent}% | Crédito: {config.credit_fee_percent}%
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Lavagem Mensal</h4>
                      <p className="text-white">R$ {config.monthly_car_wash.toFixed(2)}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">IPVA Anual</h4>
                      <p className="text-white">R$ {config.annual_ipva.toFixed(2)}</p>
                      <p className="text-emerald-400 text-sm">R$ {dailyCosts.dailyIpva.toFixed(2)}/dia</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Seguro Anual</h4>
                      <p className="text-white">R$ {config.annual_insurance.toFixed(2)}</p>
                      <p className="text-emerald-400 text-sm">R$ {dailyCosts.dailyInsurance.toFixed(2)}/dia</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-300 mb-2">Custo Fixo Diário Total</h4>
                      <p className="text-amber-400 font-semibold text-lg">R$ {dailyCosts.total.toFixed(2)}</p>
                      <p className="text-slate-500 text-xs">{config.work_days_per_year} dias/ano</p>
                    </div>
                  </div>

                  {(config.annual_ipva === 0 || config.annual_insurance === 0) && (
                    <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                      <p className="text-amber-400 text-sm">
                        ⚠️ Atenção: IPVA ou Seguro não configurados. O custo real do veículo pode estar subestimado.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
