import React from 'react';

export const SkeletonTable = ({ rows = 5, cols = 4 }) => {
  const rowArray = Array.from({ length: rows });
  const colArray = Array.from({ length: cols });

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm animate-pulse select-none">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-slate-50/75 border-b border-slate-100">
          <tr>
            {colArray.map((_, i) => (
              <th key={i} className="px-6 py-4.5">
                <div className="h-3 bg-slate-200 rounded-lg w-20"></div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rowArray.map((_, rowIndex) => (
            <tr key={rowIndex}>
              {colArray.map((_, colIndex) => {
                // Vary width of skeleton lines inside cells for realistic look
                const widths = ['w-24', 'w-16', 'w-32', 'w-20', 'w-28'];
                const width = widths[(rowIndex + colIndex) % widths.length];

                return (
                  <td key={colIndex} className="px-6 py-5 align-middle">
                    {colIndex === 0 ? (
                      // Render avatar + text skeleton for first column typically (name/title)
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-200 rounded-xl shrink-0"></div>
                        <div className="space-y-1.5 flex-grow">
                          <div className={`h-3 bg-slate-200 rounded-lg ${width}`}></div>
                          <div className="h-2.5 bg-slate-200 rounded-lg w-12"></div>
                        </div>
                      </div>
                    ) : colIndex === cols - 1 ? (
                      // Render buttons skeleton for actions column (last column)
                      <div className="flex gap-2 justify-start items-center">
                        <div className="w-16 h-8 bg-slate-200 rounded-xl"></div>
                        <div className="w-8 h-8 bg-slate-200 rounded-xl"></div>
                      </div>
                    ) : (
                      <div className={`h-3 bg-slate-200 rounded-lg ${width}`}></div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkeletonTable;
