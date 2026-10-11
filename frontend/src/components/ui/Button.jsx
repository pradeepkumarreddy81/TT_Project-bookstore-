import React, { forwardRef } from 'react';
import { cn } from '@/utils/cn';

const Button = forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      disabled = false,
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-sans transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-terracotta disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      primary:
        'bg-terracotta hover:bg-terracotta-hover text-paper-light border border-terracotta active:scale-[0.99] shadow-sm',
      secondary:
        'bg-forest hover:bg-forest-hover text-paper-light border border-forest active:scale-[0.99] shadow-sm',
      outline:
        'border border-ink text-ink bg-transparent hover:bg-ink hover:text-paper-light active:scale-[0.99]',
      paper:
        'border border-paper-border bg-paper-light hover:bg-paper-muted text-ink shadow-paper active:scale-[0.99]',
      ghost:
        'bg-transparent hover:bg-paper-muted text-ink active:scale-[0.99]',
      link:
        'bg-transparent text-terracotta underline-offset-4 hover:underline p-0 h-auto font-normal',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs tracking-wider uppercase font-medium rounded-sm gap-1.5',
      md: 'h-10 px-4 text-sm font-medium rounded gap-2',
      lg: 'h-12 px-6 text-base font-medium rounded gap-2.5',
      icon: 'h-9 w-9 p-0 rounded-sm',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
