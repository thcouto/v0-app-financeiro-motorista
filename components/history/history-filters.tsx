"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, CalendarDays, CalendarRange, CalendarClock } from "lucide-react"

interface HistoryFiltersProps {
  currentFilter: "day" | "week" | "month" | "all" | "custom"
  onFilterChange: (filter: "day" | "week" | "month" | "all" | "custom") => void
  startDate?: string
  endDate?: string
  onDateRangeChange?: (start: string, end: string) => void
}

export function HistoryFilters({
  currentFilter,
  onFilterChange,
  startDate,
  endDate,
  onDateRangeChange,
}: HistoryFiltersProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
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
          variant={currentFilter === "custom" ? "default" : "outline"}
          onClick={() => onFilterChange("custom")}
          className={
            currentFilter === "custom"
              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
              : "border-slate-700 text-slate-300 hover:bg-slate-800"
          }
        >
          <CalendarClock className="h-4 w-4 mr-2" />
          Intervalo
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

      {currentFilter === "custom" && onDateRangeChange && (
        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date" className="text-slate-200">
                Data Inicial
              </Label>
              <Input
                id="start_date"
                type="date"
                value={startDate || ""}
                onChange={(e) => onDateRangeChange(e.target.value, endDate || "")}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end_date" className="text-slate-200">
                Data Final
              </Label>
              <Input
                id="end_date"
                type="date"
                value={endDate || ""}
                onChange={(e) => onDateRangeChange(startDate || "", e.target.value)}
                className="bg-slate-800 border-slate-700 text-white"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">O intervalo é inclusivo (data inicial e final contam)</p>
        </div>
      )}
    </div>
  )
}
