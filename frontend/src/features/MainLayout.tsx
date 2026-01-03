import MainTable from './MainTable';
import TransactionInput from './TransactionInput';
import CurrentBalance from './CurrentBalance';
import CurrentMonthExpenses from './CurrentMonthExpenses';
import type { Category, ExpensesByMonthCategory, MonthlyChartData, TransactionsResponse, User } from '@/types';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import CurrentMonthChart from './CurrentMonthChart';
import ExpensesByMonths from './ExpensesByMonths';

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
  monthlyChartData: MonthlyChartData[];
}

export default function MainLayout({ data, categories, user, isSample, currentAmount, lastAmount, currentBalance, lastBalance, fetchTransactions, expensesByMonthCategory, monthlyChartData }: MainLayoutProps) {
  const cardStyle = 'rounded-md border-1 border-secondary';

  const handleLogout = async (): Promise<void> => {
    if (isSample) {
      window.location.href = '/'
    }

    try {
      const response = await fetch("/api/auth/logout", {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='h-full'>
      <div className="pb-10 mx-auto max-w-420">
        <div className='flex flex-col'>
          <div className='flex p-5 justify-between'>
            <div className='flex flex-row'>
              <img src={isSample ? '/images/profileImage.png' : user?.picture} className='rounded-full' alt="profile picture" referrerPolicy="no-referrer" width={36}/>
              <h1 className='text-xl text-foreground ml-4 pt-1'>Welcome, {isSample ? 'Guest' : user?.name}</h1>
            </div>
            <Button size="sm" onClick={handleLogout}><LogOut /> Logout</Button>
          </div>
          <div className='mx-5 flex flex-row gap-5'>
            <div className='flex flex-col gap-5 w-1/4'>
              <div className={cardStyle}>
                <CurrentBalance currentBalance={currentBalance} lastBalance={lastBalance} />
              </div>
              <div className={cardStyle}>
                <CurrentMonthExpenses currentAmount={currentAmount} lastAmount={lastAmount} />
              </div>
            </div>
            <div className={'w-3/4 '+`${cardStyle}`}>
              <ExpensesByMonths data={monthlyChartData} />
            </div>
          </div>
          <div className='flex flex-row px-5 gap-5'>
            <div className='flex flex-col w-2/3 mt-5'>
              <div className={`h-180 overflow-scroll ${cardStyle}`}>
                <MainTable isSample={isSample} data={data} categories={categories} fetchTransactions={fetchTransactions} />
              </div>
              <div className={`mt-5 ${cardStyle}`}>
                <TransactionInput categories={categories} isSample={isSample} fetchTransactions={fetchTransactions} />
              </div>
            </div>
            <div className='flex flex-col w-1/3 mt-5'>
              <div className={`h-180 ${cardStyle}`}>
                <CurrentMonthChart expenses={expensesByMonthCategory}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
