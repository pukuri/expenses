import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useCurrentMonthExpenses } from '@/hooks/useCurrentMonthExpenses';
import { useLastBalance } from '@/hooks/useLastBalance';
import { Navigate } from 'react-router-dom';
import { useExpensesByMonthCategories } from '@/hooks/useExpensesByMonthCategory';
import type { User } from '@/types';
import { useExpensesLast30Days } from '@/hooks/useExpensesLast30Days';
import Header from '@/features/Header';
import MainLayout from '@/features/MainLayout';

function DashboardTableContent({ user }: { user: User }) {
  const { data, fetchTransactions } = useTransactions();
  const { categories } = useCategories();
  const { currentAmount, lastAmount } = useCurrentMonthExpenses();
  const { lastBalance } = useLastBalance();
  const { expenses: expensesByMonthCategory } = useExpensesByMonthCategories();
  const { expenses: dailyChartData } = useExpensesLast30Days();

  const currentBalance = data.data[0]?.running_balance ?? 0;

  return (
    <div className='h-full'>
      <div className="pb-10 mx-auto max-w-420">
        <div className='flex flex-col'>
          <Header user={user} isSample={false} />
          <MainLayout
            data={data}
            categories={categories}
            user={user}
            isSample={false}
            currentAmount={currentAmount}
            lastAmount={lastAmount}
            currentBalance={currentBalance}
            lastBalance={lastBalance}
            fetchTransactions={fetchTransactions}
            expensesByMonthCategory={expensesByMonthCategory}
            dailyChartData={dailyChartData}
          />
        </div>
      </div>
    </div>
  );
}

function DashboardTable() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    await fetchUser();
    setLoading(false);
  };

  useEffect(() => {
    checkUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <DashboardTableContent user={user} />;
}

export default DashboardTable;
