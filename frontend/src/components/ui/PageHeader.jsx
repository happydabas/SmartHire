import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  backUrl,
  onBack,
  actions,
  children,
  className = '',
  sticky = true
}) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  const showBack = Boolean(backUrl || onBack);

  return (
    <header
      className={`w-full ${
        sticky
          ? 'sticky top-14 lg:top-0 z-30 bg-white/90 dark:bg-[#090a0f]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 pt-4 pb-4 mb-6 transition-colors duration-200'
          : 'pt-4 pb-4 mb-6'
      } ${className}`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          {showBack && (
            <button
              type="button"
              onClick={handleBack}
              className="mt-0.5 p-2 text-slate-400 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
              title="Go back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}

          {Icon && (
            <div className="mt-0.5 p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-500/20">
              <Icon className="w-5 h-5" />
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                {title}
              </h1>
              {badge && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {actions && (
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center flex-wrap">
            {actions}
          </div>
        )}
      </div>

      {children && <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60">{children}</div>}
    </header>
  );
}

export default PageHeader;
