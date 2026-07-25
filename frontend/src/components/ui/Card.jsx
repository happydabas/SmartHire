import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, hoverable = false, ...props }) => {
  return (
    <div
      className={twMerge(clsx(
        'bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6 transition-all duration-300',
        hoverable && 'hover:shadow-2xl hover:border-slate-300 hover:scale-[1.01] hover:-translate-y-0.5',
        className
      ))}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
