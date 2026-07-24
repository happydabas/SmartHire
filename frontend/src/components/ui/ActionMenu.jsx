import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

export const ActionMenu = ({
  actions = [],
  disabled = false,
  className,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close the menu if clicking outside of the component container
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleActionClick = (e, onClick) => {
    e.stopPropagation();
    setIsOpen(false);
    onClick?.();
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef} {...props}>
      <button
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={twMerge(
          'p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all border border-transparent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'bg-slate-50 text-slate-600',
          className
        )}
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 space-y-0.5 animate-in fade-in duration-100 origin-top-right">
          {actions.map((action, index) => {
            const Icon = action.icon;
            const isDanger = action.variant === 'danger';

            return (
              <button
                key={index}
                type="button"
                onClick={(e) => handleActionClick(e, action.onClick)}
                className={twMerge(
                  'w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2.5 transition-colors',
                  isDanger
                    ? 'text-red-600 hover:bg-red-50 hover:text-red-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                {Icon && <Icon className={twMerge('w-4 h-4 shrink-0 text-current', !isDanger && 'text-slate-400')} />}
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
