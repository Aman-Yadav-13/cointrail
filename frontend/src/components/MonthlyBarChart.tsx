import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Info,
  X,
  Calendar,
  BarChart3,
  LineChart,
  Loader2,
} from 'lucide-react';
import type { DailyTrend, MonthlyTrend, YearlyTrend, Currency, CategorySummary } from '../types';
import { api } from '../services/api';
import { formatCurrency, renderCategoryIcon } from '../utils/formatters';

interface MonthlyBarChartProps {
  currency: Currency;
  refreshKey?: number;
}

type ChartGranularity = 'daily' | 'monthly' | 'yearly';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export const MonthlyBarChart: React.FC<MonthlyBarChartProps> = ({
  currency,
  refreshKey = 0,
}) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Active view tab: 'daily' | 'monthly' | 'yearly'
  const [activeTab, setActiveTab] = useState<ChartGranularity>('daily');

  // Independent Filters
  // Daily view filters: Month & Year (defaults to current month & current year)
  const [dailyMonth, setDailyMonth] = useState<number>(currentMonth);
  const [dailyYear, setDailyYear] = useState<number>(currentYear);

  // Monthly view filter: Year (defaults to current year)
  const [monthlyYear, setMonthlyYear] = useState<number>(currentYear);

  // Data states
  const [dailyData, setDailyData] = useState<DailyTrend[]>([]);
  const [monthlyData, setMonthlyData] = useState<MonthlyTrend[]>([]);
  const [yearlyData, setYearlyData] = useState<YearlyTrend[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pinned item for detailed inspection on mobile/click
  const [pinnedItem, setPinnedItem] = useState<{
    label: string;
    totalAmount: number;
    count: number;
    breakdowns: CategorySummary[];
  } | null>(null);

  // Screen size tracking for responsive X-Axis
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

  // Fetch data based on active tab and its filters
  const loadChartData = useCallback(async () => {
    try {
      setLoading(true);
      setPinnedItem(null);

      if (activeTab === 'daily') {
        const res = await api.getDailyTrend(dailyYear, dailyMonth);
        setDailyData(res);
      } else if (activeTab === 'monthly') {
        const res = await api.getMonthlyTrend(monthlyYear);
        setMonthlyData(res);
      } else if (activeTab === 'yearly') {
        const res = await api.getYearlyTrend();
        setYearlyData(res);
      }
    } catch (err) {
      console.error('Failed to load chart trend data:', err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, dailyYear, dailyMonth, monthlyYear]);

  useEffect(() => {
    loadChartData();
  }, [loadChartData, refreshKey]);

  // Unified raw items based on active tab
  const activeItems = useMemo(() => {
    if (activeTab === 'daily') {
      return dailyData.map((d) => ({
        key: `Day ${d.day}`,
        displayLabel: `${d.day}`,
        fullLabel: `${d.day} ${MONTH_NAMES[dailyMonth - 1]} ${dailyYear}`,
        totalAmount: d.totalAmount || 0,
        count: d.count || 0,
        categoryBreakdowns: d.categoryBreakdowns || [],
      }));
    }
    if (activeTab === 'monthly') {
      return monthlyData.map((m) => ({
        key: m.monthName,
        displayLabel: isMobile ? m.monthName.charAt(0) : m.monthName,
        fullLabel: `${m.monthName} ${monthlyYear}`,
        totalAmount: m.totalAmount || 0,
        count: m.count || 0,
        categoryBreakdowns: m.categoryBreakdowns || [],
      }));
    }
    // Yearly
    return yearlyData.map((y) => ({
      key: `${y.year}`,
      displayLabel: `${y.year}`,
      fullLabel: `Year ${y.year}`,
      totalAmount: y.totalAmount || 0,
      count: y.count || 0,
      categoryBreakdowns: y.categoryBreakdowns || [],
    }));
  }, [activeTab, dailyData, monthlyData, yearlyData, dailyMonth, dailyYear, monthlyYear, isMobile]);

  // Total spent in active view
  const totalSpentInView = useMemo(() => {
    return activeItems.reduce((sum, item) => sum + item.totalAmount, 0);
  }, [activeItems]);

  // Extract all distinct categories in active dataset
  const allCategories = useMemo(() => {
    const map = new Map<string, { id: number; name: string; color: string; icon: string }>();
    activeItems.forEach((item) => {
      item.categoryBreakdowns?.forEach((cat) => {
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
  }, [activeItems]);

  // Transform data for Recharts stacked bars
  const transformedChartData = useMemo(() => {
    return activeItems.map((item) => {
      const row: Record<string, any> = {
        key: item.key,
        displayLabel: item.displayLabel,
        fullLabel: item.fullLabel,
        totalAmount: item.totalAmount,
        count: item.count,
        categoryBreakdowns: item.categoryBreakdowns,
      };
      allCategories.forEach((cat) => {
        const match = item.categoryBreakdowns.find((b) => b.categoryName === cat.name);
        row[cat.name] = match ? match.totalAmount : 0;
      });
      return row;
    });
  }, [activeItems, allCategories]);

  const handleBarClick = (entry: any) => {
    if (!entry) return;
    if (pinnedItem && pinnedItem.label === entry.fullLabel) {
      setPinnedItem(null);
    } else {
      setPinnedItem({
        label: entry.fullLabel,
        totalAmount: entry.totalAmount,
        count: entry.count,
        breakdowns: entry.categoryBreakdowns || [],
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between min-h-[360px] sm:min-h-[400px] min-w-0 w-full overflow-hidden transition-colors">
      {/* Header with Title and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 gap-3">
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
              Spending Trends
            </h3>
            {pinnedItem && (
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span>{pinnedItem.label}</span>
                <button
                  onClick={() => setPinnedItem(null)}
                  className="hover:text-emerald-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Close inspection"
                >
                  <X className="w-2.5 h-2.5 inline ml-0.5" />
                </button>
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
            {formatCurrency(totalSpentInView, currency.symbol)} total • Category-segmented
          </p>
        </div>

        {/* View Granularity Switcher Tabs: Daily | Monthly | Yearly */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-700/70 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-3 h-3" />
            <span>Daily</span>
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
              activeTab === 'monthly'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3 h-3" />
            <span>Monthly</span>
          </button>
          <button
            onClick={() => setActiveTab('yearly')}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center space-x-1 cursor-pointer ${
              activeTab === 'yearly'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LineChart className="w-3 h-3" />
            <span>Yearly</span>
          </button>
        </div>
      </div>

      {/* Dynamic Sub-header: Filters for the active view */}
      <div className="flex items-center justify-between py-2 border-b border-slate-100/70 dark:border-slate-700/40 gap-2 flex-wrap text-xs">
        {/* Daily Filters: Month & Year */}
        {activeTab === 'daily' && (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Month & Year:</span>
            <select
              value={dailyMonth}
              onChange={(e) => setDailyMonth(Number(e.target.value))}
              className="bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600/70 text-xs font-semibold rounded-lg px-2 py-0.5 text-slate-800 dark:text-slate-100 focus:outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1} className="dark:bg-slate-800">
                  {name}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-700/70 p-0.5 rounded-lg">
              <button
                onClick={() => setDailyYear((y) => y - 1)}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
                title="Previous Year"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 px-1">
                {dailyYear}
              </span>
              <button
                onClick={() => setDailyYear((y) => y + 1)}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
                title="Next Year"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Monthly Filter: Year */}
        {activeTab === 'monthly' && (
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Year:</span>
            <div className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-700/70 p-0.5 rounded-lg">
              <button
                onClick={() => setMonthlyYear((y) => y - 1)}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
                title="Previous Year"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 px-1">
                {monthlyYear}
              </span>
              <button
                onClick={() => setMonthlyYear((y) => y + 1)}
                className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded transition-colors cursor-pointer"
                title="Next Year"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Yearly View Indicator */}
        {activeTab === 'yearly' && (
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Multi-Year Historical Overview
          </div>
        )}

        {/* Category color strip */}
        {allCategories.length > 0 && (
          <div className="flex items-center space-x-1.5 overflow-x-auto py-1 scrollbar-none text-[10px] text-slate-500 dark:text-slate-400 max-w-full">
            <span className="font-semibold text-slate-400 flex-shrink-0">Categories:</span>
            {allCategories.map((cat) => (
              <span
                key={cat.id}
                className="inline-flex items-center space-x-1 px-1.5 py-0.5 rounded-md bg-slate-100/80 dark:bg-slate-700/60 flex-shrink-0"
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[70px]">
                  {cat.name}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[220px]">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
          <p className="text-xs text-slate-400">Loading chart data...</p>
        </div>
      ) : (
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
                dataKey="displayLabel"
                axisLine={false}
                tickLine={false}
                interval={activeTab === 'daily' && isMobile ? 2 : 0}
                tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 600 }}
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
                  const breakdowns: CategorySummary[] = row.categoryBreakdowns || [];
                  const itemTotal: number = row.totalAmount || 0;

                  return (
                    <div className="bg-slate-900/95 text-white backdrop-blur-md p-3 rounded-xl border border-slate-700/80 shadow-2xl text-xs z-50 pointer-events-none min-w-[190px]">
                      <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5 mb-2">
                        <span className="font-bold text-slate-100">{row.fullLabel}</span>
                        <span className="font-extrabold text-emerald-400">
                          {formatCurrency(itemTotal, currency.symbol)}
                        </span>
                      </div>

                      {breakdowns.length === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">No expenses recorded</p>
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

              {allCategories.length > 0 ? (
                allCategories.map((cat, idx) => (
                  <Bar
                    key={cat.name}
                    dataKey={cat.name}
                    stackId="trendCategoryStack"
                    fill={cat.color}
                    name={cat.name}
                    maxBarSize={activeTab === 'daily' ? 14 : 28}
                    cursor="pointer"
                    radius={idx === allCategories.length - 1 ? [2, 2, 0, 0] : [0, 0, 0, 0]}
                  />
                ))
              ) : (
                <Bar
                  dataKey="totalAmount"
                  fill="#10b981"
                  radius={[3, 3, 0, 0]}
                  maxBarSize={activeTab === 'daily' ? 14 : 28}
                  cursor="pointer"
                />
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Selected/Pinned Item Detailed Breakdown Card (Mobile/Click) */}
      {pinnedItem && (
        <div className="mt-2.5 p-2.5 sm:p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-emerald-500/40 dark:border-emerald-500/60 transition-all animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-600/60 mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                🗓️ {pinnedItem.label} Breakdown
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold">
                {formatCurrency(pinnedItem.totalAmount, currency.symbol)}
              </span>
            </div>
            <button
              onClick={() => setPinnedItem(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
              title="Close breakdown"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {pinnedItem.breakdowns && pinnedItem.breakdowns.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {pinnedItem.breakdowns.map((cat) => (
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
              No expenses recorded for this period.
            </p>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center space-x-1">
          <TrendingUp className="w-3 h-3 text-emerald-500" />
          <span>Average:</span>
          <strong className="text-slate-800 dark:text-slate-200">
            {(() => {
              const count = activeItems.filter((i) => i.totalAmount > 0).length || 1;
              return formatCurrency(totalSpentInView / count, currency.symbol);
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
