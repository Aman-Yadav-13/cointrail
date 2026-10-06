import React, { useState, useEffect, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { ChevronLeft, ChevronRight, TrendingUp, Info, X } from 'lucide-react';
import type { MonthlyTrend, Currency } from '../types';
import { formatCurrency, renderCategoryIcon } from '../utils/formatters';

interface MonthlyBarChartProps {
  data: MonthlyTrend[];
  currency: Currency;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const DEFAULT_MONTHS: MonthlyTrend[] = [
  { month: 1, monthName: 'Jan', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 2, monthName: 'Feb', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 3, monthName: 'Mar', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 4, monthName: 'Apr', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 5, monthName: 'May', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 6, monthName: 'Jun', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 7, monthName: 'Jul', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 8, monthName: 'Aug', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 9, monthName: 'Sep', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 10, monthName: 'Oct', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 11, monthName: 'Nov', totalAmount: 0, count: 0, categoryBreakdowns: [] },
  { month: 12, monthName: 'Dec', totalAmount: 0, count: 0, categoryBreakdowns: [] },
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
  const rawMonths = data && data.length > 0 ? data : DEFAULT_MONTHS;
  const totalYearSpent = rawMonths.reduce((sum, item) => sum + (item.totalAmount || 0), 0);

  // Selected/pinned month for mobile and click inspection
  const [pinnedMonth, setPinnedMonth] = useState<MonthlyTrend | null>(null);

  // Window resize tracking for responsive labels
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

  // Collect all unique categories that have expenses this year
  const allCategories = useMemo(() => {
    const map = new Map<string, { id: number; name: string; color: string; icon: string }>();
    rawMonths.forEach((m) => {
      m.categoryBreakdowns?.forEach((cat) => {
        if (!map.has(cat.categoryName)) {
          map.set(cat.categoryName, {
            id: cat.categoryId,
            name: cat.categoryName,
            color: cat.color || '#10b981',
            icon: cat.icon || 'tag',
          });
        }
      });
    });
    return Array.from(map.values());
  }, [rawMonths]);

  // Transform data so each month row has properties matching category names for Recharts stacked bars
  const transformedChartData = useMemo(() => {
    return rawMonths.map((m) => {
      const row: Record<string, any> = {
        month: m.month,
        monthName: m.monthName,
        totalAmount: m.totalAmount,
        count: m.count,
        categoryBreakdowns: m.categoryBreakdowns || [],
      };
      allCategories.forEach((cat) => {
        const match = m.categoryBreakdowns?.find((b) => b.categoryName === cat.name);
        row[cat.name] = match ? match.totalAmount : 0;
      });
      return row;
    });
  }, [rawMonths, allCategories]);

  // Handle bar click
  const handleBarClick = (entry: any) => {
    if (!entry) return;
    const mData = rawMonths.find((m) => m.month === entry.month);
    if (!mData) return;

    if (pinnedMonth?.month === mData.month) {
      setPinnedMonth(null);
    } else {
      setPinnedMonth(mData);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[340px] sm:min-h-[380px] min-w-0 w-full overflow-hidden transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 gap-2">
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
              Annual Spending Trend
            </h3>
            {pinnedMonth && (
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span>{pinnedMonth.monthName}</span>
                <button
                  onClick={() => setPinnedMonth(null)}
                  className="hover:text-emerald-900 dark:hover:text-white transition-colors"
                  title="Close inspection"
                >
                  <X className="w-2.5 h-2.5 inline ml-0.5" />
                </button>
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {selectedYear} • {formatCurrency(totalYearSpent, currency.symbol)} total • Category-segmented
          </p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-700/70 p-1 rounded-xl flex-shrink-0">
          <button
            onClick={() => onYearChange(selectedYear - 1)}
            className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
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
            className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
            title={`View ${selectedYear + 1}`}
            aria-label="Next year"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Colors Strip (when categories exist) */}
      {allCategories.length > 0 && (
        <div className="flex items-center space-x-2 overflow-x-auto py-1.5 scrollbar-none text-[10px] text-slate-500 dark:text-slate-400">
          <span className="font-semibold text-slate-400 dark:text-slate-500 flex-shrink-0">Categories:</span>
          {allCategories.map((cat) => (
            <span
              key={cat.id}
              className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-700/60 flex-shrink-0"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
              <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[80px]">
                {cat.name}
              </span>
            </span>
          ))}
        </div>
      )}

      {/* Stacked Category Bar Chart */}
      <div className="w-full h-52 sm:h-56 min-h-[200px] pt-2 min-w-0">
        <ResponsiveContainer width="100%" height="100%" minHeight={180}>
          <BarChart
            data={transformedChartData}
            margin={{ top: 8, right: 6, left: -14, bottom: 0 }}
            onClick={(e: any) => {
              const evt = e as any;
              if (evt && evt.activePayload && evt.activePayload.length > 0) {
                handleBarClick(evt.activePayload[0].payload);
              }
            }}
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
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const row = payload[0].payload;
                const breakdowns: any[] = row.categoryBreakdowns || [];
                const monthTotal: number = row.totalAmount || 0;
                const isCurrent = selectedYear === currentYear && row.month === currentMonth;

                return (
                  <div className="bg-slate-900/95 text-white backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-2xl text-xs z-50 pointer-events-none min-w-[190px]">
                    <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-100">{row.monthName} {selectedYear}</span>
                        {isCurrent && (
                          <span className="text-[9px] bg-emerald-500/30 text-emerald-300 font-semibold px-1.5 py-0.2 rounded-full border border-emerald-500/40">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="font-extrabold text-emerald-400">
                        {formatCurrency(monthTotal, currency.symbol)}
                      </span>
                    </div>

                    {breakdowns.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">No spending in this month</p>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="text-[10px] text-slate-400 flex items-center justify-between pb-0.5">
                          <span>Category Breakdown</span>
                          <span>{row.count} {row.count === 1 ? 'txn' : 'txns'}</span>
                        </div>
                        {breakdowns.map((cat, i) => (
                          <div key={i} className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center space-x-1.5 truncate max-w-[110px]">
                              <span
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: cat.color }}
                              />
                              <span className="truncate text-slate-200">{cat.categoryName}</span>
                            </div>
                            <div className="text-right flex items-center space-x-1.5 flex-shrink-0">
                              <span className="font-semibold text-white">
                                {formatCurrency(cat.totalAmount, currency.symbol)}
                              </span>
                              <span className="text-[10px] text-slate-400">
                                ({cat.percentage}%)
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <p className="text-[9px] text-slate-400 mt-2 pt-1 border-t border-slate-800 text-center">
                      Tap bar to inspect breakdown
                    </p>
                  </div>
                );
              }}
            />

            {/* If categories exist, render stacked bars matching category colors */}
            {allCategories.length > 0 ? (
              allCategories.map((cat, idx) => (
                <Bar
                  key={cat.name}
                  dataKey={cat.name}
                  stackId="monthlyCategorySpend"
                  fill={cat.color}
                  name={cat.name}
                  maxBarSize={28}
                  cursor="pointer"
                  radius={idx === allCategories.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                  opacity={
                    pinnedMonth !== null && pinnedMonth.month !== undefined
                      ? 1
                      : 0.95
                  }
                />
              ))
            ) : (
              /* Fallback single bar when no categorized data exists yet */
              <Bar
                dataKey="totalAmount"
                fill="#10b981"
                radius={[4, 4, 1, 1]}
                maxBarSize={28}
                cursor="pointer"
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Selected/Pinned Month Detailed Category Breakdown Card */}
      {pinnedMonth && (
        <div className="mt-2.5 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-emerald-500/40 dark:border-emerald-500/60 transition-all animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-600/60 mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                🗓️ {pinnedMonth.monthName} {selectedYear} Breakdown
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                {formatCurrency(pinnedMonth.totalAmount, currency.symbol)}
              </span>
            </div>
            <button
              onClick={() => setPinnedMonth(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
              title="Close breakdown"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {pinnedMonth.categoryBreakdowns && pinnedMonth.categoryBreakdowns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {pinnedMonth.categoryBreakdowns.map((cat) => (
                <div
                  key={cat.categoryId}
                  className="flex items-center justify-between p-1.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200/80 dark:border-slate-700 text-xs"
                >
                  <div className="flex items-center space-x-1.5 truncate min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-slate-500 dark:text-slate-400 flex-shrink-0">
                      {renderCategoryIcon(cat.icon, { className: 'w-3 h-3' })}
                    </span>
                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                      {cat.categoryName}
                    </span>
                  </div>
                  <div className="text-right flex-shrink-0 ml-2">
                    <span className="font-semibold text-slate-900 dark:text-white text-[11px]">
                      {formatCurrency(cat.totalAmount, currency.symbol)}
                    </span>
                    <span
                      className="text-[10px] ml-1 font-bold"
                      style={{ color: cat.color || '#10b981' }}
                    >
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic py-1">
              No expenses recorded for this month.
            </p>
          )}
        </div>
      )}

      {/* Annual Summary Footer */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center space-x-1">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span>Monthly Avg:</span>
          <strong className="text-slate-800 dark:text-slate-200">
            {(() => {
              const elapsedMonths =
                selectedYear < currentYear ? 12 : selectedYear === currentYear ? currentMonth : 0;
              return formatCurrency(
                elapsedMonths > 0 ? totalYearSpent / elapsedMonths : 0,
                currency.symbol
              );
            })()}
          </strong>
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center space-x-1">
          <Info className="w-3 h-3" />
          <span>Tap/hover bar to inspect category breakdown</span>
        </span>
      </div>
    </div>
  );
};
