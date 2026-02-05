import { clsx } from 'clsx';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
}: SkeletonProps) {
  return (
    <div
      className={clsx(
        'bg-gray-200',
        animation === 'pulse' && 'animate-pulse',
        variant === 'text' && 'rounded h-4',
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-lg',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-4">
      <Skeleton variant="rectangular" height={200} />
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
      <div className="flex gap-2">
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
        <Skeleton variant="circular" width={32} height={32} />
      </div>
    </div>
  );
}
