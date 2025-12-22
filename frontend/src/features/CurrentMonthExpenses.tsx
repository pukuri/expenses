import { useEffect, useState, type SetStateAction } from "react";
import AmountFormatter from "../utils/AmountFormatter";
import { Badge } from "@/components/ui/badge";
import PercentageBadge from "@/components/percentageBadge";
import TodayDate from "@/utils/TodayDate";
import LastDate from "@/utils/LastDate";

export default function CurrentMonthExpenses() {
  const [currentAmount, setCurrentAmount] = useState<number>(0)
  const [lastAmount, setLastAmount] = useState<number>(0)
  
  const fetchAmount = async (dateParams: string, callback: { (value: SetStateAction<number>): void; }): Promise<void> => {
    try {
      const response = await fetch("/api/v1/expenses_by_month?" + new URLSearchParams({
        date: dateParams
      }))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      callback(result.data.amount)
    } catch (err) {
      console.log(err)
    }
  }
  
  const fetchCurrentAmount = async (): Promise<void> => {
    const dateParams = TodayDate()
    fetchAmount(dateParams, setCurrentAmount)
  }
  
  const fetchLastAmount = async(): Promise<void> => {
    const dateParams = LastDate()
    fetchAmount(dateParams, setLastAmount)
  }
  
  useEffect(() => {
    fetchCurrentAmount().catch(console.error)
    fetchLastAmount().catch(console.error)
  }, []);

  const renderBadgeSub = () => {
    if (currentAmount > lastAmount) {
      return <p className="text-xs text-chart-1">Your expenses this month is higher than last month</p>
    } else if (currentAmount < lastAmount) {
      return <p className="text-xs text-chart-1">Your expenses this month is lower than last month</p>
    } else {
      return <p className="text-xs text-chart-1">Your expenses this month is the same as last month</p>
    }
  }
  
  return (
    <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
      <div className="flex flex-row justify-between mb-4">
        <p>This Month Expenses</p>
        <Badge
          variant="secondary"
          className="bg-primary text-white font-medium text-xs"
        > 
          <PercentageBadge current={currentAmount} last={lastAmount} />
        </Badge>
      </div>
      {renderBadgeSub()}
      <h1 className="text-4xl font-bold mt-2">{AmountFormatter(currentAmount)}</h1>
    </div>
  )
}