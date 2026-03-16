import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBills } from '@/hooks/useBills';
import { BillCard } from '@/components/bills/BillCard';
import { EmptyState } from '@/components/common/EmptyState';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PRODUCT_CATEGORIES } from '@/utils/constants';
import { getWarrantyStatus } from '@/utils/formatters';
import { PlusCircle, Search, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import type { WarrantyStatus } from '@/types';

export default function Bills() {
  const { bills, loading, fetchBills } = useBills();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState<WarrantyStatus | 'all'>('all');

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const filtered = bills.filter((bill) => {
    const matchesSearch = !search ||
      bill.product_name.toLowerCase().includes(search.toLowerCase()) ||
      bill.brand?.toLowerCase().includes(search.toLowerCase()) ||
      bill.store_name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'all' || bill.category === category;
    const matchesStatus = status === 'all' || getWarrantyStatus(bill.warranty_expiry) === status;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading && bills.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Bills</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{bills.length} bills stored</p>
        </div>
        <Button onClick={() => navigate('/bills/new')} className="bg-accent hover:bg-accent/90 w-full sm:w-auto h-11 text-base">
          <PlusCircle className="h-5 w-5 mr-2" />
          Add Bill
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={category} onValueChange={(v) => v && setCategory(v)}>
            <SelectTrigger className="w-full sm:w-44 h-11">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {PRODUCT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => v && setStatus(v as WarrantyStatus | 'all')}>
            <SelectTrigger className="w-full sm:w-40 h-11">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={bills.length === 0 ? 'No bills yet' : 'No bills match your filters'}
          description={bills.length === 0 ? 'Add your first bill to start tracking warranties' : 'Try adjusting your search or filters'}
          actionLabel={bills.length === 0 ? 'Add Your First Bill' : undefined}
          onAction={bills.length === 0 ? () => navigate('/bills/new') : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map((bill, index) => (
            <motion.div
              key={bill.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <BillCard bill={bill} onClick={() => navigate(`/bills/${bill.id}`)} />
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
