import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Search, Loader2, Check } from 'lucide-react';
import type { Category } from '../types';
import { api } from '../services/api';
import { renderCategoryIcon } from '../utils/formatters';

interface LazyCategorySelectProps {
  value: number;
  onChange: (categoryId: number) => void;
  disabled?: boolean;
}

export const LazyCategorySelect: React.FC<LazyCategorySelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const pageSize = 15;

  // Fetch initial page
  const fetchInitial = useCallback(async (query: string = '') => {
    try {
      setLoadingInitial(true);
      const res = await api.getCategoriesPaged(0, pageSize, query);
      setCategories(res.content || []);
      setPage(0);
      setHasMore(res.hasMore ?? false);
    } catch (err) {
      console.error('Failed to load categories:', err);
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  // Fetch next page on scroll
  const fetchNextPage = useCallback(async () => {
    if (loadingInitial || loadingMore || !hasMore) return;
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const res = await api.getCategoriesPaged(nextPage, pageSize, search);
      setCategories((prev) => {
        // Deduplicate in case items shifted
        const existingIds = new Set(prev.map((c) => c.id));
        const newItems = (res.content || []).filter((c) => !existingIds.has(c.id));
        return [...prev, ...newItems];
      });
      setPage(nextPage);
      setHasMore(res.hasMore ?? false);
    } catch (err) {
      console.error('Failed to load more categories:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingInitial, loadingMore, hasMore, page, search]);

  // Load initial page on mount or dropdown open
  useEffect(() => {
    fetchInitial('');
  }, [fetchInitial]);

  // If value changes or categories update, find selected category or fetch it if missing
  useEffect(() => {
    if (!value) return;
    const found = categories.find((c) => c.id === value);
    if (found) {
      setSelectedCategory(found);
    } else {
      // Fetch missing category by ID to ensure correct label display
      api.getCategories().then((all) => {
        const match = all.find((c) => c.id === value);
        if (match) {
          setSelectedCategory(match);
          setCategories((prev) => (prev.some((c) => c.id === match.id) ? prev : [match, ...prev]));
        }
      }).catch(() => {});
    }
  }, [value, categories]);

  // Handle search typing with debounce
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      fetchInitial(search);
    }, 250);
    return () => clearTimeout(timer);
  }, [search, isOpen, fetchInitial]);

  // Intersection observer for sentinel
  useEffect(() => {
    if (!isOpen) return;
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingInitial && !loadingMore) {
          fetchNextPage();
        }
      },
      { root: listRef.current, threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [isOpen, hasMore, loadingInitial, loadingMore, fetchNextPage]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearch('');
    }
  }, [isOpen]);

  const handleSelect = (cat: Category) => {
    setSelectedCategory(cat);
    onChange(cat.id);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-3.5 py-2 sm:py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center justify-between transition-all hover:border-slate-300 dark:hover:border-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 cursor-pointer"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center space-x-2.5 truncate">
          {selectedCategory ? (
            <>
              <div
                className="w-5 h-5 rounded-md flex items-center justify-center text-white flex-shrink-0 shadow-xs text-[11px]"
                style={{ backgroundColor: selectedCategory.color }}
              >
                {renderCategoryIcon(selectedCategory.icon, { className: 'w-3 h-3' })}
              </div>
              <span className="truncate font-semibold text-slate-900 dark:text-white">
                {selectedCategory.name}
              </span>
            </>
          ) : (
            <span className="text-slate-400">Select a category...</span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180 text-emerald-500' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Scrollable Category List with Lazy Loading */}
          <div
            ref={listRef}
            className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-transparent"
          >
            {loadingInitial ? (
              <div className="flex items-center justify-center py-6 text-slate-400 text-xs space-x-2">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                <span>Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">
                No categories found
              </div>
            ) : (
              <>
                {categories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelect(cat)}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-100 font-semibold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate">
                        <div
                          className="w-5 h-5 rounded-md flex items-center justify-center text-white flex-shrink-0 shadow-xs"
                          style={{ backgroundColor: cat.color }}
                        >
                          {renderCategoryIcon(cat.icon, { className: 'w-3 h-3' })}
                        </div>
                        <span className="truncate">{cat.name}</span>
                        {(cat.isDefault || cat.default) && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400">
                            Default
                          </span>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}

                {/* Sentinel for Infinite Scroll */}
                <div ref={sentinelRef} className="h-4 flex items-center justify-center py-2">
                  {loadingMore && (
                    <div className="flex items-center space-x-1.5 text-[11px] text-slate-400">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                      <span>Loading more...</span>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
