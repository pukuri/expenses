import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useCurrentMonthExpenses } from '@/hooks/useCurrentMonthExpenses';
import { useLastBalance } from '@/hooks/useLastBalance';
import { Navigate } from 'react-router-dom';
import MainLayout from '@/features/MainLayout';
import { useExpensesByMonthCategories } from '@/hooks/useExpensesByMonthCategory';
import type { User } from '@/types';
import { useExpensesByMonths } from '@/hooks/useExpensesByMonths';

function DashboardContent({ user }: { user: User }) {
  const { data, fetchTransactions } = useTransactions();
  const { categories } = useCategories();
  const { currentAmount, lastAmount } = useCurrentMonthExpenses();
  const { lastBalance } = useLastBalance();
  const { expenses: expensesByMonthCategory } = useExpensesByMonthCategories();
  const { expenses: monthlyChartData } = useExpensesByMonths();

  const currentBalance = data.data[0]?.running_balance ?? 0;

  return (
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
      monthlyChartData={monthlyChartData}
    />
  );
}

function Dashboard() {
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

  return <DashboardContent user={user} />;
}

export default Dashboard;
