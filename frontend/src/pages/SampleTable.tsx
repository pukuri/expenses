import MainLayout from '@/features/MainLayout';
import Header from '@/features/Header';
import { transactionSample } from '@/data/transactionSample';
import { categorySample } from '@/data/categoriesSample';
import type { TransactionsResponse } from '@/types';
import { expensesByMonthCategorySample } from '@/data/expensesByMonthCategorySample';
import { last30DaysChartDataSample } from '@/data/last30DaysChartDataSample';

function SampleTable() {
  const data: TransactionsResponse = { data: transactionSample };

  return (
    <div className='h-full'>
      <div className="pb-10 mx-auto max-w-420">
        <div className='flex flex-col'>
          <Header isSample={true} />
          <MainLayout
            data={{ data: transactionSample }}
            categories={categorySample}
            isSample={true}
            currentAmount={14000000}
            lastAmount={8000000}
            currentBalance={data.data[0].running_balance}
            lastBalance={13275000}
            fetchTransactions={() => {}}
            expensesByMonthCategory={expensesByMonthCategorySample}
            dailyChartData={last30DaysChartDataSample}
          />
        </div>
      </div>
    </div>
  );
}

export default SampleTable;
