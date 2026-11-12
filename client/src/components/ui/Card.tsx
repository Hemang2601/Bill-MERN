import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  children,
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-[#E8ECF3] rounded-xl p-5 shadow-[0_2px_12px_-2px_rgba(15,23,42,0.04)]',
        hoverEffect && 'transition-all duration-200 hover:shadow-[0_8px_24px_-4px_rgba(15,23,42,0.08)] hover:border-[#D4DCED]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
