import React from 'react';
import clsx from 'clsx';
import Button from '@/components/ui/Button';

export function EmptyState({
  title,
  description,
  icon,
  primaryButton,
  secondaryButton,
  className,
  ...props
}) {
  return (
    <div
      className={clsx(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-slate-200 rounded-3xl bg-slate-50/50 max-w-lg mx-auto select-none animate-fadeIn",
        className
      )}
      {...props}
    >
      {icon && (
        <div className="text-slate-400 mb-4 flex items-center justify-center">
          {React.isValidElement(icon) ? (
            icon
          ) : (
            React.createElement(icon, { className: "w-12 h-12 text-slate-400" })
          )}
        </div>
      )}
      
      <h3 className="text-lg font-bold text-slate-800 tracking-tight leading-snug">{title}</h3>
      
      {description && (
        <p className="text-sm font-semibold text-slate-500 mt-2 max-w-sm leading-relaxed">
          {description}
        </p>
      )}

      {(primaryButton || secondaryButton) && (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 w-full sm:w-auto">
          {secondaryButton && (
            React.isValidElement(secondaryButton) ? (
              secondaryButton
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={secondaryButton.onClick}
                className="w-full sm:w-auto rounded-xl font-bold border border-slate-200 px-5 text-xs text-slate-600"
              >
                {secondaryButton.label}
              </Button>
            )
          )}
          {primaryButton && (
            React.isValidElement(primaryButton) ? (
              primaryButton
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={primaryButton.onClick}
                className="w-full sm:w-auto rounded-xl font-bold px-5 text-xs shadow-md shadow-blue-500/10"
              >
                {primaryButton.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
