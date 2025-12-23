import { useAuth } from '../contexts/AuthContext';
import { useTransactions } from '@/hooks/useTransactions';
import { useCategories } from '@/hooks/useCategories';
import { useCurrentMonthExpenses } from '@/hooks/useCurrentMonthExpenses';
import { useLastBalance } from '@/hooks/useLastBalance';
import { MainLayout } from '@/features/MainLayout';

function Dashboard() {
  const { user } = useAuth();
  const { data, fetchTransactions } = useTransactions();
  const { categories } = useCategories();
  const { currentAmount, lastAmount } = useCurrentMonthExpenses();
  const { lastBalance } = useLastBalance();

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
    />
  );
}

export default Dashboard;
