import React from 'react';
import { Plus, Settings2, Calendar, Sun, Moon, LogIn, LogOut } from 'lucide-react';
import { CURRENCIES, type Currency, type User } from '../types';

interface NavbarProps {
  currentCurrency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onOpenAddExpense: () => void;
  onOpenCategories: () => void;
  dateFilterPreset: string;
  onDateFilterChange: (preset: string) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomDateChange: (start: string, end: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

const PRESETS = [
  { id: 'this-month', label: 'This Month' },
  { id: 'last-month', label: 'Last Month' },
  { id: 'this-year', label: 'This Year' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency,
  onCurrencyChange,
  onOpenAddExpense,
  onOpenCategories,
  dateFilterPreset,
  onDateFilterChange,
  customStartDate,
  customEndDate,
  onCustomDateChange,
  isDarkMode,
  onToggleDarkMode,
  currentUser,
  onLogout,
  onOpenAuth,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Nav Bar */}
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
            <img
              src="/logo.svg"
              alt="CoinTrail Logo"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl shadow-md shadow-emerald-500/20 flex-shrink-0 object-contain"
            />
            <div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                CoinTrail
              </span>
              <span className="hidden lg:inline-block ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Expense Tracker
              </span>
            </div>
          </div>

          {/* Desktop Laptop Date Presets (>= lg) */}
          <div className="hidden lg:flex items-center space-x-1 bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 border dark:border-slate-700/60 flex-shrink-0">
            {PRESETS.map((preset) => (
              <button
                key={preset.id}
                onClick={() => onDateFilterChange(preset.id)}
                className={`px-2.5 lg:px-3 py-1.5 rounded-lg transition-all capitalize whitespace-nowrap ${
                  dateFilterPreset === preset.id
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Right Controls: Theme Toggle + Currency + Categories + Add Expense + Auth */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700/70"
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDarkMode ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
              )}
            </button>

            {/* Currency Selector */}
            <div className="relative">
              <select
                value={currentCurrency.code}
                onChange={(e) => {
                  const selected = CURRENCIES.find((c) => c.code === e.target.value);
                  if (selected) onCurrencyChange(selected);
                }}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 rounded-xl px-1.5 sm:px-2.5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-emerald-500 transition-colors"
                aria-label="Select currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code} className="dark:bg-slate-800 dark:text-white">
                    {c.symbol} <span className="hidden sm:inline">({c.code})</span>
                  </option>
                ))}
              </select>
            </div>

            {/* Manage Categories Button */}
            <button
              onClick={onOpenCategories}
              className="p-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center space-x-1.5 transition-colors border border-slate-200 dark:border-slate-700"
              title="Manage Categories"
              aria-label="Manage categories"
            >
              <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500 dark:text-slate-400" />
              <span className="hidden md:inline">Categories</span>
            </button>

            {/* Add Expense Button (hidden on mobile since Floating Action Button handles it) */}
            <button
              onClick={onOpenAddExpense}
              className="hidden sm:flex bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-medium text-xs sm:text-sm px-3 py-2 rounded-xl items-center space-x-1 shadow-md shadow-emerald-600/20 transition-all flex-shrink-0"
              aria-label="Add Expense"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Expense</span>
            </button>

            {/* User Profile / Auth Actions */}
            {currentUser ? (
              <div className="flex items-center space-x-1 sm:space-x-1.5 pl-1 sm:pl-2 border-l border-slate-200 dark:border-slate-800">
                <div
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0"
                  title={`Logged in as ${currentUser.fullName} (${currentUser.username})`}
                >
                  {currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : currentUser.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden md:inline-block text-xs font-bold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
                  {currentUser.fullName.split(' ')[0]}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold text-xs px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl flex items-center space-x-1 shadow-md shadow-emerald-600/20 transition-all flex-shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>

        {/* Desktop Custom Date Range Bar (shown on desktop when 'custom' is active) */}
        {dateFilterPreset === 'custom' && (
          <div className="hidden lg:flex py-2.5 px-4 my-2 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl items-center justify-between gap-2.5 text-xs animate-in fade-in">
            <div className="flex items-center space-x-2 text-emerald-800 dark:text-emerald-300 font-medium">
              <Calendar className="w-4 h-4 flex-shrink-0" />
              <span>Custom Date Range:</span>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => onCustomDateChange(e.target.value, customEndDate)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-slate-500 dark:text-slate-400">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => onCustomDateChange(customStartDate, e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-slate-700 dark:text-slate-200 font-medium focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
