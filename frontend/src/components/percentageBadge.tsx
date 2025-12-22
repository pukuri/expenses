import { calculateBalancePercentage } from "@/utils/CalculatePercentage";
import { TrendingUp, TrendingDown, EqualApproximately } from "lucide-react";
import type { ReactElement } from "react";

export default function PercentageBadge({current, last} : {current: number, last: number}): ReactElement {
  if (current > last) {
    return <><TrendingUp size="16" />&nbsp;{calculateBalancePercentage(last, current)}%</>;
  } else if (current < last) {
    return <><TrendingDown size="16"/>&nbsp;{calculateBalancePercentage(last, current)}%</>;
  } else {
    return <><EqualApproximately size="16"/>&nbsp;{calculateBalancePercentage(last, current)}%</>;
  }
}