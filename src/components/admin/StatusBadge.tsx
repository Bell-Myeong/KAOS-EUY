'use client';

type OrderStatus = 'pending' | 'processing' | 'printing' | 'shipped' | 'completed' | 'cancelled';

interface StatusBadgeProps {
  status: OrderStatus;
}

const statusConfig: Record<OrderStatus, { label: string; className: string }> = {
  pending: {
    label: 'Pending',
    className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  },
  processing: {
    label: 'Processing',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  printing: {
    label: 'Printing',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
  },
  shipped: {
    label: 'Shipped',
    className: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-100 text-green-800 border-green-200',
  },
  cancelled: {
    label: 'Cancelled',
    className: 'bg-red-100 text-red-800 border-red-200',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
