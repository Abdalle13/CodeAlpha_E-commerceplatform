import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

export const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  icon: Icon,
  iconPosition = 'left',
  onClick,
  ...props
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-charcoal disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary: 'bg-charcoal text-white hover:bg-black active:bg-black/90 shadow-sm',
    secondary: 'bg-soft-beige/70 text-charcoal hover:bg-soft-beige active:bg-soft-beige/90 border border-soft-beige',
    outline: 'border border-charcoal/30 text-charcoal hover:border-charcoal hover:bg-charcoal/5',
    olive: 'bg-muted-olive text-white hover:bg-[#666a54] active:bg-[#5b5e4b]',
    ghost: 'text-charcoal hover:bg-charcoal/5',
    danger: 'bg-status-error text-white hover:bg-[#8e2e2e]',
    white: 'bg-white text-charcoal hover:bg-warm-ivory shadow-sm border border-soft-beige',
  };

  const sizes = {
    sm: 'text-xs px-3.5 py-1.5 rounded-sm tracking-wider-brand uppercase gap-1.5',
    md: 'text-sm px-5 py-2.5 rounded-sm tracking-wide gap-2',
    lg: 'text-base px-7 py-3.5 rounded-sm tracking-wide gap-2.5',
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      whileTap={disabled || isLoading ? undefined : { scale: 0.98 }}
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4" />}
        </>
      )}
    </motion.button>
  );
});

Button.displayName = 'Button';

