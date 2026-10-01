import React from 'react';
import { Wallet, Award, TrendingUp, ArrowUpRight } from 'lucide-react';
import type { OverviewStats, Currency } from '../types';
import { formatCurrency } from '../utils/formatters';

interface OverviewCardsProps {
  stats: OverviewStats | null;
  currency: Currency;
  periodLabel: string;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ stats, currency, periodLabel }) => {
  const cards = [
    {
      title: `Total Spent (${periodLabel})`,
      value: formatCurrency(stats?.totalSpent, currency.symbol),
      icon: Wallet,
      color: 'from-emerald-500 to-teal-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400',
      sub: `${stats?.totalTransactions ?? 0} transactions`,
    },
    {
      title: 'Top Category',
      value: stats?.topCategory || 'N/A',
      icon: Award,
      color: 'from-violet-500 to-purple-600',
      bgLight: 'bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-400',
      sub: 'Most expenditure',
    },
    {
      title: 'Daily Average',
      value: formatCurrency(stats?.dailyAverage, currency.symbol),
      icon: TrendingUp,
      color: 'from-blue-500 to-indigo-600',
      bgLight: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400',
      sub: 'Per day in period',
    },
    {
      title: 'Highest Single Expense',
      value: formatCurrency(stats?.highestSingleExpense, currency.symbol),
      icon: ArrowUpRight,
      color: 'from-rose-500 to-pink-600',
      bgLight: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400',
      sub: 'Single largest item',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800/90 rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider line-clamp-1">
                {card.title}
              </span>
              <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 ${card.bgLight}`}>
                <Icon className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
              </div>
            </div>
            <div className="mt-2 sm:mt-3">
              <h3 className="text-base sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
                {card.value}
              </h3>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium truncate">
                {card.sub}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
