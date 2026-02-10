import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import SummaryLayout from '@/features/SummaryLayout';
import { useExpensesByMonths } from '@/hooks/useExpensesByMonths';
import type { User } from '@/types';

function DashboardSummaryContent({ user }: { user: User }) {
  const { expenses: monthlyData } = useExpensesByMonths();

  return (
    <SummaryLayout
      user={user}
      isSample={false}
      monthlyData={monthlyData}
    />
  );
}

function DashboardSummary() {
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

  return <DashboardSummaryContent user={user} />;
}

export default DashboardSummary;
