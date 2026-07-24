import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const Toast = ({
  message,
  type = 'success',
  description,
  onClose,
  duration = 3000,
  className,
  ...props
}) => {
  useEffect(() => {
    if (duration > 0 && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const variants = {
    success: {
      border: 'border-slate-800 bg-slate-900',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      badgeBg: 'bg-emerald-500/20'
    },
    error: {
      border: 'border-slate-800 bg-slate-900',
      icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
      badgeBg: 'bg-rose-500/20'
    },
    info: {
      border: 'border-slate-800 bg-slate-900',
      icon: <Sparkles className="w-4 h-4 text-blue-400" />,
      badgeBg: 'bg-blue-500/20'
    }
  };

  const currentVariant = variants[type] || variants.success;

  return (
    <div
      className={twMerge(
        'fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border text-white animate-slide-in',
        currentVariant.border,
        className
      )}
      {...props}
    >
      <div className={twMerge('w-8 h-8 rounded-xl flex items-center justify-center text-sm shrink-0', currentVariant.badgeBg)}>
        {currentVariant.icon}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold text-slate-100">{message}</p>
        {description && (
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{description}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

export default Toast;
