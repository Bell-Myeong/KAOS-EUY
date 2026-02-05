import type { ReactNode } from 'react';

interface StateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  details?: string;
  className?: string;
}

export function LoadingState({
  title,
  description,
  className,
}: StateProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 text-center ${className ?? ''}`.trim()}>
      <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-primary" />
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
  className,
}: StateProps) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-8 text-center ${className ?? ''}`.trim()}>
      <p className="text-lg font-semibold text-gray-700">{title}</p>
      {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  details,
  action,
  className,
}: StateProps) {
  return (
    <div className={`rounded-xl border border-red-200 bg-red-50 p-6 ${className ?? ''}`.trim()}>
      <p className="text-sm font-semibold text-red-700">{title}</p>
      {description && <p className="mt-2 text-sm text-red-600">{description}</p>}
      {details && <p className="mt-3 text-xs text-red-500 break-words">{details}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
