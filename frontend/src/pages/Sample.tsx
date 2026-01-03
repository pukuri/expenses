import MainLayout from '@/features/MainLayout';
import { transactionSample } from '@/data/transactionSample';
import { categorySample } from '@/data/categoriesSample';
import type { Category, ExpensesByMonthCategory, MonthlyChartData, TransactionsResponse } from '@/types';
import { expensesByMonthCategorySample } from '@/data/expensesByMonthCategorySample';
import { monthlyChartDataSample } from '@/data/monthlyChartDataSample';

function Sample() {
  const data: TransactionsResponse = { data: transactionSample };
  const categories: Category[] = categorySample;
  const expensesByMonthCategory: ExpensesByMonthCategory[] = expensesByMonthCategorySample;
  const monthlyChartData: MonthlyChartData[] = monthlyChartDataSample

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
      monthlyChartData={monthlyChartData}
    />
  );
}

export default Sample;
