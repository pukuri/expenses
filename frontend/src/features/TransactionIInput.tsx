import { Loader } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

interface Category { 
  id: number | undefined; 
  name: string; 
}
interface Transaction { 
  amount: number; 
  description: string; 
  category_id: number; 
  date: string;
}

export default function TransactionInput({ fetchTransactions }: { fetchTransactions: () => void }) {
  const [formData, setFormData] = useState<Transaction>({ amount: 0, description: '', category_id: 0, date: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [inputReady, setInputReady] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([ {id: undefined, name: 'Uncategorized'} ]);
  
  const fetchCategories = async(): Promise<void> => {
    const response = await fetch("/api/v1/categories")
    try {
      if(!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const result = await response.json()
      setCategories([...categories, ...result.data])
      setInputReady(true)
    } catch (err) {
      console.error(err)
    }
  }
  
  useEffect(() => {
    fetchCategories().catch(console.error)
  }, [])
  
  const handleSubmit = async (e: FormEvent) => {
    try {
      e.preventDefault()
      setLoading(true)
      const response = await fetch('/api/v1/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const result = await response.json()
      setFormData({ ...formData, amount: 0, description: '', category_id: 0 })
      fetchTransactions()
      console.log('Success:', result);
    } finally {
      setLoading(false)
    }
  }
  
  const inputStyle = "w-full px-2 py-1 border border-gray-600 rounded-md focus:border-blue-500 text-sm my-2"

  return (
    inputReady && (
        <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
          <form onSubmit={handleSubmit} className="flex flex-row gap-2">
            <div className="w-2/12 flex flex-col">
              <label className="text-xs">Date</label>
              <input 
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                className={inputStyle}
                required></input>
            </div>
            <div className="w-3/12 flex flex-col">
              <label className="text-xs">Amount</label>
              <input 
                type="number" 
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })} 
                className={inputStyle}
                required></input>
            </div>
            <div className="w-3/12 flex flex-col">
              <label className="text-xs">Description</label>
              <input 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                className={inputStyle}
                required></input>
            </div>
            <div className="w-3/12 flex flex-col">
              <label className="text-xs">Category</label>
              <select 
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })} 
                className={inputStyle + ' h-[30px]'}>
                {categories.map((cat) => (
                  <option key={cat.id || 0} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="w-1/12">
              <button type="submit" className="bg-green-600 p-2 w-full rounded-sm mt-4 flex items-center justify-center" disabled={loading}>
                {loading ? <Loader color="white" height={19}/> : "Submit" }
              </button>
            </div>
          </form>
        </div>
      )
  )
}
