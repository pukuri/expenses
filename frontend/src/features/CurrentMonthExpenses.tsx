import AmountFormatter from "../utils/AmountFormatter";
import { Badge } from "@/components/ui/badge";
import PercentageBadge from "@/components/percentageBadge";

interface CurrentMonthExpensesProps {
  currentAmount: number;
  lastAmount: number;
}

export default function CurrentMonthExpenses({ currentAmount, lastAmount }: CurrentMonthExpensesProps) {
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
