import { ReactNode } from 'react';
import { clsx } from 'clsx';
import { X } from 'lucide-react';

export interface TagProps {
  children: ReactNode;
  onRemove?: () => void;
  className?: string;
  variant?: 'default' | 'primary' | 'success';
}

const variantStyles = {
  default: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
  primary: 'bg-primary/10 text-primary hover:bg-primary/20',
  success: 'bg-accent/10 text-accent hover:bg-accent/20',
};

export function Tag({
  children,
  onRemove,
  className,
  variant = 'default',
}: TagProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        variantStyles[variant],
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
          aria-label="Remove tag"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </span>
  );
}
