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
}

export default function TransactionInput() {
  const [formData, setFormData] = useState<Transaction>({ amount: 0, description: '', category_id: 0 });
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
      setFormData({ amount: 0, description: '', category_id: 1 })  // Reset
      console.log('Success:', result);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute bottom-0 p-10 w-2/3">
      <div className="w-full p-4 bottom-0 right-0 rounded-md bg-yellow-50 drop-shadow-lg">
        <form onSubmit={handleSubmit} className="flex flex-row gap-2">
          <div className="w-3/10 flex flex-col">
            <label className="text-xs">Amount</label>
            <input 
              type="number" 
              onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })} 
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-blue-500 text-sm"
              required></input>
          </div>
          <div className="w-3/10 flex flex-col">
            <label className="text-xs">Description</label>
            <input 
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-blue-500 text-sm"
              required></input>
          </div>
          <div className="w-3/10 flex flex-col">
            <label className="text-xs">Category</label>
            <select 
              onChange={(e) => setFormData({ ...formData, category_id: Number(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:border-blue-500 text-sm">
              {categories.map((cat) => (
                <option key={cat.id || 0} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="w-1/10">
            <button type="submit" className="bg-green-600 p-2 w-full rounded-sm" disabled={loading}>
              {loading ? <Loader color="white"/> : <Send color="white"/> }
            </button>
          </div>
        </form>
      </div>
      
    </div>
  )
}