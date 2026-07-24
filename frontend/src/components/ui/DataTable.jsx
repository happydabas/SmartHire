import React from 'react';
import { twMerge } from 'tailwind-merge';
import Table from './Table';

export const DataTable = ({
  columns = [],
  data = [],
  rowKey = 'id',
  className,
  emptyState,
  renderMobileCard,
  ...props
}) => {
  return (
    <div className={twMerge('w-full relative', className)}>
      {/* 1. Tablet & Desktop View: Table component wrapper */}
      <div className="hidden sm:block">
        <Table
          columns={columns}
          data={data}
          rowKey={rowKey}
          emptyState={emptyState}
          className="rounded-b-none border-b-0" // Align border with pagination below
          {...props}
        />
      </div>

      {/* 2. Mobile View: Stacked list of custom cards */}
      <div className="block sm:hidden space-y-4">
        {!data || data.length === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-8">
            {emptyState || (
              <p className="text-center text-sm font-semibold text-slate-400">No records available</p>
            )}
          </div>
        ) : (
          data.map((row, index) => {
            const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey] || index;
            return (
              <div key={key} className="w-full">
                {renderMobileCard ? (
                  renderMobileCard(row, index)
                ) : (
                  // Fallback default generic card
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3.5">
                    {columns.map((col, colIdx) => {
                      if (col.header === 'Action' || col.header === 'Actions') {
                        return (
                          <div key={colIdx} className="pt-3.5 border-t border-slate-100 flex items-center justify-end gap-2.5">
                            {col.render ? col.render(row, index) : null}
                          </div>
                        );
                      }
                      
                      const val = col.key ? col.key.split('.').reduce((acc, p) => acc && acc[p], row) : '';
                      return (
                        <div key={colIdx} className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400 uppercase tracking-wider">{col.header}</span>
                          <span className="text-slate-800 text-right">
                            {col.render ? col.render(row, index) : val}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DataTable;
