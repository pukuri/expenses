import { useState } from 'react';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEventExpenses } from '@/hooks/useEventExpenses';
import type { EventSummary } from '@/types';
import AmountFormatter from '@/utils/AmountFormatter';
import DateConverter from '@/utils/DateConverter';
import EventExpenseInput from './EventExpenseInput';

interface EventCardProps {
  event: EventSummary;
  isSample: boolean;
}

export default function EventCard({ event, isSample }: EventCardProps) {
  const [hasLoadedExpenses, setHasLoadedExpenses] = useState(false);
  const { expenses, loading, error, fetchEventExpenses } = useEventExpenses(isSample);

  const handleAccordionChange = async (value: string) => {
    const isOpening = value === event.id.toString();
    
    if (isOpening && !hasLoadedExpenses) {
      await fetchEventExpenses(event.id);
      setHasLoadedExpenses(true);
    }
  };

  return (
    <div className="rounded-md border-1 border-secondary bg-neutral-2 text-white">
      <Accordion 
        type="single" 
        collapsible 
        onValueChange={handleAccordionChange}
      >
        <AccordionItem value={event.id.toString()} className="border-none">
          <AccordionTrigger className="px-6 py-4 hover:no-underline text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full pr-4">
              <div className="flex flex-col items-start gap-2">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-primary text-white font-medium text-xs">
                    {DateConverter(event.date)}
                  </Badge>
                  <h3 className="text-lg font-semibold text-left text-white">
                    {event.name}
                  </h3>
                </div>
                <p className="text-chart-1 text-left text-sm">
                  {event.description}
                </p>
              </div>
              <div className="mt-2 md:mt-0">
                <div className="text-lg font-bold text-right text-white">
                  {AmountFormatter(event.totalExpenses)}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-4">
            {!isSample && (
              <EventExpenseInput 
                eventId={event.id} 
                onExpenseAdded={() => fetchEventExpenses(event.id)}
              />
            )}
            
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="text-chart-1">Loading expenses...</div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">
                Error loading expenses: {error}
              </div>
            ) : (expenses && expenses.length === 0) ? (
              <div className="text-chart-1 text-center py-4">
                No expenses found for this event
              </div>
            ) : (
              <Table>
                <TableHeader className="bg-muted">
                  <TableRow>
                    <TableHead className="text-foreground">Description</TableHead>
                    <TableHead className="text-right text-foreground">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses && expenses.map((expense) => (
                    <TableRow key={expense.id} className="text-white">
                      <TableCell className="font-medium text-white">
                        {expense.description}
                      </TableCell>
                      <TableCell className="text-right text-white">
                        {AmountFormatter(expense.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}