import MainTable from './MainTable';
import TransactionInput from './TransactionIInput';
import CurrentBalance from './CurrentBalance';
import CurrentMonthExpenses from './CurrentMonthExpenses';
import ExpensesByMonthCategory from './ExpensesByMonthCategory';
import type { Category, TransactionsResponse, User } from '@/types';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import profileImage from '../assets/profileSample.png'

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
}

export const MainLayout = ({ data, categories, user, isSample, currentAmount, lastAmount, currentBalance, lastBalance, fetchTransactions }: MainLayoutProps) => {
  const cardStyle = 'rounded-md border-1 border-secondary w-1/4';

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
      <div className="pb-10 bg-background">
        <div className='flex flex-col'>
          <div className='flex p-5 justify-between'>
            <div className='flex flex-row'>
              <img src={isSample ? profileImage : user?.picture} className='rounded-full' alt="profile picture" referrerPolicy="no-referrer" width={36}/>
              <h1 className='text-xl text-foreground ml-4 pt-1'>Welcome, {isSample ? 'Guest' : user?.name}</h1>
            </div>
            <Button size="sm" onClick={handleLogout}><LogOut /> Logout</Button>
          </div>
          <div className='mx-5 flex flex-row gap-5'>
            <div className={cardStyle}>
              <CurrentBalance currentBalance={currentBalance} lastBalance={lastBalance} />
            </div>
            <div className={cardStyle}>
              <CurrentMonthExpenses currentAmount={currentAmount} lastAmount={lastAmount} />
            </div>
            { !isSample && (
              <div className={cardStyle}>
                <ExpensesByMonthCategory categories={categories} />
              </div>
            )}
          </div>
          <div className={`h-180 overflow-scroll w-2/3 mx-5 mt-5 ${cardStyle}`}>
            <MainTable data={data} categories={categories} fetchTransactions={fetchTransactions} />
          </div>
          <div className={`w-2/3 mx-5 mt-5 ${cardStyle}`}>
            <TransactionInput categories={categories} isSample={isSample} fetchTransactions={fetchTransactions} />
          </div>
        </div>
      </div>
    </div>
  );
};
