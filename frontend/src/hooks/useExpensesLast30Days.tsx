import type { ChartDataByDate } from "@/types"
import { useEffect, useState } from "react"

export const useExpensesLast30Days = () => {
  const [expenses, setExpenses] = useState<ChartDataByDate[]>([])

  const fetchExpenses = async (): Promise<void> => {
    try {
      const response = await fetch("/api/v1/expenses_last_30_days")
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