import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import NavigationMenu from './NavigationMenu';

interface HeaderProps {
  user?: User | null;
  isSample: boolean;
}

export default function Header({ user, isSample }: HeaderProps) {
  const handleLogout = async (): Promise<void> => {
    if (isSample) {
      window.location.href = '/'
    }

    try {
      const response = await fetch("/api/auth/logout", {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className='flex p-5 justify-between'>
      <div className='flex flex-row items-center gap-4'>
        <NavigationMenu />
        <img 
          src={isSample ? '/images/profileImage.png' : user?.picture} 
          className='rounded-full' 
          alt="profile picture" 
          referrerPolicy="no-referrer" 
          width={36}
        />
        <h1 className='text-xl text-foreground'>Welcome, {isSample ? 'Guest' : user?.name}</h1>
      </div>
      <Button size="sm" onClick={handleLogout}>
        <LogOut /> Logout
      </Button>
    </div>
  );
}
