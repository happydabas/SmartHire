import React from 'react';
import { AlertCircle } from 'lucide-react';
import clsx from 'clsx';

export function ErrorMessage({ message, className, ...props }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={clsx(
        "flex items-center gap-1.5 text-xs font-semibold text-rose-600 mt-1 select-none animate-fadeIn",
        className
      )}
      {...props}
    >
      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
      <span>{message}</span>
    </div>
  );
}

export default ErrorMessage;
