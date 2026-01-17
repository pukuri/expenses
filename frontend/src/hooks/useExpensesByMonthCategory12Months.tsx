import { useEffect, useState } from "react"
import type { ExpensesByMonthCategory } from "@/types"
import type { MonthlyExpensesByCategory } from "@/data/expensesByMonthCategory12MonthsSample"

export const useExpensesByMonthCategory12Months = () => {
  const [monthlyExpenses, setMonthlyExpenses] = useState<MonthlyExpensesByCategory[]>([])
  
  const generatePast12Months = (): string[] => {
    const today = new Date()
    const months: string[] = []
    
    for (let i = 0; i <= 11; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`
      months.push(monthStr)
    }
    
    return months
  }

  const fetchExpensesForMonth = async (month: string): Promise<ExpensesByMonthCategory[]> => {
    try {
      const response = await fetch("/api/v1/expenses_by_month_category?" + new URLSearchParams({
        date: `${month}-01`
      }))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      return result.data || []
    } catch (err) {
      console.error(`Error fetching expenses for ${month}:`, err)
      return []
    }
  }
  
  const fetchAllMonthlyExpenses = async (): Promise<void> => {
    try {
      const months = generatePast12Months()
      const monthlyData: MonthlyExpensesByCategory[] = []
      
      for (const month of months) {
        const expenses = await fetchExpensesForMonth(month)
        if (expenses.length > 0) {
          monthlyData.push({
            date: month,
            expenses: expenses
          })
        }
      }
      
      setMonthlyExpenses(monthlyData)
    } catch (err) {
      console.error("Error fetching monthly expenses:", err)
    }
  }
  
  useEffect(() => {
    fetchAllMonthlyExpenses()
  }, [])
  
  return { monthlyExpenses }
}
