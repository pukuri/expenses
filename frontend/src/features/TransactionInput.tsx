import { ChevronDownIcon, Loader, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/types";

interface TransactionForm { 
  amount: number; 
  description: string; 
  category_id: number; 
  date: string;
}

interface TransactionInputProps {
 categories: Category[]; 
 isSample: boolean; 
 fetchTransactions: () => void;
}

export default function TransactionInput({ categories, isSample, fetchTransactions }: TransactionInputProps) {
  const [formData, setFormData] = useState<TransactionForm>({ amount: 0, description: '', category_id: 0, date: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(undefined)
  
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault()

    if (isSample) { return }

    try {
      setLoading(true)
      const response = await fetch('/api/v1/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      setFormData({ ...formData, amount: 0, description: '', category_id: 0 })
      fetchTransactions()
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
        <div className="md:w-3/12 flex flex-col">
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
                  if (date) {
                    const offset = date?.getTimezoneOffset()
                    const timzoneDate = new Date(date.getTime() - (offset*60*1000))
                    const fDate = timzoneDate.toISOString().split('T')[0]
                    if(fDate) {
                      setFormData({ ...formData, date: fDate })
                    } 
                    setDate(date)
                  }
                }}
                className="w-52"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="md:w-3/12 flex flex-col">
          <Input 
            type="number" 
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })} 
            placeholder="Amount"
            required></Input>
        </div>
        <div className="md:w-3/12 flex flex-col">
          <Input 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Description"
            required></Input>
        </div>
        <div className="md:w-3/12 flex flex-col">
          <Select
            value={JSON.stringify(formData.category_id)}
            onValueChange = {(value) => setFormData({ ...formData, category_id: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={JSON.stringify(cat.id) || '0'} value={JSON.stringify(cat.id)}>
                  {cat.name} <span style={{ color: cat?.color }}>•</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Button type="submit" variant="outline" size="icon" aria-label="Submit" name="Submit" disabled={loading} className="bg-primary">
            {loading ?
              <Loader color="white" height={19}/> :
              <Send color="white" height={19} />
            }
          </Button>
        </div>
      </form>
    </div>
  )
}
