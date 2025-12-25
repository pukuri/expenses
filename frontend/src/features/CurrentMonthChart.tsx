import type { Category } from '@/types';
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

export default function CurrentMonthChart({ categories, expenses }: { categories: Category[], expenses: number[] }) {
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
        text: 'Chart.js Bar Chart in React',
      },
    },
  };
  
  const data = {
    labels: categories.map((c) => ( c.name )),
    datasets: [
      {
        label: 'Total expenses',
        data: expenses,
        backgroundColor: categories.map((c) => ( c.color )),
        borderColor: '#0b0809',
        hoverBorderColor: '#fff',
      }
    ],
  };

  return (
    <div className='p-4'>
      <h1 className='text-2xl'>This Month Expenses by Category</h1>
      <div className='pt-4 text-white'>
        <Pie options={options} data={data}/>
      </div>
    </div>
  )
}