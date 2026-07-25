import React from 'react';
import { Spinner as UISpinner } from '@/components/ui/Spinner';

export const Spinner = ({ size = 'md', className, label = 'Loading...', ...props }) => {
  return (
    <div 
      className="flex flex-col items-center justify-center gap-2" 
      role="status" 
      aria-live="polite"
      {...props}
    >
      <UISpinner size={size} className={className} />
      <span className="sr-only">{label}</span>
    </div>
  );
};

export default Spinner;
