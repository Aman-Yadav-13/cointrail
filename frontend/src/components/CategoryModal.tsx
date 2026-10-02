import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check } from 'lucide-react';
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

const COLOR_PRESETS = [
  '#10B981', // Emerald
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#84CC16', // Lime
  '#F97316', // Orange
  '#64748B', // Slate
];

const AVAILABLE_ICONS = Object.keys(ICON_MAP);

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

  if (!isOpen) return null;

  const startEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setColor(cat.color);
    setIcon(cat.icon);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingCategory(null);
    setName('');
    setColor('#10B981');
    setIcon('Tag');
    setError(null);
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
      if (editingCategory) {
        await onUpdateCategory(editingCategory.id, { name: name.trim(), color, icon });
      } else {
        await onCreateCategory({ name: name.trim(), color, icon });
      }
      cancelEdit();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 py-6 sm:py-10 bg-slate-900/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] m-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-slate-800 flex-shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Manage Categories</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Configure names, colors, and icons</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

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
            className="bg-slate-50 dark:bg-slate-800/80 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {editingCategory ? `Edit: ${editingCategory.name}` : 'Add New Category'}
              </span>
              {editingCategory && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-medium"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Freelance, Subscriptions, Fitness"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-1.5 sm:py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Color Palette */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Color</label>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {COLOR_PRESETS.map((hex) => (
                  <button
                    key={hex}
                    type="button"
                    onClick={() => setColor(hex)}
                    className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-transform hover:scale-110 shadow-sm"
                    style={{ backgroundColor: hex }}
                  >
                    {color === hex && <Check className="w-3 h-3 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Picker */}
            <div>
              <label className="block text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Icon</label>
              <div className="flex flex-wrap items-center gap-1.5 max-h-20 sm:max-h-24 overflow-y-auto p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                {AVAILABLE_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => setIcon(iconName)}
                    className={`p-1 rounded-lg transition-colors flex items-center justify-center ${
                      icon === iconName
                        ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                    title={iconName}
                  >
                    {renderCategoryIcon(iconName, { className: 'w-3.5 h-3.5' })}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{editingCategory ? 'Update' : 'Create Category'}</span>
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
                    {cat.isDefault && (
                      <span className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 font-medium flex-shrink-0">
                        Default
                      </span>
                    )}
                  </div>

                  <div className="flex items-center space-x-0.5 flex-shrink-0 ml-2">
                    <button
                      onClick={() => startEdit(cat)}
                      className="p-1 sm:p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    </button>
                    {!cat.isDefault && (
                      <button
                        onClick={() => setCategoryToDelete(cat)}
                        className="p-1 sm:p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        title="Delete Category"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
