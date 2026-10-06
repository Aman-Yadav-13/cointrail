import React, { useState, useMemo } from 'react';
import { X, Plus, Edit2, Trash2, Check, Lock, Search, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Category } from '../types';
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

// 40+ Curated modern colors categorized by name for searchability
const EXTENDED_COLOR_PRESETS = [
  // Emerald & Teals
  { hex: '#10B981', name: 'Emerald' },
  { hex: '#059669', name: 'Forest Emerald' },
  { hex: '#14B8A6', name: 'Teal' },
  { hex: '#0D9488', name: 'Dark Teal' },
  { hex: '#06B6D4', name: 'Cyan' },
  { hex: '#0891B2', name: 'Ocean Cyan' },
  { hex: '#2DD4BF', name: 'Mint' },
  { hex: '#84CC16', name: 'Lime' },
  { hex: '#65A30D', name: 'Olive Lime' },
  { hex: '#22C55E', name: 'Vibrant Green' },

  // Blues & Indigos
  { hex: '#3B82F6', name: 'Sky Blue' },
  { hex: '#2563EB', name: 'Royal Blue' },
  { hex: '#1D4ED8', name: 'Deep Blue' },
  { hex: '#60A5FA', name: 'Baby Blue' },
  { hex: '#6366F1', name: 'Indigo' },
  { hex: '#4F46E5', name: 'Electric Indigo' },
  { hex: '#818CF8', name: 'Soft Indigo' },

  // Purples & Pinks
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#7C3AED', name: 'Deep Violet' },
  { hex: '#A855F7', name: 'Amethyst' },
  { hex: '#C084FC', name: 'Lilac' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#DB2777', name: 'Rose Pink' },
  { hex: '#F472B6', name: 'Flamingo' },
  { hex: '#F43F5E', name: 'Crimson Rose' },

  // Ambers, Oranges & Reds
  { hex: '#EF4444', name: 'Red' },
  { hex: '#DC2626', name: 'Ruby Red' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#EA580C', name: 'Tangerine' },
  { hex: '#FB923C', name: 'Peach' },
  { hex: '#F59E0B', name: 'Amber Gold' },
  { hex: '#D97706', name: 'Warm Gold' },
  { hex: '#FBBF24', name: 'Sunflower' },
  { hex: '#EAB308', name: 'Yellow' },

  // Neutrals, Slate & Earth
  { hex: '#64748B', name: 'Slate Gray' },
  { hex: '#475569', name: 'Dark Slate' },
  { hex: '#71717A', name: 'Zinc' },
  { hex: '#78716C', name: 'Stone' },
  { hex: '#854D0E', name: 'Bronze Wood' },
  { hex: '#9A3412', name: 'Burnt Sienna' },
  { hex: '#1E293B', name: 'Midnight Charcoal' },
];

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
  const [color, setColor] = useState('#10B981');
  const [icon, setIcon] = useState('Tag');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Search states for color and icon pickers
  const [colorSearch, setColorSearch] = useState('');
  const [iconSearch, setIconSearch] = useState('');

  // Filtered colors
  const filteredColors = useMemo(() => {
    if (!colorSearch.trim()) return EXTENDED_COLOR_PRESETS;
    const q = colorSearch.toLowerCase().trim();
    return EXTENDED_COLOR_PRESETS.filter(
      (c) => c.name.toLowerCase().includes(q) || c.hex.toLowerCase().includes(q)
    );
  }, [colorSearch]);

  // Filtered icons
  const filteredIcons = useMemo(() => {
    if (!iconSearch.trim()) return ALL_ICONS;
    const q = iconSearch.toLowerCase().trim();
    return ALL_ICONS.filter((name) => name.toLowerCase().includes(q));
  }, [iconSearch]);

  if (!isOpen) return null;

  const startEdit = (cat: Category) => {
    if (cat.isDefault || cat.default) {
      setError('System default categories cannot be edited');
      return;
    }
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon);
    setError(null);
    setSuccessToast(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setColor('#10B981');
    setIcon('Tag');
    setError(null);
    setColorSearch('');
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
        await onUpdateCategory(editingCategory.id, { name: categoryTitle, color, icon });
        setSuccessToast(`✨ "${categoryTitle}" updated successfully!`);
      } else {
        await onCreateCategory({ name: categoryTitle, color, icon });
        setSuccessToast(`🎉 "${categoryTitle}" created & added to your categories!`);
      }

      // Keep success feedback visible for 1.2s then gracefully close modal
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
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Configure names, colors, and icons</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-40"
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
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium disabled:opacity-40"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Name Input & Live Preview */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Category Name
              </label>
              <div className="flex items-center space-x-2">
                {/* Live Badge Preview */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0 transition-transform hover:scale-105"
                  style={{ backgroundColor: color }}
                  title="Live Preview"
                >
                  {renderCategoryIcon(icon, { className: 'w-4 h-4' })}
                </div>

                <input
                  type="text"
                  required
                  disabled={loading}
                  placeholder="e.g. Subscriptions, Groceries, Gym"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50"
                />
              </div>
            </div>

            {/* Color Palette with Dedicated Search */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Select Color ({filteredColors.length})
                </label>
                <div className="relative w-28 sm:w-36">
                  <Search className="w-3 h-3 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search color..."
                    value={colorSearch}
                    onChange={(e) => setColorSearch(e.target.value)}
                    className="w-full pl-6 pr-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 max-h-24 overflow-y-auto p-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl">
                {filteredColors.map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => setColor(c.hex)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-sm relative group"
                    style={{ backgroundColor: c.hex }}
                    title={`${c.name} (${c.hex})`}
                  >
                    {color === c.hex && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </button>
                ))}
                {filteredColors.length === 0 && (
                  <span className="text-[10px] text-slate-400 p-1">No colors match "{colorSearch}"</span>
                )}
              </div>
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

              <div className="flex flex-wrap items-center gap-1.5 max-h-28 overflow-y-auto p-2 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl">
                {filteredIcons.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${
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

            {/* Submit Button with Dynamic Spinner State */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 active:scale-[0.99]"
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

          {/* List of Existing Categories */}
          <div>
            <h4 className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Available Categories ({categories.length})
            </h4>
            <div className="space-y-1.5 sm:space-y-2">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between p-2 sm:p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style={{ backgroundColor: cat.color }}
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
                          className="p-1 sm:p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Category Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={async () => {
          if (categoryToDelete) {
            try {
              await onDeleteCategory(categoryToDelete.id);
              setCategoryToDelete(null);
            } catch (err: any) {
              setError(err?.response?.data?.message || 'Could not delete category');
              setCategoryToDelete(null);
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
