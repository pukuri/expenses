import { ChevronDownIcon, Loader, Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [categories, setCategories] = useState<Category[]>([ {id: 0, name: 'Uncategorized'} ]);
  const [date, setDate] = useState<Date | undefined>(undefined)
  
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
  
  return (
    inputReady && (
        <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
          <form onSubmit={handleSubmit} className="flex flex-row gap-2">
            <div className="w-3/12 flex flex-col">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="date"
                    className="justify-between font-normal"
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      const fDate = date?.toISOString().split('T')[0]
                      if(fDate) {
                        setFormData({ ...formData, date: fDate })
                      } 
                      setDate(date)
                    }}
                    className="w-52"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="w-3/12 flex flex-col">
              <Input 
                type="number" 
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })} 
                placeholder="Amount"
                required></Input>
            </div>
            <div className="w-3/12 flex flex-col">
              <Input 
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Description"
                required></Input>
            </div>
            <div className="w-3/12 flex flex-col">
              <Select
                value={JSON.stringify(formData.category_id)}
                onValueChange = {(value) => setFormData({ ...formData, category_id: Number(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map((cat) => (
                      <SelectItem key={JSON.stringify(cat.id) || '0'} value={JSON.stringify(cat.id)}>{cat.name}</SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Button variant="outline" size="icon" aria-label="Submit" disabled={loading} className="bg-primary">
                {loading ?
                  <Loader color="white" height={19}/> :
                  <Send color="white" height={19} />
                }
              </Button>
            </div>
          </form>
        </div>
      )
  )
}
