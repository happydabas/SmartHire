import React from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import clsx from 'clsx';

export function NetworkError({
  message = "Unable to connect to the server. Please check your internet connection and try again.",
  onRetry,
  isLoading = false,
  className,
  ...props
}) {
  return (
    <Card
      className={clsx(
        "p-8 border border-slate-100 bg-white rounded-3xl text-center space-y-5 max-w-md mx-auto shadow-lg shadow-slate-100/50 animate-fadeIn select-none",
        className
      )}
      {...props}
    >
      <div className="mx-auto w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
        <WifiOff className="w-6 h-6 text-blue-600" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-black text-slate-800 tracking-tight leading-snug">Connection Lost</h3>
        <p className="text-xs font-semibold text-slate-400 leading-relaxed max-w-xs mx-auto">
          {message}
        </p>
      </div>

      {onRetry && (
        <div className="pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={onRetry}
            isLoading={isLoading}
            disabled={isLoading}
            className="w-full rounded-xl font-bold flex items-center justify-center gap-2 py-3 shadow-md shadow-blue-500/10"
          >
            <RefreshCw className={clsx("w-4 h-4", isLoading && "animate-spin")} />
            <span>Retry Connection</span>
          </Button>
        </div>
      )}
    </Card>
  );
}

export default NetworkError;
