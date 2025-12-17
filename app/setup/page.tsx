import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SetupForm } from "@/components/setup/setup-form"

export default async function SetupPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Check if user already has settings
  const { data: settings } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Configuração Inicial</h1>
          <p className="text-slate-400">Configure as informações do seu veículo e custos operacionais</p>
        </div>
        <SetupForm initialData={settings} userId={user.id} />
      </div>
    </div>
  )
}
