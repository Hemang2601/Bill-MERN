import React from 'react';
import { cn } from '../../lib/utils';
import { PaymentStatus } from '../../types';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  status?: PaymentStatus;
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant,
  status,
  children,
  ...props
}) => {
  let appliedVariant = variant || 'default';

  if (status) {
    if (status === 'PAID') appliedVariant = 'success';
    else if (status === 'PARTIAL') appliedVariant = 'warning';
    else if (status === 'UNPAID') appliedVariant = 'danger';
  }

  const variants = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        variants[appliedVariant],
        className
      )}
      {...props}
    >
      {children || status}
    </span>
  );
};
