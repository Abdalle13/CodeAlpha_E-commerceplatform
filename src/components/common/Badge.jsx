import React from 'react';
import { cn } from '../../utils/cn';

export const Badge = ({
  children,
  variant = 'default',
  size = 'sm',
  className,
  ...props
}) => {
  const variants = {
    default: 'bg-soft-beige text-charcoal border-transparent',
    charcoal: 'bg-charcoal text-white border-transparent',
    olive: 'bg-muted-olive/15 text-muted-olive border-muted-olive/20',
    outline: 'bg-transparent text-charcoal border-charcoal/30',
    success: 'bg-status-success/10 text-status-success border-status-success/20',
    warning: 'bg-status-warning/10 text-status-warning border-status-warning/20',
    danger: 'bg-status-error/10 text-status-error border-status-error/20',
    new: 'bg-charcoal text-white font-semibold tracking-wider-brand',
    sale: 'bg-status-error text-white font-semibold',
  };

  const sizes = {
    xs: 'text-[10px] px-2 py-0.5 font-medium tracking-wider uppercase',
    sm: 'text-xs px-2.5 py-0.5 font-medium tracking-wide uppercase',
    md: 'text-sm px-3 py-1 font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xs border transition-colors select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
