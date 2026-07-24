import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Card = ({ children, className, ...props }) => {
  return (
    <div
      className={twMerge(clsx(
        'bg-white border border-slate-200 rounded-3xl shadow-xl p-8 space-y-6',
        className
      ))}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
