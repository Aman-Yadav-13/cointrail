import React, { useState, useEffect, useCallback } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
} from 'recharts';
import {
  PieChart as PieIcon,
  Tag,
  RotateCcw,
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import type { CategorySummary, Currency } from '../types';
import { api } from '../services/api';
import { formatCurrency, renderCategoryIcon } from '../utils/formatters';

interface CategoryPieChartProps {
  currency: Currency;
  refreshKey?: number;
  onOpenCategories?: () => void;
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// Clean active shape: expands outward without inner intrusion or floating box
const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g className="cursor-pointer transition-all duration-200">
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({
  currency,
  refreshKey = 0,
  onOpenCategories,
}) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Local independent filters
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);

  const [data, setData] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Active slice index (pinned takes precedence over hover)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);

  const activeIndex = pinnedIndex !== null ? pinnedIndex : hoveredIndex;
  const total = data.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Fetch category summary for the selected month and year
  const loadCategoryData = useCallback(async () => {
    try {
      setLoading(true);
      const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
      const monthStr = selectedMonth < 10 ? `0${selectedMonth}` : `${selectedMonth}`;
      const startDate = `${selectedYear}-${monthStr}-01`;
      const endDate = `${selectedYear}-${monthStr}-${daysInMonth < 10 ? '0' + daysInMonth : daysInMonth}`;

      const res = await api.getCategorySummary(startDate, endDate);
      setData(res);
      setPinnedIndex(null);
      setHoveredIndex(null);
    } catch (err) {
      console.error('Failed to load category summary:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useEffect(() => {
    loadCategoryData();
  }, [loadCategoryData, refreshKey]);

  const handleSliceClick = (_: any, index: number) => {
    if (pinnedIndex === index) {
      setPinnedIndex(null);
      setHoveredIndex(null);
    } else {
      setPinnedIndex(index);
    }
  };

  const handleLegendClick = (index: number) => {
    if (pinnedIndex === index) {
      setPinnedIndex(null);
      setHoveredIndex(null);
    } else {
      setPinnedIndex(index);
    }
  };

  const handleResetPin = () => {
    setPinnedIndex(null);
    setHoveredIndex(null);
  };

  const activeCategory = activeIndex !== null && data[activeIndex] ? data[activeIndex] : null;

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col h-full min-w-0 w-full overflow-hidden transition-colors">
      {/* Header with Title and Month/Year Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700/60 gap-2">
        <div className="min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
              Category Breakdown
            </h3>
            {pinnedIndex !== null && (
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full flex items-center space-x-1">
                <span>Inspecting</span>
                <button
                  onClick={handleResetPin}
                  className="hover:text-emerald-900 dark:hover:text-white transition-colors cursor-pointer"
                  title="Reset inspection"
                >
                  <RotateCcw className="w-2.5 h-2.5 inline ml-0.5" />
                </button>
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
            {MONTH_NAMES[selectedMonth - 1]} {selectedYear} • {formatCurrency(total, currency.symbol)} total
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
          {/* Month Selector */}
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600/70 text-xs font-semibold rounded-xl px-2 py-1 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            aria-label="Filter Month"
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx + 1} className="dark:bg-slate-800">
                {name}
              </option>
            ))}
          </select>

          {/* Year Stepper */}
          <div className="flex items-center space-x-0.5 bg-slate-100 dark:bg-slate-700/70 p-0.5 rounded-xl">
            <button
              onClick={() => setSelectedYear((y) => y - 1)}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Previous Year"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 px-1">
              {selectedYear}
            </span>
            <button
              onClick={() => setSelectedYear((y) => y + 1)}
              className="p-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors cursor-pointer"
              title="Next Year"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {onOpenCategories && (
            <button
              onClick={onOpenCategories}
              className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-200/80 dark:border-emerald-800 flex items-center space-x-1 transition-all active:scale-95 cursor-pointer"
              title="Add or Manage Categories"
            >
              <Tag className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Categories</span>
            </button>
          )}

          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 flex items-center justify-center flex-shrink-0">
            <PieIcon className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[220px]">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
          <p className="text-xs text-slate-400">Loading breakdown...</p>
        </div>
      ) : data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-8 text-center text-slate-400 min-h-[220px] sm:min-h-[260px]">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-slate-100 dark:bg-slate-700/50 flex items-center justify-center text-slate-300 dark:text-slate-500 mb-3">
            <PieIcon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300">
            No expenses in {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </p>
          <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-1">
            Change the month/year filter or record an expense
          </p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col sm:flex-row items-center pt-2 gap-3 sm:gap-6 min-w-0">
          {/* Donut Chart with Crisp Center Details (NO floating tooltip overlap) */}
          <div className="w-full sm:w-1/2 h-56 sm:h-64 relative flex-shrink-0 min-w-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minHeight={200}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="totalAmount"
                  nameKey="categoryName"
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={80}
                  paddingAngle={3}
                  {...({
                    activeIndex: activeIndex !== null ? activeIndex : undefined,
                    activeShape: renderActiveShape,
                  } as any)}
                  onMouseEnter={(_, index) => {
                    if (pinnedIndex === null) setHoveredIndex(index);
                  }}
                  onMouseLeave={() => {
                    if (pinnedIndex === null) setHoveredIndex(null);
                  }}
                  onClick={handleSliceClick}
                  cursor="pointer"
                >
                  {data.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || '#6B7280'}
                      stroke="currentColor"
                      className="text-white dark:text-slate-800 transition-all duration-200"
                      strokeWidth={activeIndex === index ? 3 : 2}
                      opacity={activeIndex !== null && activeIndex !== index ? 0.4 : 1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            {/* Single Source of Truth: Clean Center Donut Info */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-3 text-center">
              {activeCategory ? (
                <div className="flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-150 max-w-[115px] sm:max-w-[130px]">
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mb-1 shadow-sm border border-white/20"
                    style={{
                      backgroundColor: `${activeCategory.color || '#10b981'}25`,
                      color: activeCategory.color || '#10b981',
                    }}
                  >
                    {renderCategoryIcon(activeCategory.icon, { className: 'w-4 h-4' })}
                  </div>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 truncate w-full leading-tight">
                    {activeCategory.categoryName}
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-950 dark:text-white leading-tight mt-0.5">
                    {formatCurrency(activeCategory.totalAmount, currency.symbol)}
                  </span>
                  <span
                    className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-1 border leading-none"
                    style={{
                      backgroundColor: `${activeCategory.color || '#10b981'}20`,
                      color: activeCategory.color || '#10b981',
                      borderColor: `${activeCategory.color || '#10b981'}40`,
                    }}
                  >
                    {activeCategory.percentage ?? ((activeCategory.totalAmount / (total || 1)) * 100).toFixed(0)}% • {activeCategory.count} {activeCategory.count === 1 ? 'tx' : 'txs'}
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {MONTH_NAMES[selectedMonth - 1]} Total
                  </span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100 mt-0.5">
                    {formatCurrency(total, currency.symbol)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {data.length} {data.length === 1 ? 'category' : 'categories'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Synchronized Category List (Clickable to Inspect) */}
          <div className="w-full sm:w-1/2 flex flex-col min-w-0">
            <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1 pb-1 font-medium">
              <span>Category</span>
              <span>Tap to inspect</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5 max-h-52 sm:max-h-60 overflow-y-auto pr-1 min-w-0">
              {data.map((cat, index) => {
                const isSelected = activeIndex === index;
                const isItemPinned = pinnedIndex === index;
                return (
                  <button
                    key={cat.categoryId}
                    type="button"
                    onClick={() => handleLegendClick(index)}
                    onMouseEnter={() => {
                      if (pinnedIndex === null) setHoveredIndex(index);
                    }}
                    onMouseLeave={() => {
                      if (pinnedIndex === null) setHoveredIndex(null);
                    }}
                    className={`flex items-center justify-between p-2 rounded-xl transition-all text-xs border text-left cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/80 dark:border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/40'
                        : 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/40 border-transparent hover:border-slate-200/60 dark:hover:border-slate-700/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm transition-transform"
                        style={{
                          backgroundColor: cat.color,
                          transform: isSelected ? 'scale(1.25)' : 'scale(1)',
                        }}
                      />
                      <span
                        className="flex-shrink-0"
                        style={{ color: isSelected ? cat.color : undefined }}
                      >
                        {renderCategoryIcon(cat.icon, { className: 'w-3.5 h-3.5' })}
                      </span>
                      <span className={`truncate ${isSelected ? 'font-bold text-slate-950 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-200'}`}>
                        {cat.categoryName}
                      </span>
                      {isItemPinned && (
                        <span className="text-[9px] bg-emerald-600 text-white rounded-full px-1.5 py-0.2 font-bold ml-1">
                          pinned
                        </span>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <span className={`font-semibold ${isSelected ? 'text-slate-950 dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                        {formatCurrency(cat.totalAmount, currency.symbol)}
                      </span>
                      <span
                        className="text-[10px] sm:text-[11px] ml-1.5 font-bold"
                        style={{ color: cat.color || '#10b981' }}
                      >
                        {cat.percentage ?? ((cat.totalAmount / (total || 1)) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Footer Info & Reset Action */}
      {data.length > 0 && !loading && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500">
          <span className="flex items-center space-x-1">
            <Info className="w-3 h-3 text-slate-400" />
            <span>Hover or tap any slice/category to inspect details</span>
          </span>
          {pinnedIndex !== null && (
            <button
              onClick={handleResetPin}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
            >
              Reset to Total
            </button>
          )}
        </div>
      )}
    </div>
  );
};
