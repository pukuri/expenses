import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/features/EventCard';
import EventInput from '@/features/EventInput';

interface EventsListProps {
  isSample: boolean;
}

export default function EventsList({ isSample }: EventsListProps) {
  const { events, loading, error, refetch } = useEvents(isSample);

  if (loading) {
    return (
      <div className="mx-5 flex justify-center items-center py-8">
        <div className="text-chart-1">Loading events...</div>
      </div>
    );
  }

  return (
    <div className="mx-5 flex flex-col gap-5">
      {!isSample && (
        <div className="rounded-md border-1 border-secondary">
          <EventInput refetch={refetch} />
        </div>
      )}
      
      <div className="flex flex-col gap-4">
        {error ? (
          <div className="text-center py-8 text-red-500">
            Error loading events: {error}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-chart-1">
            No events found
          </div>
        ) : (
          events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              isSample={isSample} 
            />
          ))
        )}
      </div>
    </div>
  );
}