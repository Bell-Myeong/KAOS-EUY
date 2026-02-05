import { forwardRef, InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className, ...props }, ref) => {
    return (
      <label
        className={clsx(
          'flex items-start gap-3 cursor-pointer group',
          props.disabled && 'cursor-not-allowed opacity-60',
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <div
            className={clsx(
              'w-5 h-5 rounded border-2 transition-all duration-200',
              'peer-checked:bg-primary peer-checked:border-primary',
              'peer-focus:ring-2 peer-focus:ring-primary/20 peer-focus:ring-offset-0',
              'group-hover:border-primary/60',
              !props.disabled && 'border-gray-300',
              props.disabled && 'bg-gray-100 border-gray-300'
            )}
          >
            <Check
              className={clsx(
                'w-4 h-4 text-white transition-all duration-200',
                'scale-0 peer-checked:scale-100'
              )}
              strokeWidth={3}
            />
          </div>
        </div>

        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <span className="text-sm font-medium text-gray-700">
                {label}
              </span>
            )}
            {description && (
              <span className="text-sm text-gray-500">{description}</span>
            )}
          </div>
        )}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
