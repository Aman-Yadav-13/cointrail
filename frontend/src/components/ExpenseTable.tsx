import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Search,
  Trash2,
  Edit3,
  Calendar,
  Loader2,
  ArrowDownCircle,
} from 'lucide-react';
import type { ExpenseEntry, Category, Currency } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatDate, renderCategoryIcon } from '../utils/formatters';
import { ConfirmDialog } from './ConfirmDialog';

interface ExpenseTableProps {
  categories: Category[];
  currency: Currency;
  onEdit: (entry: ExpenseEntry) => void;
  onDelete: (id: number) => Promise<void>;
  refreshKey?: number;
}

type DatePreset = 'all' | 'this-month' | 'last-month' | 'this-year' | 'custom';

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  categories,
  currency,
  onEdit,
  onDelete,
  refreshKey = 0,
}) => {
  // Dedicated Date Range Filter (Default: 'all' = tracking by latest entry)
  const [datePreset, setDatePreset] = useState<DatePreset>('all');
  const [customStart, setCustomStart] = useState<string>('');
  const [customEnd, setCustomEnd] = useState<string>('');

  // Search & Category Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Pagination & Lazy Loading States
  const [page, setPage] = useState<number>(0);
  const [pageSize] = useState<number>(20);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);

  // Deletion Dialog States
  const [entryToDelete, setEntryToDelete] = useState<ExpenseEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Sentinel ref for infinite scroll
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Calculate startDate and endDate strings from datePreset
  const getDateRange = useCallback((): { start?: string; end?: string } => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth(); // 0-indexed

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

    if (datePreset === 'this-month') {
      const first = `${year}-${pad(month + 1)}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const last = `${year}-${pad(month + 1)}-${pad(lastDay)}`;
      return { start: first, end: last };
    }
    if (datePreset === 'last-month') {
      const prevMonth = month === 0 ? 12 : month;
      const prevYear = month === 0 ? year - 1 : year;
      const first = `${prevYear}-${pad(prevMonth)}-01`;
      const lastDay = new Date(prevYear, prevMonth, 0).getDate();
      const last = `${prevYear}-${pad(prevMonth)}-${pad(lastDay)}`;
      return { start: first, end: last };
    }
    if (datePreset === 'this-year') {
      return { start: `${year}-01-01`, end: `${year}-12-31` };
    }
    if (datePreset === 'custom') {
      return {
        start: customStart || undefined,
        end: customEnd || undefined,
      };
    }
    // 'all' = default: no date boundaries, tracking by latest entry
    return {};
  }, [datePreset, customStart, customEnd]);

  // Initial load or filter change: reset page to 0 and fetch
  const fetchInitialPage = useCallback(async () => {
    try {
      setLoading(true);
      const { start, end } = getDateRange();
      const catId = selectedCategory !== 'all' ? Number(selectedCategory) : undefined;

      const res = await api.getExpensesPaged(0, pageSize, start, end, catId);
      setExpenses(res.content || []);
      setPage(0);
      setHasMore(res.hasMore ?? false);
      setTotalElements(res.totalElements ?? 0);
    } catch (err) {
      console.error('Failed to load initial expenses page:', err);
    } finally {
      setLoading(false);
    }
  }, [getDateRange, selectedCategory, pageSize]);

  useEffect(() => {
    fetchInitialPage();
  }, [fetchInitialPage, refreshKey]);

  // Load next page on scroll
  const loadNextPage = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const { start, end } = getDateRange();
      const catId = selectedCategory !== 'all' ? Number(selectedCategory) : undefined;

      const res = await api.getExpensesPaged(nextPage, pageSize, start, end, catId);
      setExpenses((prev) => [...prev, ...(res.content || [])]);
      setPage(nextPage);
      setHasMore(res.hasMore ?? false);
      setTotalElements(res.totalElements ?? 0);
    } catch (err) {
      console.error('Failed to load next expenses page:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [page, hasMore, loading, loadingMore, getDateRange, selectedCategory, pageSize]);

  // Setup Intersection Observer on the bottom sentinel
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadNextPage();
        }
      },
      { threshold: 0.2, rootMargin: '100px' }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [hasMore, loading, loadingMore, loadNextPage]);

  // Client-side text search on currently loaded items
  const filtered = expenses.filter((entry) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    const desc = (entry.description || '').toLowerCase();
    const cat = entry.category.name.toLowerCase();
    return desc.includes(q) || cat.includes(q);
  });

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Header & Dedicated Date Filter Controls */}
      <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Transactions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {datePreset === 'all' ? 'Latest entries' : `Filtered view`} • Showing {expenses.length} of {totalElements} records
            </p>
          </div>

          {/* Dedicated Date Range Selector for Expense List */}
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Date:</span>
            </span>
            <select
              value={datePreset}
              onChange={(e) => setDatePreset(e.target.value as DatePreset)}
              className="bg-slate-100 dark:bg-slate-700/80 border border-slate-200 dark:border-slate-600/70 text-xs font-semibold rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all" className="dark:bg-slate-800">Latest (All Time)</option>
              <option value="this-month" className="dark:bg-slate-800">This Month</option>
              <option value="last-month" className="dark:bg-slate-800">Last Month</option>
              <option value="this-year" className="dark:bg-slate-800">This Year</option>
              <option value="custom" className="dark:bg-slate-800">Custom Date Range</option>
            </select>
          </div>
        </div>

        {/* Custom Date Range Inputs (when selected) */}
        {datePreset === 'custom' && (
          <div className="flex items-center space-x-2 pt-1 pb-1 text-xs">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100 text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-lg px-2 py-1 text-slate-800 dark:text-slate-100 text-xs"
            />
          </div>
        )}

        {/* Search & Category Filter Row */}
        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search loaded transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/70 text-xs rounded-xl pl-8 pr-3 py-2 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Dropdown */}
          <div className="relative flex-shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600/70 text-xs rounded-xl px-2.5 sm:px-3 py-2 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer max-w-[130px] sm:max-w-none truncate"
            >
              <option value="all" className="dark:bg-slate-800">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id.toString()} className="dark:bg-slate-800">
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading state for initial fetch */}
      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-500 mb-2" />
          <p className="text-xs">Loading transactions...</p>
        </div>
      ) : (
        <>
          {/* MOBILE LIST VIEW (< sm screens) */}
          <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <div className="py-12 px-4 text-center text-slate-400 text-xs">
                <p className="font-semibold text-slate-600 dark:text-slate-300">No transactions found</p>
                <p className="mt-1 text-slate-400 dark:text-slate-500">Try adjusting your filters or adding a new expense</p>
              </div>
            ) : (
              filtered.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/70 dark:hover:bg-slate-750 transition-colors"
                >
                  {/* Left: Category Icon + Details */}
                  <div
                    onClick={() => onEdit(entry)}
                    className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: entry.category.color }}
                    >
                      {renderCategoryIcon(entry.category.icon, { className: 'w-4 h-4' })}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 dark:text-white text-xs truncate">
                        {entry.category.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {entry.description || <span className="text-slate-400 dark:text-slate-600 italic">No notes</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount, Date, Actions */}
                  <div className="text-right flex-shrink-0 flex flex-col items-end">
                    <div className="font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                      {formatCurrency(entry.amount, currency.symbol)}
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                      {formatDate(entry.date)}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <button
                        onClick={() => onEdit(entry)}
                        className="p-1.5 hover:text-emerald-500 dark:hover:text-emerald-400 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer"
                        aria-label="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEntryToDelete(entry)}
                        className="p-1.5 hover:text-rose-500 dark:hover:text-rose-400 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        aria-label="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* DESKTOP & TABLET TABLE VIEW (sm+ screens) */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/70 dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700/60 text-slate-400 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-6">Category</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-slate-700 dark:text-slate-300">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <p className="font-medium text-slate-500 dark:text-slate-400">No transactions match your filter</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try resetting filters or adding an entry</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/40 transition-colors group">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center space-x-2.5">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: entry.category.color }}
                          >
                            {renderCategoryIcon(entry.category.icon, { className: 'w-3.5 h-3.5' })}
                          </div>
                          <span className="font-semibold text-slate-800 dark:text-slate-100">{entry.category.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {formatDate(entry.date)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 max-w-xs truncate">
                        {entry.description || <span className="text-slate-300 dark:text-slate-600 italic">None</span>}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {formatCurrency(entry.amount, currency.symbol)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEdit(entry)}
                            className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                            title="Edit expense"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEntryToDelete(entry)}
                            className="p-1 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-md transition-colors cursor-pointer"
                            title="Delete expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Infinite Scroll Sentinel & Load More Indicator */}
          <div ref={observerTarget} className="py-4 px-4 text-center border-t border-slate-100 dark:border-slate-800">
            {loadingMore && (
              <div className="flex items-center justify-center space-x-2 text-xs text-slate-500 dark:text-slate-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Loading more transactions...</span>
              </div>
            )}
            {!loadingMore && hasMore && (
              <button
                onClick={loadNextPage}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center justify-center space-x-1 mx-auto py-1 px-3 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
              >
                <ArrowDownCircle className="w-3.5 h-3.5" />
                <span>Load More (Scroll or Click)</span>
              </button>
            )}
            {!hasMore && expenses.length > 0 && (
              <p className="text-[11px] text-slate-400 dark:text-slate-500">
                All {expenses.length} transactions loaded
              </p>
            )}
          </div>
        </>
      )}

      {/* Delete Transaction Confirmation Modal */}
      <ConfirmDialog
        isOpen={!!entryToDelete}
        onClose={() => {
          if (!isDeleting) setEntryToDelete(null);
        }}
        loading={isDeleting}
        onConfirm={async () => {
          if (entryToDelete) {
            try {
              setIsDeleting(true);
              await onDelete(entryToDelete.id);
              setExpenses((prev) => prev.filter((item) => item.id !== entryToDelete.id));
              setTotalElements((prev) => Math.max(0, prev - 1));
              setEntryToDelete(null);
            } finally {
              setIsDeleting(false);
            }
          }
        }}
        title="Delete Transaction?"
        description={
          entryToDelete
            ? `Are you sure you want to delete this expense of ${formatCurrency(entryToDelete.amount, currency.symbol)} for ${entryToDelete.category.name}? This record will be permanently removed.`
            : 'Are you sure you want to delete this transaction?'
        }
        confirmText="Delete Expense"
        cancelText="Cancel"
        variant="danger"
        icon="trash"
      />
    </div>
  );
};
