import { clsx } from 'clsx';

export interface SeparatorProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export function Separator({
  orientation = 'horizontal',
  className,
}: SeparatorProps) {
  return (
    <div
      className={clsx(
        'bg-gray-200',
        orientation === 'horizontal' ? 'h-px w-full' : 'w-px h-full',
        className
      )}
      role="separator"
      aria-orientation={orientation}
    />
  );
}
