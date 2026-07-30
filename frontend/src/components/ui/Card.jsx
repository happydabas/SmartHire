import React from 'react';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={twMerge(
        'bg-white dark:bg-[#15161e] border border-slate-150/60 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-none p-6 transition-all duration-300',
        hoverable && 'hover:shadow-md dark:hover:shadow-none hover:border-slate-350 dark:hover:border-slate-700 hover:scale-[1.01] hover:-translate-y-0.5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
