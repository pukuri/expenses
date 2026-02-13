import { ChevronDownIcon, Loader, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

interface EventForm { 
  title: string;
  description: string; 
  date: string;
}

interface EventInputProps {
  refetch: () => void;
}

export default function EventInput({ refetch }: EventInputProps) {
  const [formData, setFormData] = useState<EventForm>({ title: '', description: '', date: '' });
  const [loading, setLoading] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(undefined);
  
  const handleSubmit = async (e: FormEvent): Promise<void> => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await fetch('/api/v1/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.title,
          description: formData.description,
          date: formData.date
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      setFormData({ title: '', description: '', date: '' });
      setDate(undefined);
      refetch();
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="w-full p-4 bottom-0 right-0 rounded-md bg-neutral-2 text-white">
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2">
        <div className="md:w-4/12 flex flex-col">
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
        <div className="md:w-4/12 flex flex-col">
          <Input 
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
            placeholder="Event Title"
          />
        </div>
        <div className="md:w-4/12 flex flex-col">
          <Input 
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
            placeholder="Event Description"
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
