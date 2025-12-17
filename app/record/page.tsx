import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecordForm } from "@/components/record/record-form"

export default async function RecordPage({ searchParams }: { searchParams: { date?: string } }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const targetDate = searchParams.date || new Date().toISOString().split("T")[0]

  // Get the active config for the target date
  const { data: configVersion } = await supabase
    .from("config_versions")
    .select("*")
    .eq("user_id", user.id)
    .lte("effective_date", targetDate)
    .order("effective_date", { ascending: false })
    .limit(1)
    .single()

  if (!configVersion) {
    redirect("/setup")
  }

  // Get record for the target date if exists
  const { data: record } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", user.id)
    .eq("record_date", targetDate)
    .single()

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Registro do Dia</h1>
          <p className="text-slate-400">{record ? "Edite o registro" : "Registre seu dia de trabalho"}</p>
          <p className="text-xs text-slate-500 mt-1">
            Usando configuração vigente de {new Date(configVersion.effective_date).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <RecordForm initialData={record} configVersion={configVersion} userId={user.id} />
      </div>
    </div>
  )
}
