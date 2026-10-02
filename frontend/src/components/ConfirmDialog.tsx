import React, { useEffect } from 'react';
import { LogOut, Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  icon?: 'logout' | 'trash' | 'alert';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  icon = 'alert',
  loading = false,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !loading) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (icon) {
      case 'logout':
        return <LogOut className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 dark:text-rose-400" />;
      case 'trash':
        return <Trash2 className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 dark:text-rose-400" />;
      case 'alert':
      default:
        return <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 dark:text-amber-400" />;
    }
  };

  const getIconBackground = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/60';
      case 'warning':
        return 'bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/60';
      case 'primary':
      default:
        return 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-100 dark:border-emerald-900/60';
    }
  };

  const getConfirmButtonClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-rose-600 hover:bg-rose-500 active:scale-98 text-white shadow-lg shadow-rose-600/20';
      case 'warning':
        return 'bg-amber-600 hover:bg-amber-500 active:scale-98 text-white shadow-lg shadow-amber-600/20';
      case 'primary':
      default:
        return 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white shadow-lg shadow-emerald-600/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-150 overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-sm sm:max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative m-auto"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
      >
        {/* Close icon button */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-5 sm:p-6 text-center">
          {/* Animated Icon Pill */}
          <div
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl mx-auto flex items-center justify-center mb-4 ${getIconBackground()}`}
          >
            {renderIcon()}
          </div>

          <h3
            id="confirm-dialog-title"
            className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-2"
          >
            {title}
          </h3>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {description}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 active:scale-98 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl transition-all disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`flex-1 py-2.5 px-4 font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50 ${getConfirmButtonClasses()}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{confirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
