import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RecordForm } from "@/components/record/record-form"

export default async function RecordPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Get user settings
  const { data: settings } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

  if (!settings) {
    redirect("/setup")
  }

  // Get today's record if exists
  const today = new Date().toISOString().split("T")[0]
  const { data: todayRecord } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", user.id)
    .eq("record_date", today)
    .single()

  return (
    <div className="min-h-screen bg-slate-950 p-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Registro do Dia</h1>
          <p className="text-slate-400">{todayRecord ? "Edite o registro de hoje" : "Registre seu dia de trabalho"}</p>
        </div>
        <RecordForm initialData={todayRecord} settings={settings} userId={user.id} />
      </div>
    </div>
  )
}
