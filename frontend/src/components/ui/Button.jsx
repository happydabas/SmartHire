import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Button = React.forwardRef(({ 
  children, 
  className, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  disabled, 
  type = 'button',
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] active:translate-y-px transform';
  
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/10 focus:ring-blue-500 border border-transparent',
    secondary: 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 focus:ring-slate-400',
    ghost: 'bg-transparent hover:bg-slate-50 text-slate-600 focus:ring-slate-400 border border-transparent',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
