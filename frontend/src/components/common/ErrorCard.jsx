import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import clsx from 'clsx';

export function ErrorCard({
  title = 'Something went wrong',
  message,
  onRetry,
  retryText = 'Try Again',
  className,
  ...props
}) {
  return (
    <Card
      className={clsx(
        "p-6 border border-rose-100 bg-rose-50/10 rounded-3xl text-center space-y-4 max-w-md mx-auto shadow-sm select-none animate-fadeIn",
        className
      )}
      {...props}
    >
      <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shadow-inner">
        <AlertTriangle className="w-6 h-6 text-rose-600 animate-bounce" />
      </div>
      
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-slate-800 tracking-tight leading-snug">{title}</h3>
        {message && (
          <p className="text-xs font-semibold text-slate-500 leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        )}
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onRetry}
            className="rounded-xl font-bold flex items-center justify-center gap-1.5 py-2 px-5 mx-auto bg-rose-600 hover:bg-rose-700 text-xs shadow-md shadow-rose-500/10"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{retryText}</span>
          </Button>
        </div>
      )}
    </Card>
  );
}

export default ErrorCard;
