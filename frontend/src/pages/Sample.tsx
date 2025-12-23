import '../App.css'
import MainTable from '../features/MainTable'
import TransactionInput from '../features/TransactionIInput'
import CurrentBalance from '../features/CurrentBalance';
import CurrentMonthExpenses from '../features/CurrentMonthExpenses';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import ExpensesByMonthCategory from '@/features/ExpensesByMonthCategory';
import { transactionSample } from '@/data/transactionSample';
import type { Category, TransactionsResponse } from '@/types';
import { categorySample } from '@/data/categoriesSample';
import profileImage from '../assets/profileSample.png'

function Sample() {
  const data: TransactionsResponse = { data: transactionSample }
  const categories: Category[] = categorySample
  
  const cardStyle = 'rounded-md border-1 border-secondary w-1/4'

  return (
    <div className='h-full'>
      <div className="pb-10 bg-background">
        <div className='flex flex-col'>
          <div className='flex p-5 justify-between'>
            <div className='flex flex-row'>
              <img src={profileImage} className='rounded-full' alt="profile picture" referrerPolicy="no-referrer" width={36}/>
              <h1 className='text-xl text-foreground ml-4 pt-1'>Welcome, Guest</h1>
            </div>
            <Button size="sm"><LogOut /> Logout</Button>
          </div>
          <div className='mx-5 flex flex-row gap-5'>
            <div className={cardStyle}>
              <CurrentBalance data={data}/> 
            </div>
            <div className={cardStyle}>
              <CurrentMonthExpenses /> 
            </div>
            <div className={cardStyle}>
              <ExpensesByMonthCategory categories={categories} /> 
            </div>
          </div>
          <div className={`h-180 overflow-scroll w-2/3 mx-5 mt-5 ${cardStyle}`}>
            <MainTable data={data} categories={categories} fetchTransactions={() => {}} />
          </div>
          <div className={`w-2/3 mx-5 mt-5 ${cardStyle}`}>
            <TransactionInput categories={categories} isSample={true} fetchTransactions={() => {}} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sample
