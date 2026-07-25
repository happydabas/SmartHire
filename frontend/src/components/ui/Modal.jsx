import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
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

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 animate-fadeIn">
      {/* Backdrop overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal box */}
      <div 
        className={twMerge(
          'relative w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-t-3xl sm:rounded-3xl shadow-2xl p-6 md:p-8 space-y-6 transform transition-all z-10 animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200',
          className
        )}
        {...props}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          {title && (
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">
              {title}
            </h3>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="text-sm text-slate-600 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
