import type { ExpensesByMonthCategory } from "@/types"
import TodayDate from "@/utils/TodayDate"
import { useEffect, useState } from "react"

// Original hook for current month expenses
export const useExpensesByMonthCategories = () => {
  const [expenses, setExpenses] = useState<ExpensesByMonthCategory[]>([])

  const fetchExpenses = async (): Promise<void> => {
    try {
      const response = await fetch("/api/v1/expenses_by_month_category?" + new URLSearchParams({
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

// New hook for specific month expenses
interface UseExpensesByMonthCategoryParams {
  month: string; // Format: YYYY-MM-DD or YYYY-MM
  isSample?: boolean; // Skip API calls if true
}

export const useExpensesByMonthCategory = ({ month, isSample = false }: UseExpensesByMonthCategoryParams) => {
  const [expenses, setExpenses] = useState<ExpensesByMonthCategory[]>([])
  const [loading, setLoading] = useState(!isSample) // Don't show loading for sample mode
  const [error, setError] = useState<string | null>(null)

  const fetchExpenses = async (): Promise<void> => {
    if (isSample) {
      // Skip API call for sample mode
      return;
    }

    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch("/api/v1/expenses_by_month_category?" + new URLSearchParams({
        date: month
      }))
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json()
      setExpenses(result.data || [])
    } catch (err) {
      console.error(`Error fetching expenses for ${month}:`, err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setExpenses([])
    } finally {
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (month && !isSample) {
      fetchExpenses()
    }
  }, [month, isSample])
  
  return { expenses, loading, error }
}
