import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function ApplicationsChart({ data = [] }) {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm dark:bg-slate-900 dark:border-slate-800 space-y-4">
      <div>
        <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider dark:text-white" id="applications-chart-title">
          Applications Submitted
        </h3>
        <p className="text-xs text-slate-400 font-semibold dark:text-slate-500">
          Monthly cumulative job applications submitted
        </p>
      </div>

      <div className="h-72 w-full" aria-describedby="applications-chart-title">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
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
              cursor={{ stroke: 'rgba(16, 185, 129, 0.15)', strokeWidth: 2 }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#10b981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorApplications)"
              name="Applications"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ApplicationsChart;
