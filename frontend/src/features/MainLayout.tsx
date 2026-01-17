import MainTable from './MainTable';
import TransactionInput from './TransactionInput';
import CurrentBalance from './CurrentBalance';
import CurrentMonthExpenses from './CurrentMonthExpenses';
import type { Category, ExpensesByMonthCategory, ChartDataByDate, TransactionsResponse, User } from '@/types';
import CurrentMonthChart from './CurrentMonthChart';
import ExpensesLast30Days from './ExpensesLast30Days';

interface MainLayoutProps {
  data: TransactionsResponse;
  categories: Category[];
  user?: User | null;
  isSample: boolean;
  currentAmount: number;
  lastAmount: number;
  currentBalance: number;
  lastBalance: number;
  fetchTransactions: () => void;
  expensesByMonthCategory: ExpensesByMonthCategory[];
  dailyChartData: ChartDataByDate[];
}

export default function MainLayout({ data, categories, isSample, currentAmount, lastAmount, currentBalance, lastBalance, fetchTransactions, expensesByMonthCategory, dailyChartData }: MainLayoutProps) {
  const cardStyle = 'rounded-md border-1 border-secondary';

  return (
    <>
      <div className='mx-5 flex flex-col md:flex-row gap-5'>
        <div className='flex flex-col gap-5 w-full md:w-1/4'>
          <div className={cardStyle}>
            <CurrentBalance currentBalance={currentBalance} lastBalance={lastBalance} />
          </div>
          <div className={cardStyle}>
            <CurrentMonthExpenses currentAmount={currentAmount} lastAmount={lastAmount} />
          </div>
        </div>
        <div className={'w-full md:w-3/4 '+`${cardStyle}`}>
          <ExpensesLast30Days data={dailyChartData} />
        </div>
      </div>
      <div className='flex flex-col md:flex-row px-5 gap-5'>
        <div className='flex flex-col w-full md:w-2/3 mt-5'>
          <div className={`h-180 overflow-scroll ${cardStyle}`}>
            <MainTable isSample={isSample} data={data} categories={categories} fetchTransactions={fetchTransactions} />
          </div>
          <div className={`mt-5 ${cardStyle}`}>
            <TransactionInput categories={categories} isSample={isSample} fetchTransactions={fetchTransactions} />
          </div>
        </div>
        <div className='flex flex-col w-full md:w-1/3 md:mt-5'>
          <div className={`h-180 ${cardStyle}`}>
            <CurrentMonthChart expenses={expensesByMonthCategory}/>
          </div>
        </div>
      </div>
    </>
  );
};
