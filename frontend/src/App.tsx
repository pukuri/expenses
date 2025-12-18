import { useEffect, useState } from 'react'
import './App.css'
import MainTable from './features/MainTable'
import TransactionInput from './features/TransactionIInput'

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

function App() {
  const [data, setData] = useState<TransactionsResponse>({ data: [] })
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

  useEffect(() => {
    fetchTransactions().catch(console.error);
  }, []);

  return (
    <div className="h-screen bg-background">
      <div className='flex flex-col'>
        <h1 className='m-5 text-xl text-white'>Welcome!</h1>
        <div className='h-180 overflow-scroll static mx-5 w-2/3 rounded-md drop-shadow-xl'>
          <MainTable data={data} />
        </div>
        <div className="m-5 w-2/3 rounded-md drop-shadow-xl">
          <TransactionInput fetchTransactions={fetchTransactions} />
        </div>
      </div>
      {/* <div className="bg-red-200 w-1/3 p-4">Div 1</div> */}
    </div>
  )
}

export default App
