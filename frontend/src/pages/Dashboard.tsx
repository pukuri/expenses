import { useEffect, useState } from 'react'
import '../App.css'
import MainTable from '../features/MainTable'
import TransactionInput from '../features/TransactionIInput'
import CurrentBalance from '../features/CurrentBalance';
import CurrentMonthExpenses from '../features/CurrentMonthExpenses';
import { useAuth } from '../contexts/AuthContext';
import LastDateBalance from '../features/LastDateBalance';
import LastMonthExpenses from '../features/LastMonthExpenses';

interface NullString {
  String: string;
  Valid: boolean;
}

interface Transaction {
  id: number;
  date: string;
  amount: number;
  running_balance: number;
  description: string;
  category_name: NullString;
  category_color: NullString;
}

interface TransactionsResponse {
  data: Transaction[];
}

function Dashboard() {
  const [data, setData] = useState<TransactionsResponse>({ data: [] })
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
  }, []);
  
  const cardStyle = 'rounded-md border-1 border-gray-800'

  return (
    <div className="pb-10 bg-background">
      <div className='flex flex-col'>
        <button className='text-white text-left ml-5 mt-5' onClick={handleLogout}>Logout</button>
        <h1 className='m-5 text-xl text-white'>Welcome, {user?.name}</h1>
        <div className='mx-5 flex flex-row gap-5'>
          <div className={cardStyle}>
            <CurrentBalance data={data}/> 
          </div>
          <div className={cardStyle}>
            <CurrentMonthExpenses /> 
          </div>
          <div className={cardStyle}>
            <LastDateBalance /> 
          </div>
          <div className={cardStyle}>
            <LastMonthExpenses /> 
          </div>
        </div>
        <div className={`h-180 overflow-scroll static w-2/3 mx-5 mt-5 ${cardStyle}`}>
          <MainTable data={data} />
        </div>
        <div className={`w-2/3 mx-5 mt-5 ${cardStyle}`}>
          <TransactionInput fetchTransactions={fetchTransactions} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
