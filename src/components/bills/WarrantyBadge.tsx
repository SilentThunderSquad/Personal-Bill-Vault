import { getWarrantyStatus } from '@/utils/formatters';
import { WARRANTY_STATUSES } from '@/utils/constants';

interface WarrantyBadgeProps {
  expiryDate: string;
}

export function WarrantyBadge({ expiryDate }: WarrantyBadgeProps) {
  const status = getWarrantyStatus(expiryDate);
  const info = WARRANTY_STATUSES[status];
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${info.color}`}>
      {info.label}
    </span>
  );
}
