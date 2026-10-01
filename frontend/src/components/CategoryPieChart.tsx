import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import type { CategorySummary, Currency } from '../types';
import { formatCurrency, renderCategoryIcon } from '../utils/formatters';

interface CategoryPieChartProps {
  data: CategorySummary[];
  currency: Currency;
  periodLabel: string;
}

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ data, currency, periodLabel }) => {
  const total = data.reduce((acc, curr) => acc + curr.totalAmount, 0);

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-full min-w-0 w-full overflow-hidden transition-colors">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Category Breakdown</h3>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Distribution for {periodLabel}</p>
        </div>
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <PieIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center text-slate-400 min-h-[220px] sm:min-h-[260px]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-300 dark:text-slate-500 mb-3">
            <PieIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">No expenses recorded</p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">Add expenses in this date range to view the breakdown</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row items-center pt-2 gap-3 sm:gap-6 min-w-0">
          {/* Donut Chart */}
          <div className="w-full sm:w-1/2 h-52 sm:h-60 relative flex-shrink-0 min-w-0">
            <ResponsiveContainer width="100%" height="100%" minHeight={180}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="totalAmount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || '#6B7280'}
                      stroke="currentColor"
                      className="text-white dark:text-slate-800"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center metric */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                {formatCurrency(total, currency.symbol)}
              </span>
            </div>
          </div>

          {/* Category Legend List */}
          <div className="w-full sm:w-1/2 grid grid-cols-1 gap-1.5 max-h-52 sm:max-h-64 overflow-y-auto pr-1 min-w-0">
            {data.map((cat) => (
              <div
                key={cat.categoryId}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-xs border border-transparent hover:border-slate-200/60 dark:hover:border-slate-700"
              >
                <div className="flex items-center space-x-2 truncate min-w-0">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">
                    {renderCategoryIcon(cat.icon, { className: 'w-3.5 h-3.5' })}
                  </span>
                  <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{cat.categoryName}</span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(cat.totalAmount, currency.symbol)}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 ml-1.5 font-bold">
                    {cat.percentage ?? ((cat.totalAmount / (total || 1)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
