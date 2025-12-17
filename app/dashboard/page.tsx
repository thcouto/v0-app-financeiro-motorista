import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard/header"
import { TodayOverview } from "@/components/dashboard/today-overview"
import { QuickStats } from "@/components/dashboard/quick-stats"
import { IntelligentAnalysis } from "@/components/dashboard/intelligent-analysis"
import { QuickActions } from "@/components/dashboard/quick-actions"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/login")
  }

  // Check if user has settings configured
  const { data: settings } = await supabase.from("user_settings").select("*").eq("user_id", user.id).single()

  // If no settings, redirect to setup
  if (!settings) {
    redirect("/setup")
  }

  // Get today's record
  const today = new Date().toISOString().split("T")[0]
  const { data: todayRecord } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", user.id)
    .eq("record_date", today)
    .single()

  // Get this month's records for stats
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]

  const { data: monthRecords } = await supabase
    .from("daily_records")
    .select("*")
    .eq("user_id", user.id)
    .gte("record_date", firstDayOfMonth)
    .order("record_date", { ascending: false })

  return (
    <div className="min-h-screen bg-slate-950">
      <DashboardHeader user={user} />

      <main className="container mx-auto p-4 md:p-6 space-y-6">
        <QuickStats records={monthRecords || []} settings={settings} />

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <TodayOverview todayRecord={todayRecord} settings={settings} />
            <IntelligentAnalysis todayRecord={todayRecord} monthRecords={monthRecords || []} settings={settings} />
          </div>

          <div className="space-y-6">
            <QuickActions hasRecordToday={!!todayRecord} />
          </div>
        </div>
      </main>
    </div>
  )
}
