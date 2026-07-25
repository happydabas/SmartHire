import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function CompanyGrowthChart({ data = [] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider dark:text-white" id="company-growth-chart-title">
          Company Growth Rate
        </h3>
        <p className="text-xs text-slate-400 font-semibold dark:text-slate-500">
          Monthly employer account registration trends over time
        </p>
      </div>

      <div className="h-72 w-full" aria-describedby="company-growth-chart-title">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-slate-800" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={700}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              stroke="#94a3b8"
              fontSize={11}
              fontWeight={700}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
              cursor={{ stroke: 'rgba(245, 158, 11, 0.1)', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#f59e0b"
              strokeWidth={3}
              dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Companies"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default CompanyGrowthChart;
