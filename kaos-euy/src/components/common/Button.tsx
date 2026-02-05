import { ButtonHTMLAttributes, ReactNode } from 'react';
import { clsx } from 'clsx';
import { Loader2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'outline'
  | 'ghost'
  | 'destructive';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-display font-bold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2';

  const variants: Record<ButtonVariant, string> = {
    primary:
      'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg',
    secondary:
      'bg-secondary text-white hover:bg-secondary/90 shadow-md hover:shadow-lg',
    accent: 'bg-accent text-white hover:bg-accent/90 shadow-md hover:shadow-lg',
    outline:
      'border-2 border-primary text-primary hover:bg-primary hover:text-white',
    ghost: 'text-gray-700 hover:bg-gray-100',
    destructive:
      'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg',
  };

  const sizes: Record<ButtonSize, string> = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && LeftIcon && <LeftIcon className="w-4 h-4" />}
      {children}
      {!loading && RightIcon && <RightIcon className="w-4 h-4" />}
    </button>
  );
}

export default Button;
