import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98] select-none';

    const variants = {
      primary:
        'bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-[#2563EB] shadow-sm hover:shadow',
      secondary:
        'bg-[#172554] text-white hover:bg-[#0f172a] focus:ring-[#172554] shadow-sm',
      outline:
        'border border-[#E8ECF3] bg-white text-[#111827] hover:bg-[#F8FAFC] hover:border-[#D4DCED] focus:ring-[#2563EB]',
      ghost:
        'text-[#64748B] hover:text-[#111827] hover:bg-[#F1F5F9] focus:ring-slate-300',
      danger:
        'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500 shadow-sm',
      success:
        'bg-[#10B981] text-white hover:bg-[#059669] focus:ring-[#10B981] shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-5 py-3 gap-2.5',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && <span className="shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
