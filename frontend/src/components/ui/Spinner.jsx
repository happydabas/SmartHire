import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Spinner = ({ size = 'md', className, ...props }) => {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={twMerge('flex justify-center items-center', className)} {...props}>
      <div
        className={clsx(
          'animate-spin rounded-full border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent',
          sizes[size]
        )}
        style={{ borderColor: 'rgba(59, 130, 246, 0.1)', borderTopColor: 'currentColor' }}
      />
    </div>
  );
};

export default Spinner;
