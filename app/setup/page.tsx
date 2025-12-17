import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ConfigVersionsList } from "@/components/setup/config-versions-list"

export default async function SetupPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const { data: configVersions } = await supabase
    .from("config_versions")
    .select("*")
    .eq("user_id", user.id)
    .order("effective_date", { ascending: false })

  return (
    <div className="min-h-screen bg-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
          <p className="text-slate-400">
            Gerencie suas configurações por data. Alterações não afetam registros anteriores.
          </p>
        </div>
        <ConfigVersionsList configVersions={configVersions || []} userId={user.id} />
      </div>
    </div>
  )
}
