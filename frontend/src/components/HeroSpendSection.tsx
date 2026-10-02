import React from 'react';
import { Plus, TrendingUp, Award, Receipt, ArrowUpRight, Hash } from 'lucide-react';
import type { OverviewStats, Currency } from '../types';
import { formatCurrency, renderCategoryIcon } from '../utils/formatters';

interface HeroSpendSectionProps {
  stats: OverviewStats | null;
  currency: Currency;
  periodLabel: string;
  onOpenAddExpense: () => void;
}

export const HeroSpendSection: React.FC<HeroSpendSectionProps> = ({
  stats,
  currency,
  periodLabel,
  onOpenAddExpense,
}) => {
  return (
    <div className="space-y-3 sm:space-y-4">
      {/* MOBILE VIEW (< sm screens, ~320px - 640px) */}
      <div className="sm:hidden grid grid-cols-2 gap-2.5">
        {/* Prominent Full-Width Total Spent Card */}
        <div className="col-span-2 bg-white dark:bg-slate-800/95 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Receipt className="w-3.5 h-3.5" />
              </div>
              <span>Total Spent ({periodLabel})</span>
            </div>
            <button
              onClick={onOpenAddExpense}
              className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 shadow-sm transition-all"
            >
              <Plus className="w-3 h-3 stroke-[2.5]" />
              <span>Add</span>
            </button>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            {formatCurrency(stats?.totalSpent, currency.symbol)}
          </div>
          <p className="mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {stats?.totalTransactions ?? 0} transactions in this period
          </p>
        </div>

        {/* Top Category Card */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Top Category
            </span>
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
              style={
                stats?.topCategoryColor
                  ? { backgroundColor: `${stats.topCategoryColor}20`, color: stats.topCategoryColor }
                  : undefined
              }
            >
              {stats?.topCategoryIcon ? (
                renderCategoryIcon(stats.topCategoryIcon, { className: 'w-3.5 h-3.5' })
              ) : (
                <div className="w-full h-full rounded-lg bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {stats?.topCategory || 'N/A'}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Most spent
            </p>
          </div>
        </div>

        {/* Daily Average Card */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Daily Avg
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {formatCurrency(stats?.dailyAverage, currency.symbol)}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Per day
            </p>
          </div>
        </div>

        {/* Highest Single Expense Card */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Highest
            </span>
            <div className="w-6 h-6 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {formatCurrency(stats?.highestSingleExpense, currency.symbol)}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Largest item
            </p>
          </div>
        </div>

        {/* Total Entries Card */}
        <div className="bg-white dark:bg-slate-800/95 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Entries
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
              <Hash className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {stats?.totalTransactions ?? 0}
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium mt-0.5">
              Recorded
            </p>
          </div>
        </div>
      </div>

      {/* TABLET & DESKTOP VIEW (>= sm screens: 2x2 grid on tablet, 4-col on laptop) */}
      <div className="hidden sm:grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            title: `Total Spent (${periodLabel})`,
            value: formatCurrency(stats?.totalSpent, currency.symbol),
            icon: Receipt,
            bgLight: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
            sub: `${stats?.totalTransactions ?? 0} transactions`,
          },
          {
            title: 'Top Category',
            value: stats?.topCategory || 'N/A',
            icon: Award,
            customIcon: stats?.topCategoryIcon,
            customColor: stats?.topCategoryColor,
            bgLight: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400',
            sub: 'Most expenditure',
          },
          {
            title: 'Daily Average',
            value: formatCurrency(stats?.dailyAverage, currency.symbol),
            icon: TrendingUp,
            bgLight: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400',
            sub: 'Per day in period',
          },
          {
            title: 'Highest Single Expense',
            value: formatCurrency(stats?.highestSingleExpense, currency.symbol),
            icon: ArrowUpRight,
            bgLight: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400',
            sub: 'Single largest item',
          },
        ].map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800/90 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate pr-2">
                  {card.title}
                </span>
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${!card.customColor ? card.bgLight : ''}`}
                  style={
                    card.customColor
                      ? { backgroundColor: `${card.customColor}20`, color: card.customColor }
                      : undefined
                  }
                >
                  {card.customIcon ? (
                    renderCategoryIcon(card.customIcon, { className: 'w-5 h-5' })
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                  {card.value}
                </h3>
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
