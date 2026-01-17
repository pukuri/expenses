import type { ExpensesByMonthCategory } from '@/types';
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

interface ExpensesByMonthCategoryProps {
  expenses: ExpensesByMonthCategory[];
  date: string;
}

export default function ExpensesByMonthCategory({ expenses, date }: ExpensesByMonthCategoryProps) {
  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend 
  )

  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Expenses by Category',
      },
    },
  };
  
  const data = {
    labels: expenses.map((e) => ( e.name )),
    datasets: [
      {
        label: 'Total expenses',
        data: expenses.map((e) => ( e.amount )),
        backgroundColor: expenses.map((e) => ( e.color )),
        borderColor: '#0b0809',
        hoverBorderColor: '#fff',
      }
    ],
  };

  // Format date for display (e.g., "2024-01" -> "January 2024")
  const formatDate = (dateStr: string): string => {
    const [year, month] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <div className='p-4'>
      <h1 className='text-2xl'>{formatDate(date)}</h1>
      <div className='pt-4 text-white max-h-136.5 m-auto'>
        <Doughnut options={options} data={data} />
      </div>
    </div>
  )
}
