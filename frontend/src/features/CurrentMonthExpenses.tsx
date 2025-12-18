import { useEffect, useState } from "react";
import AmountFormatter from "../utils/AmountFormatter";

export default function CurrentMonthExpenses() {
  const [amount, setAmount] = useState<number>(0)
  
  const fetchAmount = async (): Promise<void> => {
    try {
      const now = new Date()
      const year = now.getFullYear()
      const month = (now.getMonth() + 1).toString().padStart(2, '0')
      const day = now.getDate().toString().padStart(2, '0')
      const dateParams = `${year}-${month}-${day}`
      const response = await fetch("/api/v1/expenses_by_month?" + new URLSearchParams({
        date: dateParams
      }))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      setAmount(result.data.amount)
    } catch (err) {
      console.log(err)
    }
  }
  
  useEffect(() => {
    fetchAmount().catch(console.error)
  }, []);
  
  return (
    <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
      <p>Current Month Expenses</p>
      <h1 className="text-5xl font-bold mt-5">{AmountFormatter(amount)}</h1>
    </div>
  )
}