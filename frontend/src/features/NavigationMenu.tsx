import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Table, PieChart } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export default function NavigationMenu() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Detect if we're in sample mode
  const isSampleMode = location.pathname.includes('/sample');
  const isOnSummaryPage = location.pathname.includes('/summary');
  
  // Determine base routes based on mode
  const tableRoute = isSampleMode ? '/sample' : '/dashboard';
  const summaryRoute = isSampleMode ? '/sample/summary' : '/dashboard/summary';
  
  const handleNavigateToTable = () => {
    navigate(tableRoute);
  };
  
  const handleNavigateToSummary = () => {
    navigate(summaryRoute);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <Menu className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem 
          onClick={handleNavigateToTable}
          className={!isOnSummaryPage ? "bg-accent" : ""}
        >
          <Table className="mr-2 h-4 w-4" />
          Main Table
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleNavigateToSummary}
          className={isOnSummaryPage ? "bg-accent" : ""}
        >
          <PieChart className="mr-2 h-4 w-4" />
          Monthly Summary
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
