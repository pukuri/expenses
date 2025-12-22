import { useEffect, useState } from "react";
import AmountFormatter from "../utils/AmountFormatter";
import { Badge } from "@/components/ui/badge";
import PercentageBadge from "@/components/percentageBadge";
import LastDate from "@/utils/LastDate";

interface NullString {
  String: string;
  Valid: boolean;
}

interface Transaction {
  id: number;
  date: string;
  amount: number;
  running_balance: number;
  description: string;
  category_name: NullString;
  category_color: NullString;
}

interface TransactionsResponse {
  data: Transaction[];
}

export default function CurrentBalance(data: { data: TransactionsResponse }) {
  const [lastBalance, setLastBalance] = useState<number>(0)
  const currentBalance = data.data.data[0]?.running_balance
  
  const dateParams = LastDate()
  const fetchLastDateBalance = async (): Promise<void> => {
    try {
      const response = await fetch("/api/v1/balance_by_date?" + new URLSearchParams({
        date: dateParams
      }))
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      setLastBalance(result.data.amount)
    } catch (err) {
      console.error(err)
    }
  }
  
  useEffect(() => {
    fetchLastDateBalance().catch(console.error)
  }, [])

  const renderBadgeSub = () => {
    if (currentBalance > lastBalance) {
      return <p className="text-xs text-chart-1">Your current balance this date is higher than last month</p>
    } else if (currentBalance < lastBalance) {
      return <p className="text-xs text-chart-1">Your current balance this date is lower than last month</p>
    } else {
      return <p className="text-xs text-chart-1">Your current balance this date is the same as last month</p>
    }
  }

  return (
    <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
      <div className="flex flex-row justify-between mb-4">
        <p>Current Balance</p>
        <Badge
          variant="secondary"
          className="bg-primary text-white font-medium text-xs"
        > 
          <PercentageBadge current={currentBalance} last={lastBalance} />
        </Badge>
      </div>
      {renderBadgeSub()}
      <h1 className="text-4xl font-bold mt-2">{AmountFormatter(data.data.data[0]?.running_balance)}</h1>
    </div>
  ) 
}
