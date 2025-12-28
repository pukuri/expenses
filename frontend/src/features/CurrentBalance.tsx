import PercentageBadge from "@/components/percentageBadge";
import AmountFormatter from "../utils/AmountFormatter";
import { Badge } from "@/components/ui/badge";

interface CurrentBalanceProps {
  currentBalance: number;
  lastBalance: number;
}

export default function CurrentBalance({ currentBalance, lastBalance }: CurrentBalanceProps) {
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
      <h1 className="text-4xl font-bold mt-2">{AmountFormatter(currentBalance)}</h1>
    </div>
  ) 
}
