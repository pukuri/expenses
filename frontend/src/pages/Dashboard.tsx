import { useEffect, useState } from 'react'
import '../App.css'
import MainTable from '../features/MainTable'
import TransactionInput from '../features/TransactionIInput'
import CurrentBalance from '../features/CurrentBalance';
import CurrentMonthExpenses from '../features/CurrentMonthExpenses';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import ExpensesByMonthCategory from '@/features/ExpensesByMonthCategory';
import type { Category, TransactionsResponse } from '@/types';

function Dashboard() {
  const [data, setData] = useState<TransactionsResponse>({ data: [] })
  const [categories, setCategories] = useState<Category[]>([ {id: 0, name: 'Uncategorized', color: ''} ])
  const { user } = useAuth()
  
  const fetchTransactions = async (): Promise<void> => {
    try {
      const response = await fetch("/api/v1/transactions")
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      setData(result)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchCategories = async (): Promise<void> => {
    const response = await fetch("/api/v1/categories")
    try {
      if(!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      setCategories(result.data)
    } catch (err) {
      console.error(err)
    }
  }
  
  
  const handleLogout = async (): Promise<void> => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: 'POST',
        credentials: 'include'
      })

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err)
    } 
  }
  
  useEffect(() => {
    fetchTransactions().catch(console.error)
    fetchCategories().catch(console.error)
  }, []);
  
  const cardStyle = 'rounded-md border-1 border-secondary w-1/4'

  return (
    <div className='h-full'>
      <div className="pb-10 bg-background">
        <div className='flex flex-col'>
          <div className='flex p-5 justify-between'>
            <div className='flex flex-row'>
              <img src={user?.picture} className='rounded-full' alt="profile picture" referrerPolicy="no-referrer" width={36}/>
              <h1 className='text-xl text-foreground ml-4 pt-1'>Welcome, {user?.name}</h1>
            </div>
            <Button size="sm" onClick={handleLogout}><LogOut /> Logout</Button>
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
            <MainTable data={data} categories={categories} fetchTransactions={fetchTransactions} />
          </div>
          <div className={`w-2/3 mx-5 mt-5 ${cardStyle}`}>
            <TransactionInput categories={categories} isSample={false} fetchTransactions={fetchTransactions} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
