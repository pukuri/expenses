import type { Category } from "@/types"
import TodayDate from "@/utils/TodayDate"
import { useEffect, useState } from "react"

export const useExpensesByMonthCategories = ({ categories }: { categories: Category[] }) => {
  const [expenses, setExpenses] = useState<number[]>([])
  
  const fetchExpenses = async (catId: number): Promise<number> => {
    try {
      const response = await fetch("/api/v1/expenses_by_month_category?" + new URLSearchParams({
        date: TodayDate(),
        category_id: JSON.stringify(catId)
      }))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      return result.data.amount
    } catch (err) {
      console.error(err)
      return 0
    }
  }

  const fetchAllExpenses = async (): Promise<void> => {
    try {
      const expensePromises = categories.map(category => fetchExpenses(category.id))
      const resolvedExpenses = await Promise.all(expensePromises)
      setExpenses(resolvedExpenses)
    } catch (err) {
      console.error(err) 
    }
  }
    
  
  useEffect(() => {
    if (categories.length > 0) {
      fetchAllExpenses();
    }
  }, [categories])
  
  return { expenses }
}