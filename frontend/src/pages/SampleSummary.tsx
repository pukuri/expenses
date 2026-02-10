import SummaryLayout from '@/features/SummaryLayout';
import { monthlyChartDataSample } from '@/data/monthlyChartDataSample';

function SampleSummary() {
  return (
    <SummaryLayout
      isSample={true}
      monthlyData={monthlyChartDataSample}
    />
  );
}

export default SampleSummary;
