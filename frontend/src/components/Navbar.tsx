import React from 'react';
import { Plus, Sun, Moon, LogIn, LogOut, Tag } from 'lucide-react';
import { CURRENCIES, type Currency, type User } from '../types';

interface NavbarProps {
  currentCurrency: Currency;
  onCurrencyChange: (c: Currency) => void;
  onOpenAddExpense: () => void;
  onOpenCategories: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentCurrency,
  onCurrencyChange,
  onOpenAddExpense,
  onOpenCategories,
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
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl shadow-lg shadow-emerald-500/20 flex-shrink-0 object-contain hover:scale-105 transition-transform duration-200 cursor-pointer"
            />
            <div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                CoinTrail
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                Expense Tracker
              </span>
            </div>
          </div>

          {/* Right Controls: Theme Toggle + Currency + Categories + Add Expense + Auth */}
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {/* Dark / Light Mode Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 sm:p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700/70 cursor-pointer"
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
                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl px-2 sm:px-2.5 py-1.5 sm:py-2 border border-slate-200 dark:border-slate-700/70 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                aria-label="Currency"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
            </div>

            {/* Explicit Categories Pill Button */}
            {currentUser && (
              <button
                onClick={onOpenCategories}
                className="text-xs font-semibold px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 border border-emerald-300/80 dark:border-emerald-800 flex items-center space-x-1 sm:space-x-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
                title="Manage Categories"
              >
                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="font-bold text-[11px] sm:text-xs">Categories</span>
              </button>
            )}

            {/* Add Expense Button */}
            {currentUser && (
              <button
                onClick={onOpenAddExpense}
                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl flex items-center space-x-1 sm:space-x-1.5 shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="hidden xs:inline sm:inline">Add</span>
                <span className="hidden sm:inline">Expense</span>
              </button>
            )}

            {/* Auth Button */}
            {currentUser ? (
              <div className="flex items-center space-x-1 sm:space-x-2 pl-1 border-l border-slate-200 dark:border-slate-700">
                <span className="hidden md:inline-block text-xs font-semibold text-slate-700 dark:text-slate-300 max-w-[100px] truncate">
                  {currentUser.fullName || currentUser.username}
                </span>
                <button
                  onClick={onLogout}
                  className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                  title="Logout"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold px-3 py-1.5 sm:py-2 rounded-xl flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
