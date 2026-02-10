import type { User, ChartDataByDate } from '@/types';
import Header from './Header';
import ExpensesByMonths from './ExpensesByMonths';
import ExpensesByMonthCategory from './ExpensesByMonthCategory';
import { useExpensesByMonthCategory } from '@/hooks/useExpensesByMonthCategory';
import { getSampleExpensesForMonth } from '@/data/sampleMonthlyExpenses';

interface SummaryLayoutProps {
  user?: User | null;
  isSample: boolean;
  monthlyData: ChartDataByDate[];
}

// Component for individual month expenses
function MonthlyExpenseItem({ month, isSample }: { month: string; isSample: boolean }) {
  // Always call the hook but it will skip API calls when isSample is true
  const { expenses: apiExpenses, loading, error } = useExpensesByMonthCategory({ month, isSample });
  
  const cardStyle = 'rounded-md border-1 border-secondary';

  // Use sample data if in sample mode, otherwise use API data
  const expenses = isSample ? getSampleExpensesForMonth(month) : apiExpenses;

  // For sample mode, don't show loading or error states
  if (isSample) {
    if (expenses.length === 0) {
      return null; // Don't render anything for months with no expenses
    }

    return (
      <div className='w-full md:w-[calc(33.333%-0.833rem)] lg:w-[calc(33.333%-0.833rem)]'>
        <div className={`h-150 ${cardStyle}`}>
          <ExpensesByMonthCategory expenses={expenses} date={month} />
        </div>
      </div>
    );
  }

  // For real mode, show loading and error states

  if (loading) {
    return (
      <div className='w-full md:w-[calc(33.333%-0.833rem)] lg:w-[calc(33.333%-0.833rem)]'>
        <div className={`h-150 ${cardStyle} flex items-center justify-center`}>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='w-full md:w-[calc(33.333%-0.833rem)] lg:w-[calc(33.333%-0.833rem)]'>
        <div className={`h-150 ${cardStyle} flex items-center justify-center`}>
          <div className="text-center">
            <p className="text-red-400">Failed to load</p>
            <p className="text-gray-400 text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return null; // Don't render anything for months with no expenses
  }

  return (
    <div className='w-full md:w-[calc(33.333%-0.833rem)] lg:w-[calc(33.333%-0.833rem)]'>
      <div className={`h-150 ${cardStyle}`}>
        <ExpensesByMonthCategory expenses={expenses} date={month} />
      </div>
    </div>
  );
}

export default function SummaryLayout({ user, isSample, monthlyData }: SummaryLayoutProps) {
  const cardStyle = 'rounded-md border-1 border-secondary';
  
  // Generate past 12 months - use hardcoded date for sample mode, dynamic for real mode
  const generatePast12Months = (isSample: boolean): string[] => {
    // Use fixed date for sample mode to prevent drift, current date for real mode
    const baseDate = isSample 
      ? new Date(2026, 1, 28) // February 28, 2026 (month is 0-indexed) for sample
      : new Date() // Current date for real mode
    
    const months: string[] = []
    
    for (let i = 0; i <= 11; i++) {
      const date = new Date(baseDate.getFullYear(), baseDate.getMonth() - i + 1, 0)
      const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`
      months.push(dateStr)
    }
    
    return months
  }

  const months = generatePast12Months(isSample);

  return (
    <div className='h-full'>
      <div className="pb-10 mx-auto max-w-420">
        <div className='flex flex-col'>
          <Header user={user} isSample={isSample} />
          
          <div className='mx-5 flex flex-col gap-5 mt-5'>
            <div className={`w-full ${cardStyle}`}>
              <ExpensesByMonths data={monthlyData} />
            </div>
          </div>

          <div className='mx-5 mt-5'>
            <h2 className='text-xl font-semibold mb-4'>Expenses by Category - Past 12 Months</h2>
            <div className='flex flex-wrap gap-5'>
              {months.map((month) => (
                <MonthlyExpenseItem key={month} month={month} isSample={isSample} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
