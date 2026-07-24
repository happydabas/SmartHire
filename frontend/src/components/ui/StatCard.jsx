import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const StatCard = ({
  icon,
  title,
  value,
  description,
  className,
  iconBgColor = 'bg-blue-50',
  iconColor = 'text-blue-600',
  ...props
}) => {
  return (
    <div
      className={twMerge(
        'bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col space-y-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-500 tracking-tight">{title}</span>
        {icon && (
          <div className={clsx('p-3 rounded-2xl flex items-center justify-center shrink-0 transition-colors', iconBgColor, iconColor)}>
            {icon}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        {description && (
          <p className="text-xs font-semibold text-slate-400 leading-normal">{description}</p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
