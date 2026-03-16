import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { WarrantyBadge } from './WarrantyBadge';
import { formatDate, formatCurrency, getDaysRemaining } from '@/utils/formatters';
import { ArrowLeft, Trash2, Edit2, Calendar, Store, Tag, Receipt, CreditCard, Clock, FileText, ZoomIn, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Bill } from '@/types';

interface BillDetailViewProps {
  bill: Bill;
  onDelete: () => void;
  onEdit: () => void;
}

export function BillDetailView({ bill, onDelete, onEdit }: BillDetailViewProps) {
  const navigate = useNavigate();
  const days = getDaysRemaining(bill.warranty_expiry);
  const [imageZoom, setImageZoom] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl mx-auto space-y-4 sm:space-y-6"
    >
      <div className="flex items-center justify-between flex-wrap gap-3 sm:gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5 h-9">
            <Edit2 className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete} className="gap-1.5 h-9">
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <CardTitle className="text-xl sm:text-2xl break-words">{bill.product_name}</CardTitle>
              {bill.brand && <p className="text-muted-foreground mt-1">{bill.brand}</p>}
            </div>
            <WarrantyBadge expiryDate={bill.warranty_expiry} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <DetailRow icon={CreditCard} label="Price" value={formatCurrency(bill.price, bill.currency)} />
            <DetailRow icon={Store} label="Store" value={bill.store_name} />
            <DetailRow icon={Calendar} label="Purchase Date" value={formatDate(bill.purchase_date)} />
            <DetailRow
              icon={Clock}
              label="Warranty Expiry"
              value={`${formatDate(bill.warranty_expiry)} (${days >= 0 ? `${days} days left` : 'Expired'})`}
            />
            <DetailRow icon={Tag} label="Category" value={bill.category} />
            <DetailRow icon={Receipt} label="Invoice #" value={bill.invoice_number || 'N/A'} />
            <DetailRow icon={Clock} label="Warranty Period" value={`${bill.warranty_period_months} months`} />
            <DetailRow icon={FileText} label="Added" value={formatDate(bill.created_at)} />
          </div>

          {bill.notes && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-2">Notes</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{bill.notes}</p>
              </div>
            </>
          )}

          {bill.bill_image_url && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-foreground mb-3">Bill Image</p>
                <div className="relative group">
                  <img
                    src={bill.bill_image_url}
                    alt={`Bill for ${bill.product_name}`}
                    className="max-w-full rounded-lg border border-border cursor-pointer transition-transform hover:scale-[1.02]"
                    onClick={() => setImageZoom(true)}
                  />
                  <button
                    onClick={() => setImageZoom(true)}
                    className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Zoom image"
                  >
                    <ZoomIn className="h-4 w-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Image Zoom Modal */}
      <AnimatePresence>
        {imageZoom && bill.bill_image_url && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setImageZoom(false)}
          >
            <button
              onClick={() => setImageZoom(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close zoom"
            >
              <X className="h-6 w-6 text-white" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={bill.bill_image_url}
              alt={`Bill for ${bill.product_name}`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium text-foreground break-words">{value}</p>
      </div>
    </div>
  );
}
