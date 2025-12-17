import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { HistoryList } from "@/components/history/history-list"
import { HistoryHeader } from "@/components/history/history-header"

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  const { data: configVersions } = await supabase.from("config_versions").select("*").eq("user_id", user.id).limit(1)

  if (!configVersions || configVersions.length === 0) {
    redirect("/setup")
  }

  // Get all records with their calculated values
  const { data: records } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", user.id)
    .order("record_date", { ascending: false })

  return (
    <div className="min-h-screen bg-slate-950">
      <HistoryHeader />

      <main className="container mx-auto p-4 md:p-6">
        <HistoryList records={records || []} />
      </main>
    </div>
  )
}
