import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export function CompanyPagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-4 sm:px-6" aria-label="Pagination">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-black rounded-xl text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-200 text-sm font-black rounded-xl text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          Next
        </button>
      </div>
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500 font-bold dark:text-slate-400">
            Page <span className="font-extrabold text-slate-900 dark:text-white">{currentPage}</span> of{' '}
            <span className="font-extrabold text-slate-900 dark:text-white">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-xl shadow-sm space-x-1" aria-label="Pagination buttons">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="relative inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4 mr-1 shrink-0" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="relative inline-flex items-center px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-black text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 ml-1 shrink-0" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}

export default CompanyPagination;
