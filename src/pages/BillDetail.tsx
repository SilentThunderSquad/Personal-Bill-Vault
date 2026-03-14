import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBills } from '@/hooks/useBills';
import { BillDetailView } from '@/components/bills/BillDetailView';
import { DeleteConfirmDialog } from '@/components/bills/DeleteConfirmDialog';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { toast } from 'sonner';
import type { Bill } from '@/types';

export default function BillDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchBill, deleteBill } = useBills();
  const [bill, setBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchBill(id)
      .then(setBill)
      .catch(() => toast.error('Bill not found'))
      .finally(() => setLoading(false));
  }, [id, fetchBill]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteBill(id);
      toast.success('Bill deleted');
      navigate('/bills');
    } catch {
      toast.error('Failed to delete bill');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner />
      </div>
    );
  }

  if (!bill) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Bill not found</p>
      </div>
    );
  }

  return (
    <>
      <BillDetailView bill={bill} onDelete={() => setDeleteOpen(true)} />
      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        productName={bill.product_name}
      />
    </>
  );
}
