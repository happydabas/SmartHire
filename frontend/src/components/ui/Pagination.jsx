import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { twMerge } from 'tailwind-merge';
import Select from './Select';

export const Pagination = ({
  currentPage = 1,
  totalCount = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  className,
  ...props
}) => {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  
  const start = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalCount);

  // Generate page numbers array
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(totalPages, currentPage + 2);
      
      if (startPage === 1) {
        endPage = maxVisible;
      } else if (endPage === totalPages) {
        startPage = totalPages - maxVisible + 1;
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  return (
    <div
      className={twMerge(
        'flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 border-t border-slate-100 bg-white rounded-b-2xl',
        className
      )}
      {...props}
    >
      {/* 1. Statistics Summary */}
      <div className="text-xs font-semibold text-slate-500 order-2 sm:order-1">
        Showing <span className="text-slate-800 font-bold">{start}</span>–
        <span className="text-slate-800 font-bold">{end}</span> of{' '}
        <span className="text-slate-800 font-bold">{totalCount}</span> items
      </div>

      {/* 2. Controls and Page size select */}
      <div className="flex items-center gap-4.5 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
        {/* Page size select wrapper */}
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 shrink-0 select-none">
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
            className="px-2 py-1 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        {/* Previous / Page numbers / Next controls */}
        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Page buttons */}
          <div className="hidden sm:flex items-center gap-1">
            {getPageNumbers().map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange?.(pageNum)}
                className={twMerge(
                  'w-8 h-8 rounded-lg text-xs font-bold transition-all border',
                  currentPage === pageNum
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/10'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                )}
              >
                {pageNum}
              </button>
            ))}
          </div>

          {/* Mobile Current indicator */}
          <div className="sm:hidden text-xs font-bold text-slate-700 px-3 select-none">
            Page {currentPage} of {totalPages}
          </div>

          {/* Next Button */}
          <button
            type="button"
            onClick={() => onPageChange?.(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
