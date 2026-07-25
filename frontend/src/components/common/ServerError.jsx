import React from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ROUTES } from '@/constants/routes';
import clsx from 'clsx';

export function ServerError({
  message = "A technical issue occurred on our servers. We are working on fixing it as soon as possible.",
  onRetry,
  homePath = ROUTES.HOME || '/',
  className,
  ...props
}) {
  const navigate = useNavigate();

  return (
    <div className={clsx("min-h-screen flex items-center justify-center p-6 bg-slate-50/50", className)} {...props}>
      <Card className="p-8 sm:p-12 border border-slate-100 bg-white rounded-3xl text-center space-y-6 max-w-md shadow-xl shadow-slate-100/50">
        <div className="mx-auto w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center shadow-inner animate-pulse">
          <AlertOctagon className="w-8 h-8 text-amber-600" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 tracking-tight leading-snug">500 - Server Error</h2>
          <p className="text-sm font-semibold text-slate-400 leading-relaxed max-w-xs mx-auto">
            {message}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          {onRetry && (
            <Button
              variant="secondary"
              size="md"
              onClick={onRetry}
              className="flex-1 rounded-xl font-bold flex items-center justify-center gap-2 py-3 border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Request</span>
            </Button>
          )}
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate(homePath)}
            className="flex-1 rounded-xl font-bold flex items-center justify-center gap-2 py-3 shadow-lg shadow-blue-500/10"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default ServerError;
