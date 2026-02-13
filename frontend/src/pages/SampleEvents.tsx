import Header from '@/features/Header';
import EventsList from '@/features/EventsList';

function SampleEvents() {
  return (
    <div className='h-full'>
      <div className="pb-10 mx-auto max-w-420">
        <div className='flex flex-col'>
          <Header isSample={true} />
          <EventsList isSample={true} />
        </div>
      </div>
    </div>
  );
}

export default SampleEvents;