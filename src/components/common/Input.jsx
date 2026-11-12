import React from 'react';
import { cn } from '../../utils/cn';

export const Input = React.forwardRef(({
  label,
  error,
  helperText,
  id,
  type = 'text',
  className,
  containerClassName,
  icon: Icon,
  required,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={cn('w-full flex flex-col space-y-1.5', containerClassName)}>
      {label && (
        <label 
          htmlFor={inputId} 
          className="text-xs font-medium uppercase tracking-wider-brand text-charcoal/80 flex items-center justify-between"
        >
          <span>{label}</span>
          {required && <span className="text-status-error ml-1">*</span>}
        </label>
      )}
      
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-muted-text">
            <Icon className="w-4 h-4" />
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={cn(
            'w-full bg-white text-charcoal text-sm rounded-sm px-3.5 py-2.5 border transition-all duration-150',
            'placeholder:text-muted-text/60 focus:outline-none focus:ring-1',
            Icon ? 'pl-10' : 'pl-3.5',
            error 
              ? 'border-status-error focus:border-status-error focus:ring-status-error' 
              : 'border-soft-beige focus:border-charcoal focus:ring-charcoal',
            className
          )}
          {...props}
        />
      </div>

      {error ? (
        <p className="text-xs text-status-error font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-muted-text">{helperText}</p>
      ) : null}
    </div>
  );
});

Input.displayName = 'Input';

