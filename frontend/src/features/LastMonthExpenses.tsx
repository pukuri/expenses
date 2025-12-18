import { useEffect, useState } from "react";
import AmountFormatter from "../utils/AmountFormatter";

export default function LastMonthExpenses() {
  const [balance, setBalance] = useState<number>(0)
  
  const now = new Date()
  const year = now.getFullYear()
  const lastMonth = now.getMonth() == 0 ? 11 : now.getMonth() - 1 
  const month = (lastMonth + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  const dateParams = `${year}-${month}-${day}`
  const fetchLastDateBalance = async (): Promise<void> => {
    try {
      const response = await fetch("/api/v1/expenses_by_month?" + new URLSearchParams({
        date: dateParams
      }))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      setBalance(result.data.amount)
    } catch (err) {
      console.error(err)
    }
  }
  
  useEffect(() => {
    fetchLastDateBalance().catch(console.error)
  }, [])
  
  return (
    <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
      <p>Last Month Expenses</p>
      <h1 className="text-5xl font-bold mt-5">{AmountFormatter(balance)}</h1>
    </div>
  )
}