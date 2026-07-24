import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export const Table = ({
  columns,
  data,
  rowKey = 'id',
  className,
  emptyState,
  ...props
}) => {
  // Utility to resolve nested object values (e.g., 'candidate.name')
  const resolveValue = (obj, path) => {
    if (!path) return '';
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  return (
    <div className={twMerge('w-full overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm', className)} {...props}>
      <table className="w-full border-collapse text-left text-sm text-slate-600">
        <thead className="bg-slate-50/75 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
          <tr>
            {columns.map((col, index) => (
              <th
                key={col.key || index}
                className={clsx(
                  'px-6 py-4.5 font-bold',
                  col.align === 'right' && 'text-right',
                  col.align === 'center' && 'text-center'
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {!data || data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12">
                {emptyState || (
                  <div className="flex flex-col items-center justify-center text-center text-slate-400">
                    <p className="font-semibold text-sm">No data available</p>
                  </div>
                )}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => {
              const key = typeof rowKey === 'function' ? rowKey(row) : row[rowKey] || rowIndex;
              return (
                <tr
                  key={key}
                  className="hover:bg-slate-50/50 transition-colors duration-200"
                >
                  {columns.map((col, colIndex) => {
                    const value = resolveValue(row, col.key);
                    return (
                      <td
                        key={col.key || colIndex}
                        className={clsx(
                          'px-6 py-4 font-medium text-slate-700 whitespace-nowrap align-middle',
                          col.align === 'right' && 'text-right',
                          col.align === 'center' && 'text-center'
                        )}
                      >
                        {col.render ? col.render(row, rowIndex) : value}
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
