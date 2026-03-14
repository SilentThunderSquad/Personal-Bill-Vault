import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PlusCircle, Receipt } from 'lucide-react';

export function QuickActions() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap gap-3">
      <Button onClick={() => navigate('/bills/new')} className="bg-accent hover:bg-accent/90">
        <PlusCircle className="h-4 w-4 mr-2" />
        Add New Bill
      </Button>
      <Button variant="outline" onClick={() => navigate('/bills')}>
        <Receipt className="h-4 w-4 mr-2" />
        View All Bills
      </Button>
    </div>
  );
}
