import MainLayout from '@/features/MainLayout';
import { transactionSample } from '@/data/transactionSample';
import { categorySample } from '@/data/categoriesSample';
import type { Category, TransactionsResponse } from '@/types';

function Sample() {
  const data: TransactionsResponse = { data: transactionSample };
  const categories: Category[] = categorySample;

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
      expensesByMonthCategory={[1000000,2500000,1300000,4000000]}
    />
  );
}

export default Sample;
