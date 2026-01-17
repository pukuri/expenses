import type { User, ChartDataByDate } from '@/types';
import type { MonthlyExpensesByCategory } from '@/data/expensesByMonthCategory12MonthsSample';
import Header from './Header';
import ExpensesByMonths from './ExpensesByMonths';
import ExpensesByMonthCategory from './ExpensesByMonthCategory';

interface SummaryLayoutProps {
  user?: User | null;
  isSample: boolean;
  monthlyData: ChartDataByDate[];
  monthlyExpenses: MonthlyExpensesByCategory[];
}

export default function SummaryLayout({ user, isSample, monthlyData, monthlyExpenses }: SummaryLayoutProps) {
  const cardStyle = 'rounded-md border-1 border-secondary';

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
              {monthlyExpenses.map((monthData, index) => (
                <div key={index} className='w-full md:w-[calc(33.333%-0.833rem)] lg:w-[calc(33.333%-0.833rem)]'>
                  <div className={`h-150 ${cardStyle}`}>
                    <ExpensesByMonthCategory 
                      expenses={monthData.expenses} 
                      date={monthData.date} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
