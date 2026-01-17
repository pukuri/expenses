import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import type { ChartDataByDate } from '@/types';
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

export default function ExpensesByMonths({ data }: { data: ChartDataByDate[] }) {
  const chartConfig = {
    amount: {
      label: "Amount",
      color: "#2563eb",
    },
  } satisfies ChartConfig
  
  data = data.map(d => ({ date: d.date.substring(0,7), amount: d.amount }))
  
  return (
    <div className="p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
      <p>Expenses Comparison by Months</p>
      <div className="flex flex-row mt-9">
        <ChartContainer config={chartConfig} className="aspect-auto h-50 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={true}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="amount" fill="var(--color-primary)" radius={4} />
          </BarChart>
        </ChartContainer>
      </div>
    </div>
  )
}
