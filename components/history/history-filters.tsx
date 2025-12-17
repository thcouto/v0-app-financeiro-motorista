"use client"

import { Button } from "@/components/ui/button"
import { Calendar, CalendarDays, CalendarRange } from "lucide-react"

interface HistoryFiltersProps {
  currentFilter: "day" | "week" | "month" | "all"
  onFilterChange: (filter: "day" | "week" | "month" | "all") => void
}

export function HistoryFilters({ currentFilter, onFilterChange }: HistoryFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={currentFilter === "day" ? "default" : "outline"}
        onClick={() => onFilterChange("day")}
        className={
          currentFilter === "day"
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "border-slate-700 text-slate-300 hover:bg-slate-800"
        }
      >
        <Calendar className="h-4 w-4 mr-2" />
        Hoje
      </Button>
      <Button
        variant={currentFilter === "week" ? "default" : "outline"}
        onClick={() => onFilterChange("week")}
        className={
          currentFilter === "week"
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "border-slate-700 text-slate-300 hover:bg-slate-800"
        }
      >
        <CalendarDays className="h-4 w-4 mr-2" />
        Esta Semana
      </Button>
      <Button
        variant={currentFilter === "month" ? "default" : "outline"}
        onClick={() => onFilterChange("month")}
        className={
          currentFilter === "month"
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "border-slate-700 text-slate-300 hover:bg-slate-800"
        }
      >
        <CalendarRange className="h-4 w-4 mr-2" />
        Este Mês
      </Button>
      <Button
        variant={currentFilter === "all" ? "default" : "outline"}
        onClick={() => onFilterChange("all")}
        className={
          currentFilter === "all"
            ? "bg-emerald-600 hover:bg-emerald-700 text-white"
            : "border-slate-700 text-slate-300 hover:bg-slate-800"
        }
      >
        Todos
      </Button>
    </div>
  )
}
