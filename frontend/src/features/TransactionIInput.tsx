import { Loader, Send } from "lucide-react";
import { useState, type FormEvent } from "react";

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

export default function TransactionInput() {
  const [formData, setFormData] = useState<Transaction>({ amount: 0, description: '', category_id: 0, date: '' });
  const [loading, setLoading] = useState(false);
  const [categories] = useState<Category[]>([
    {id: undefined, name: 'Uncategorized'}, { id: 1, name: 'Foods' }, { id: 2, name: 'Investment' }, { id: 18, name: 'Groceries' }
  ]);
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
      setFormData({ ...formData, amount: 0, description: '', category_id: 1 })  // Reset except date
      console.log('Success:', result);
    } finally {
      setLoading(false)
    }
  }
  
  const inputStyle = "w-full px-2 py-1 border border-gray-600 rounded-md focus:border-blue-500 text-sm my-2"

  return (
    <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white drop-shadow-lg">
      <form onSubmit={handleSubmit} className="flex flex-row gap-2">
        <div className="w-2/12 flex flex-col">
          <label className="text-xs">Date</label>
          <input 
            type="date" 
            onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
            className={inputStyle}
            required></input>
        </div>
        <div className="w-2/12 flex flex-col">
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
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            className={inputStyle}
            required></input>
        </div>
        <div className="w-3/12 flex flex-col">
          <label className="text-xs">Category</label>
          <select 
            onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
            className={inputStyle}>
            {categories.map((cat) => (
              <option key={cat.id || 0} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div className="w-2/12">
          <button type="submit" className="bg-green-600 p-2 w-full rounded-sm mt-4" disabled={loading}>
            {loading ? <Loader color="white" height={19}/> : <Send color="white" height={19}/> }
          </button>
        </div>
      </form>
    </div>
  )
}