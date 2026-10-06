import React, { useState } from 'react';
import { Search, Trash2, Edit3, ArrowUpDown } from 'lucide-react';
import type { ExpenseEntry, Category, Currency } from '../types';
import { formatCurrency, formatDate, renderCategoryIcon } from '../utils/formatters';
import { ConfirmDialog } from './ConfirmDialog';

interface ExpenseTableProps {
  expenses: ExpenseEntry[];
  categories: Category[];
  currency: Currency;
  onEdit: (entry: ExpenseEntry) => void;
  onDelete: (id: number) => void;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  categories,
  currency,
  onEdit,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [entryToDelete, setEntryToDelete] = useState<ExpenseEntry | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const filtered = expenses
    .filter((entry) => {
      const matchCat =
        selectedCategory === 'all' || entry.category.id.toString() === selectedCategory;
      const matchSearch =
        (entry.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.category.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
      {/* Header & Filter Controls */}
      <div className="p-3.5 sm:p-5 border-b border-slate-100 dark:border-slate-700/60 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Transactions</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {filtered.length} of {expenses.length} records
            </p>
          </div>
          {/* Mobile Sort Button */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="sm:hidden p-2 bg-slate-100 dark:bg-slate-700/60 rounded-xl text-slate-600 dark:text-slate-300"
            title={sortOrder === 'desc' ? 'Sorted newest first' : 'Sorted oldest first'}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses..."
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
              <option value="all" className="dark:bg-slate-800">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id.toString()} className="dark:bg-slate-800">
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop/Tablet Sort Toggle */}
          <button
            onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
            className="hidden sm:inline-flex p-2 bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600/70 rounded-xl text-slate-600 dark:text-slate-300 transition-colors flex-shrink-0"
            title={sortOrder === 'desc' ? 'Sorted newest first' : 'Sorted oldest first'}
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE LIST VIEW (< sm screens) */}
      <div className="sm:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {filtered.length === 0 ? (
          <div className="py-12 px-4 text-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600 dark:text-slate-300">No transactions found</p>
            <p className="mt-1 text-slate-400 dark:text-slate-500">Try adjusting your search or category filter</p>
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

              {/* Right: Amount, Date, Touch-friendly Actions */}
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
                    className="p-1.5 hover:text-emerald-500 dark:hover:text-emerald-400 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors"
                    aria-label="Edit"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setEntryToDelete(entry)}
                    className="p-1.5 hover:text-rose-500 dark:hover:text-rose-400 text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
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
                        className="p-1 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-md transition-colors"
                        title="Edit expense"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEntryToDelete(entry)}
                        className="p-1 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-md transition-colors"
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
