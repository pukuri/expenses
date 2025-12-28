import type { ExpensesByMonthCategory } from '@/types';
import TodayDate from '@/utils/TodayDate';
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';


export default function CurrentMonthChart({ expenses }: { expenses: ExpensesByMonthCategory[] }) {
  ChartJS.register(
    ArcElement,
    Tooltip,
    Legend 
  )

  expenses = expenses.filter((d: ExpensesByMonthCategory) => d.name != 'Gajian')
  
  const options = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Chart.js Bar Chart in React',
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

  return (
    <div className='p-4'>
      <h1 className='text-2xl'>This Month Expenses by Category</h1>
      <h2 className='text-l text-chart-1'>{TodayDate()}</h2>
      <div className='pt-4 text-white max-h-[546px] m-auto'>
        <Doughnut options={options} data={data} />
      </div>
    </div>
  )
}