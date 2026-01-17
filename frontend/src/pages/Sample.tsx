import MainLayout from '@/features/MainLayout';
import { transactionSample } from '@/data/transactionSample';
import { categorySample } from '@/data/categoriesSample';
import type { Category, ExpensesByMonthCategory, ChartDataByDate, TransactionsResponse } from '@/types';
import { expensesByMonthCategorySample } from '@/data/expensesByMonthCategorySample';
import { last30DaysChartDataSample } from '@/data/last30DaysChartDataSample';

function Sample() {
  const data: TransactionsResponse = { data: transactionSample };
  const categories: Category[] = categorySample;
  const expensesByMonthCategory: ExpensesByMonthCategory[] = expensesByMonthCategorySample;
  const dailyChartData: ChartDataByDate[] = last30DaysChartDataSample

  return (
    <MainLayout
      data={data}
      categories={categories}
      isSample={true}
      currentAmount={14000000}
      lastAmount={8000000}
      currentBalance={data.data[0].running_balance}
      lastBalance={13275000}
      fetchTransactions={() => {}}
      expensesByMonthCategory={expensesByMonthCategory}
      dailyChartData={dailyChartData}
    />
  );
}

export default Sample;
