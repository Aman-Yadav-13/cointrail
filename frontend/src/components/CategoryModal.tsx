import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Edit2, Trash2, Lock, Search, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Category } from '../types';
import { api } from '../services/api';
import { ICON_MAP, renderCategoryIcon } from '../utils/formatters';
import { ConfirmDialog } from './ConfirmDialog';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCreateCategory: (data: { name: string; color: string; icon: string }) => Promise<void>;
  onUpdateCategory: (id: number, data: { name: string; color: string; icon: string }) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
}

const ALL_ICONS = Object.keys(ICON_MAP);

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('Tag');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState<boolean>(false);

  // Lazy loading state for available categories
  const [pagedCategories, setPagedCategories] = useState<Category[]>(categories || []);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [totalCategories, setTotalCategories] = useState(categories?.length || 0);

  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Search state for icon picker
  const [iconSearch, setIconSearch] = useState('');

  // Filtered icons
  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ALL_ICONS;
    const q = iconSearch.toLowerCase().trim();
    return ALL_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [iconSearch]);

  const fetchInitialPage = useCallback(async (searchQuery: string = '') => {
    try {
      setLoadingInitial(true);
      const res = await api.getCategoriesPaged(0, 15, searchQuery);
      setPagedCategories(res.content || []);
      setPage(0);
      setHasMore(res.hasMore ?? false);
      setTotalCategories(res.totalElements ?? (res.content || []).length);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  const loadNextPage = useCallback(async () => {
    if (loadingInitial || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await api.getCategoriesPaged(nextPage, 15, categorySearch);
      setPagedCategories((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const newItems = (res.content || []).filter((c) => !existingIds.has(c.id));
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      setHasMore(res.hasMore ?? false);
      setTotalCategories(res.totalElements ?? 0);
    } catch (err) {
      console.error('Failed to load more categories:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingInitial, loadingMore, hasMore, page, categorySearch]);

  useEffect(() => {
    if (isOpen) {
      fetchInitialPage('');
      setCategorySearch('');
    }
  }, [isOpen, fetchInitialPage]);

  // Debounced search for available categories
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchInitialPage(categorySearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [categorySearch, isOpen, fetchInitialPage]);

  // IntersectionObserver for lazy loading sentinel
  useEffect(() => {
    if (!isOpen) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingInitial && !loadingMore) {
          loadNextPage();
        }
      },
      { root: listRef.current, threshold: 0.1, rootMargin: '80px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isOpen, hasMore, loadingInitial, loadingMore, loadNextPage]);

  if (!isOpen) return null;

  const startEdit = (cat: Category) => {
    if (cat.isDefault || cat.default) {
      setError('System default categories cannot be edited');
      return;
    }
    setEditingCategory(cat);
    setName(cat.name);
    setIcon(cat.icon);
    setError(null);
    setSuccessToast(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setIcon('Tag');
    setError(null);
    setIconSearch('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name cannot be empty');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const isEdit = !!editingCategory;
      const categoryTitle = name.trim();

      if (isEdit) {
        await onUpdateCategory(editingCategory.id, {
          name: categoryTitle,
          color: editingCategory.color,
          icon,
        });
        setSuccessToast(`✨ "${categoryTitle}" updated successfully!`);
      } else {
        await onCreateCategory({ name: categoryTitle, color: '', icon });
        setSuccessToast(`🎉 "${categoryTitle}" created successfully!`);
      }

      await fetchInitialPage(categorySearch);

      setTimeout(() => {
        setSuccessToast(null);
        cancelEdit();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save category');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 py-6 sm:py-10 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] m-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Manage Categories</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
              Configure names and icons for your custom categories
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Floating Banner */}
        {successToast && (
          <div className="mx-4 sm:mx-6 mt-3.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 flex items-center space-x-2 text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-200 shadow-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="flex-1">{successToast}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {error && (
            <div className="p-3 text-xs bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400 rounded-xl">
              {error}
            </div>
          )}

          {/* Add / Edit Form */}
          <form
            onSubmit={handleSubmit}
            className="bg-slate-50 dark:bg-slate-800/80 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>{editingCategory ? `Edit: ${editingCategory.name}` : 'Create New Category'}</span>
              </span>
              {editingCategory && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={loading}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium disabled:opacity-40 cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Category Name Input */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Category Name
              </label>
              <input
                type="text"
                required
                disabled={loading}
                placeholder="e.g. Subscriptions, Groceries, Gym"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
              />
            </div>

            {/* Icon Picker with Dedicated Search */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Select Icon ({filteredIcons.length})
                </label>
                <div className="relative w-28 sm:w-36">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search icon..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full pl-6 pr-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 max-h-32 overflow-y-auto p-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl">
                {filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                      icon === iconName
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-400 dark:border-emerald-600 shadow-sm scale-105'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                    title={iconName}
                  >
                    {renderCategoryIcon(iconName, { className: 'w-4 h-4' })}
                  </button>
                ))}
                {filteredIcons.length === 0 && (
                  <span className="text-[10px] text-slate-400 p-1">No icons match "{iconSearch}"</span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{editingCategory ? 'Updating Category...' : 'Creating Category...'}</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{editingCategory ? 'Update Category' : 'Create Category'}</span>
                </>
              )}
            </button>
          </form>

          {/* List of Existing Categories with Search & Lazy Loading */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Available Categories ({totalCategories || pagedCategories.length})
              </h4>
              <div className="relative w-36 sm:w-44">
                <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter categories..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full pl-6 pr-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] sm:text-[11px] text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div
              ref={listRef}
              className="max-h-56 sm:max-h-64 overflow-y-auto space-y-1.5 sm:space-y-2 pr-1"
            >
              {loadingInitial ? (
                <div className="flex items-center justify-center py-8 text-slate-400 text-xs space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                  <span>Loading categories...</span>
                </div>
              ) : pagedCategories.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No categories found
                </div>
              ) : (
                <>
                  {pagedCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div
                          className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0"
                          style={{ backgroundColor: cat.color }}
                          title={`Color: ${cat.color}`}
                        >
                          {renderCategoryIcon(cat.icon, { className: 'w-3 h-3 sm:w-3.5 sm:h-3.5' })}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate block">
                            {cat.name}
                          </span>
                        </div>
                        {(cat.isDefault || cat.default) && (
                          <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium flex-shrink-0">
                            Default
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-0.5 flex-shrink-0 ml-2">
                        {(cat.isDefault || cat.default) ? (
                          <span
                            className="p-1 sm:p-1.5 text-slate-300 dark:text-slate-600 rounded-lg flex items-center justify-center cursor-not-allowed"
                            title="System default category (locked)"
                          >
                            <Lock className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <>
                            <button
                              onClick={() => startEdit(cat)}
                              className="p-1 sm:p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button
                              onClick={() => setCategoryToDelete(cat)}
                              className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Infinite Scroll Sentinel */}
                  <div ref={sentinelRef} className="py-2 flex items-center justify-center">
                    {loadingMore && (
                      <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                        <span>Loading more categories...</span>
                      </div>
                    )}
                    {!hasMore && pagedCategories.length > 8 && (
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        All categories loaded
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => {
          if (!isDeletingCategory) setCategoryToDelete(null);
        }}
        loading={isDeletingCategory}
        onConfirm={async () => {
          if (categoryToDelete) {
            const catName = categoryToDelete.name;
            try {
              setIsDeletingCategory(true);
              await onDeleteCategory(categoryToDelete.id);
              await fetchInitialPage(categorySearch);
              setCategoryToDelete(null);
              setSuccessToast(`🗑️ Category "${catName}" has been deleted.`);
              setTimeout(() => setSuccessToast(null), 3000);
            } catch (err: any) {
              setError(err?.response?.data?.message || 'Could not delete category');
              setCategoryToDelete(null);
            } finally {
              setIsDeletingCategory(false);
            }
          }
        }}
        title="Delete Category?"
        description={
          categoryToDelete
            ? `Are you sure you want to delete the "${categoryToDelete.name}" category? This cannot be undone.`
            : 'Are you sure you want to delete this category?'
        }
        confirmText="Delete Category"
        cancelText="Cancel"
        variant="danger"
        icon="trash"
      />
    </div>
  );
};
