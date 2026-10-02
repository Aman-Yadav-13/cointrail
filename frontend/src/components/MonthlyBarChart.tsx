import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import type { MonthlyTrend, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface MonthlyBarChartProps {
  data: MonthlyTrend[];
  currency: Currency;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const DEFAULT_MONTHS: MonthlyTrend[] = [
  { month: 1, monthName: 'Jan', totalAmount: 0, count: 0 },
  { month: 2, monthName: 'Feb', totalAmount: 0, count: 0 },
  { month: 3, monthName: 'Mar', totalAmount: 0, count: 0 },
  { month: 4, monthName: 'Apr', totalAmount: 0, count: 0 },
  { month: 5, monthName: 'May', totalAmount: 0, count: 0 },
  { month: 6, monthName: 'Jun', totalAmount: 0, count: 0 },
  { month: 7, monthName: 'Jul', totalAmount: 0, count: 0 },
  { month: 8, monthName: 'Aug', totalAmount: 0, count: 0 },
  { month: 9, monthName: 'Sep', totalAmount: 0, count: 0 },
  { month: 10, monthName: 'Oct', totalAmount: 0, count: 0 },
  { month: 11, monthName: 'Nov', totalAmount: 0, count: 0 },
  { month: 12, monthName: 'Dec', totalAmount: 0, count: 0 },
];

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({
  data,
  currency,
  selectedYear,
  onYearChange,
}) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // If data is empty, use default 12-month skeleton so chart axes and structure always render cleanly
  const chartData = data && data.length > 0 ? data : DEFAULT_MONTHS;
  const totalYearSpent = chartData.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  // Track window width for mobile XAxis label formatting (< 640px = Tailwind sm breakpoint)
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth < 640 : false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[320px] sm:min-h-[360px] min-w-0 w-full overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 gap-2">
        <div className="min-w-0">
          <div className="flex items-center space-x-1.5">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
              Annual Spending Trend
            </h3>
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {selectedYear} • {formatCurrency(totalYearSpent, currency.symbol)} total
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/70 p-1 rounded-xl flex-shrink-0">
          <button
            onClick={() => onYearChange(selectedYear - 1)}
            className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors"
            title={`View ${selectedYear - 1}`}
            aria-label="Previous year"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 px-1.5 sm:px-2">
            {selectedYear}
          </span>
          <button
            onClick={() => onYearChange(selectedYear + 1)}
            className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors"
            title={`View ${selectedYear + 1}`}
            aria-label="Next year"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Chart Wrapper - fixed pixel height & minHeight prevents Recharts 0-height collapse on mobile */}
      <div className="w-full h-56 sm:h-64 min-h-[220px] pt-3 sm:pt-4 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minHeight={200}>
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 6, left: -14, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#94a3b8"
              strokeOpacity={0.2}
            />
            <XAxis
              dataKey="monthName"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={{ fill: '#94a3b8', fontSize: isMobile ? 9 : 10, fontWeight: 600 }}
              tickFormatter={(val: string) => (isMobile ? (val ? val.charAt(0) : '') : val)}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              width={36}
              domain={[0, (dataMax: number) => (dataMax > 0 ? Math.ceil(dataMax * 1.15) : 100)]}
              tick={{ fill: '#94a3b8', fontSize: 9 }}
              tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val)}
            />
            <Bar dataKey="totalAmount" radius={[4, 4, 1, 1]} maxBarSize={28} minPointSize={2}>
              {chartData.map((entry, index) => {
                const isCurrent = selectedYear === currentYear && entry.month === currentMonth;
                return (
                  <Cell
                    key={`bar-cell-${index}`}
                    fill={isCurrent ? '#059669' : '#10b981'}
                    className="hover:opacity-85 transition-opacity"
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Annual Summary Footer */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center space-x-1">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span>Monthly Avg:</span>
          <strong className="text-slate-800 dark:text-slate-200">
            {(() => {
              const elapsedMonths = selectedYear < currentYear ? 12 : (selectedYear === currentYear ? currentMonth : 0);
              return formatCurrency(elapsedMonths > 0 ? totalYearSpent / elapsedMonths : 0, currency.symbol);
            })()}
          </strong>
        </span>
        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
          Current month highlighted
        </span>
      </div>
    </div>
  );
};
