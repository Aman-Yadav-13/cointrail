import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Check, X, Sparkles } from 'lucide-react';

interface DateFilterBarProps {
  dateFilterPreset: string;
  onDateFilterChange: (preset: string) => void;
  startDate: string;
  endDate: string;
  periodLabel: string;
  onCustomDateChange: (start: string, end: string, label: string) => void;
  onStepMonth?: (direction: -1 | 1) => void;
}

const PRESETS = [
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'this-year', label: 'Year' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom' },
];

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  dateFilterPreset,
  onDateFilterChange,
  startDate,
  endDate,
  periodLabel,
  onCustomDateChange,
  onStepMonth,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customStart, setCustomStart] = useState(startDate);
  const [customEnd, setCustomEnd] = useState(endDate);

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onCustomDateChange(customStart, customEnd, 'Custom Range');
      onDateFilterChange('custom');
      setIsModalOpen(false);
    }
  };

  const handleQuickRange = (days: number, label: string) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const startStr = start.toISOString().split('T')[0];
    const endStr = end.toISOString().split('T')[0];
    setCustomStart(startStr);
    setCustomEnd(endStr);
    onCustomDateChange(startStr, endStr, label);
    onDateFilterChange('custom');
    setIsModalOpen(false);
  };

  return (
    <>
      {/* DATE FILTER BAR FOR MOBILE & TABLET (< lg screens) */}
      <div className="lg:hidden bg-white dark:bg-slate-900/90 rounded-2xl p-2 sm:p-2.5 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        {/* MOBILE VIEW (< sm screens, ~360px - 640px) */}
        <div className="flex sm:hidden items-center justify-between gap-1.5">
          {/* Previous Month/Period Step */}
          {onStepMonth && (
            <button
              onClick={() => onStepMonth(-1)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 rounded-xl transition-all flex-shrink-0"
              aria-label="Previous period"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Active Period Pill - Opens Sheet/Modal */}
          <button
            onClick={() => {
              setCustomStart(startDate);
              setCustomEnd(endDate);
              setIsModalOpen(true);
            }}
            className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 active:scale-[0.98] rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 transition-all border border-slate-200/60 dark:border-slate-700/60 truncate"
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
            <span className="truncate">{periodLabel}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-0.5" />
          </button>

          {/* Next Month/Period Step */}
          {onStepMonth && (
            <button
              onClick={() => onStepMonth(1)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 rounded-xl transition-all flex-shrink-0"
              aria-label="Next period"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* TABLET VIEW (sm to lg screens, ~640px - 1024px) */}
        <div className="hidden sm:flex items-center justify-between gap-3">
          {/* Left: Stepper + Current Active Label */}
          <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
            {onStepMonth && (
              <button
                onClick={() => onStepMonth(-1)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <div className="flex items-center space-x-1.5 px-2 py-0.5 text-xs font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>{periodLabel}</span>
            </div>
            {onStepMonth && (
              <button
                onClick={() => onStepMonth(1)}
                className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Next month"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Tablet Segmented Control (overflow-safe) */}
          <div className="flex items-center space-x-0.5 sm:space-x-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/60 text-xs font-medium overflow-x-auto no-scrollbar min-w-0 flex-shrink">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => {
                  if (p.id === 'custom') {
                    setCustomStart(startDate);
                    setCustomEnd(endDate);
                    setIsModalOpen(true);
                  } else {
                    onDateFilterChange(p.id);
                  }
                }}
                className={`px-2 sm:px-2.5 md:px-3 py-1.5 rounded-lg transition-all capitalize whitespace-nowrap flex-shrink-0 text-xs ${
                  dateFilterPreset === p.id
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE & TABLET DATE FILTER MODAL / BOTTOM SHEET */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-6 sm:zoom-in-95">
            {/* Sheet Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Select Date Period</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Filter your expenses by time range</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sheet Body */}
            <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
              {/* Presets List */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1 block mb-2">
                  Quick Presets
                </span>
                {[
                  { id: 'this-month', label: 'This Month', desc: 'Current calendar month' },
                  { id: 'last-month', label: 'Last Month', desc: 'Previous calendar month' },
                  { id: 'this-year', label: 'This Year', desc: 'Full current year' },
                  { id: 'all', label: 'All Time', desc: 'All recorded transactions' },
                ].map((p) => {
                  const isSelected = dateFilterPreset === p.id;
                  return (
                    <button
                      key={p.id}
                      onClick={() => {
                        onDateFilterChange(p.id);
                        setIsModalOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all border ${
                        isSelected
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500/50 text-emerald-900 dark:text-emerald-300'
                          : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs sm:text-sm">{p.label}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">{p.desc}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Custom Range Section */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                    Custom Date Range
                  </span>
                  <div className="flex items-center space-x-1.5 text-xs">
                    <button
                      type="button"
                      onClick={() => handleQuickRange(7, 'Last 7 Days')}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium"
                    >
                      Last 7d
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickRange(30, 'Last 30 Days')}
                      className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-[11px] font-medium"
                    >
                      Last 30d
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyCustom}
                  className="w-full mt-2 py-2.5 bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply Custom Range</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
