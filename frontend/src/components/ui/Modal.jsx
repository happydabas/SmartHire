import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  headerActions,
  children, 
  className,
  ...props 
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop overlay covering the entire screen window including sidebar */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal box centered in the middle of viewport */}
      <div 
        className={twMerge(
          'relative w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-[#15161e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all z-10 animate-in zoom-in-95 duration-200 my-auto',
          className
        )}
        {...props}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#15161e] shrink-0 gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {title && (
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-white tracking-tight truncate">
                {title}
              </h3>
            )}
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {headerActions}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto text-sm text-slate-600 dark:text-slate-350 leading-relaxed grow">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
