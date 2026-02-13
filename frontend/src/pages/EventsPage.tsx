import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import type { User } from '@/types';
import Header from '../features/Header';
import EventsList from '../features/EventsList';

function EventsPageContent({ user }: { user: User }) {
  return (
    <div className='h-full'>
      <div className="pb-10 mx-auto max-w-420">
        <div className='flex flex-col'>
          <Header user={user} isSample={false} />
          <EventsList isSample={false} />
        </div>
      </div>
    </div>
  );
}

function EventsPage() {
  const { user, fetchUser } = useAuth();
  const [loading, setLoading] = useState(true);

  const checkUser = async () => {
    await fetchUser();
    setLoading(false);
  };

  useEffect(() => {
    checkUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <EventsPageContent user={user} />;
}

export default EventsPage;