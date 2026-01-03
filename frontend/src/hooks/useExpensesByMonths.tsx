import type { MonthlyChartData } from "@/types"
import TodayDate from "@/utils/TodayDate"
import { useEffect, useState } from "react"

export const useExpensesByMonths = () => {
  const [expenses, setExpenses] = useState<MonthlyChartData[]>([])

  const fetchExpenses = async (): Promise<void> => {
    try {
      const response = await fetch("/api/v1/expenses_by_months?" + new URLSearchParams({
        date: TodayDate()
      }))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      setExpenses(result.data)
    } catch (err) {
      console.error(err)
    }
  }
  
  useEffect(() => {
    fetchExpenses()
  }, [])
  
  return { expenses }

}