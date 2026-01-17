import SummaryLayout from '@/features/SummaryLayout';
import { monthlyChartDataSample } from '@/data/monthlyChartDataSample';
import { expensesByMonthCategory12MonthsSample } from '@/data/expensesByMonthCategory12MonthsSample';

function SampleSummary() {
  return (
    <SummaryLayout
      isSample={true}
      monthlyData={monthlyChartDataSample}
      monthlyExpenses={expensesByMonthCategory12MonthsSample}
    />
  );
}

export default SampleSummary;
