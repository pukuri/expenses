import { Loader, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";

interface EventExpenseForm { 
  description: string;
  amount: number;
}

interface EventExpenseInputProps {
  eventId: number;
  onExpenseAdded: () => void;
}

export default function EventExpenseInput({ eventId, onExpenseAdded }: EventExpenseInputProps) {
  const [formData, setFormData] = useState<EventExpenseForm>({ description: '', amount: 0 });
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch(`/api/v1/events/${eventId}/expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: formData.description,
          amount: formData.amount
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setFormData({ description: '', amount: 0 });
      onExpenseAdded();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full p-4 mb-4 rounded-md bg-neutral-2 text-white">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
        <div className="md:w-1/2 flex flex-col">
          <Input 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Expense Description"
          />
        </div>
        <div className="md:w-1/2 flex flex-col">
          <Input 
            type="number"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) || 0 })} 
            placeholder="Amount"
          />
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
  );
}