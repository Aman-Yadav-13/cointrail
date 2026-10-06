import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSpendSection } from './components/HeroSpendSection';
import { CategoryPieChart } from './components/CategoryPieChart';
import { MonthlyBarChart } from './components/MonthlyBarChart';
import { ExpenseTable } from './components/ExpenseTable';
import { ExpenseModal } from './components/ExpenseModal';
import { CategoryModal } from './components/CategoryModal';
import { AuthModal } from './components/AuthModal';
import { ConfirmDialog } from './components/ConfirmDialog';
import { api } from './services/api';
import {
  CURRENCIES,
  type Currency,
  type Category,
  type ExpenseEntry,
  type OverviewStats,
  type ExpenseRequest,
  type User,
} from './types';
import { RefreshCw, AlertCircle, Plus, CheckCircle2, Sparkles } from 'lucide-react';

export function App() {
  // Theme state (Night mode default)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('cointrail_theme');
    if (saved) {
      return saved === 'dark';
    }
    return true; // Night mode by default
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cointrail_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cointrail_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  // Currency setting (defaults to ₹ INR, persisted in localStorage)
  const [currency, setCurrency] = useState<Currency>(() => {
    const saved = localStorage.getItem('cointrail_currency');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return CURRENCIES[0]; // ₹ (INR)
  });

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency);
    localStorage.setItem('cointrail_currency', JSON.stringify(newCurrency));
  };

  // User Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('cointrail_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(() => {
    return !localStorage.getItem('cointrail_token');
  });

  // Global Refresh Key (triggers refetch in Pie Chart, Bar Chart, Table & Overview on mutations)
  const [refreshKey, setRefreshKey] = useState<number>(0);

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [serverError, setServerError] = useState<string | null>(null);
  const [toastNotification, setToastNotification] = useState<string | null>(null);

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseEntry | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSignoutConfirmOpen, setIsSignoutConfirmOpen] = useState(false);

  // Verify auth on mount
  useEffect(() => {
    const token = localStorage.getItem('cointrail_token');
    if (token) {
      api.getCurrentUser()
        .then((user) => {
          setCurrentUser(user);
          localStorage.setItem('cointrail_user', JSON.stringify(user));
        })
        .catch(() => {
          api.logout();
          setCurrentUser(null);
          setIsAuthModalOpen(true);
        });
    } else {
      setIsAuthModalOpen(true);
    }

    const handleAuthExpired = () => {
      setCurrentUser(null);
      setIsAuthModalOpen(true);
      setCategories([]);
      setOverviewStats(null);
      setLoading(false);
    };

    window.addEventListener('cointrail_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('cointrail_auth_expired', handleAuthExpired);
  }, []);

  // Load categories
  const loadCategories = useCallback(async () => {
    if (!currentUser) return;
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  }, [currentUser]);

  // Load overview stats for current month
  const loadOverview = useCallback(async () => {
    if (!currentUser) return;
    try {
      setServerError(null);
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth();
      const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
      const first = `${year}-${pad(month + 1)}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const last = `${year}-${pad(month + 1)}-${pad(lastDay)}`;

      const stats = await api.getOverview(first, last);
      setOverviewStats(stats);
    } catch (err: any) {
      console.error('Failed to load overview:', err);
      if (err?.response?.status !== 401) {
        setServerError('Unable to connect to the backend server. Please verify the server is running on port 8080.');
      }
    }
  }, [currentUser]);

  // Unified loader for initial dashboard sync
  const loadInitialData = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      await Promise.all([loadCategories(), loadOverview()]);
    } finally {
      setTimeout(() => setLoading(false), 500);
    }
  }, [currentUser, loadCategories, loadOverview]);

  useEffect(() => {
    if (currentUser) {
      loadInitialData();
    } else {
      setLoading(false);
    }
  }, [currentUser, loadInitialData, refreshKey]);

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setRefreshKey((k) => k + 1);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setCategories([]);
    setOverviewStats(null);
    setIsAuthModalOpen(true);
  };

  // Handlers for Expenses
  const handleSaveExpense = async (request: ExpenseRequest) => {
    if (editingExpense) {
      await api.updateExpense(editingExpense.id, request);
      setToastNotification('✨ Expense updated successfully!');
    } else {
      await api.createExpense(request);
      setToastNotification('🎉 Expense recorded successfully!');
    }
    setRefreshKey((k) => k + 1);
    setTimeout(() => setToastNotification(null), 3000);
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await api.deleteExpense(id);
      setToastNotification('🗑️ Expense entry deleted.');
      setRefreshKey((k) => k + 1);
      setTimeout(() => setToastNotification(null), 3000);
    } catch (err: any) {
      alert('Failed to delete expense: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Handlers for Categories
  const handleCreateCategory = async (data: { name: string; color: string; icon: string }) => {
    await api.createCategory(data);
    await loadCategories();
    setRefreshKey((k) => k + 1);
  };

  const handleUpdateCategory = async (id: number, data: { name: string; color: string; icon: string }) => {
    await api.updateCategory(id, data);
    await loadCategories();
    setRefreshKey((k) => k + 1);
  };

  const handleDeleteCategory = async (id: number) => {
    await api.deleteCategory(id);
    await loadCategories();
    setRefreshKey((k) => k + 1);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* Navigation without global date filter */}
      <Navbar
        currentCurrency={currency}
        onCurrencyChange={handleCurrencyChange}
        onOpenAddExpense={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
          }
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenCategories={() => {
          if (!currentUser) {
            setIsAuthModalOpen(true);
            return;
          }
          setIsCategoryModalOpen(true);
        }}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        currentUser={currentUser}
        onLogout={() => setIsSignoutConfirmOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-3.5 sm:space-y-6 pb-24 sm:pb-8 min-w-0 overflow-x-hidden relative">
        {/* Floating Success Toast Notification */}
        {toastNotification && (
          <div className="fixed top-20 right-4 sm:right-8 z-50 p-3 sm:p-3.5 bg-slate-900/95 dark:bg-slate-800/95 text-white border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md flex items-center space-x-2.5 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastNotification}</span>
          </div>
        )}

        {/* Server error alert */}
        {serverError && (
          <div className="p-3.5 sm:p-4 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl sm:rounded-2xl flex items-center justify-between text-rose-800 dark:text-rose-300 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{serverError}</span>
            </div>
            <button
              onClick={() => {
                loadCategories();
                loadOverview();
                setRefreshKey((k) => k + 1);
              }}
              className="px-2.5 sm:px-3 py-1 bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-900 rounded-lg text-xs font-semibold text-rose-900 dark:text-rose-200 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Unified Page-Wide Blur Overlay & Viewport-Centered Gyroscopic Loader Card */}
        {loading && (
          <>
            {/* Full-bleed Backdrop Blur across whole page container */}
            <div className="fixed inset-0 bg-white/40 dark:bg-slate-950/60 backdrop-blur-[4px] z-40 pointer-events-none transition-all duration-300" />

            {/* Viewport Pinned Loader Card (Always centered in screen viewport on mobile & desktop) */}
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none p-4">
              <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200/90 dark:border-slate-800 shadow-2xl shadow-emerald-500/15 rounded-3xl p-5 sm:p-6 flex flex-col items-center max-w-[270px] w-full text-center transform animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
                {/* Gyroscopic Quantum Orbit: Dual Rings with Pulsing Node and Accelerating Comet */}
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                  {/* Outer Gyroscopic Orbital Ring with 3D tilt */}
                  <div className="absolute inset-0 rounded-full border-[1.5px] border-emerald-400/30 border-t-emerald-300 border-l-teal-200 animate-gyro-ring" />

                  {/* Inner Fast High-Velocity Radar Trail */}
                  <div className="absolute inset-2 rounded-full border-[2px] border-emerald-500/10 border-r-emerald-400 border-t-emerald-400 animate-radar-spin" />

                  {/* Radial ambient glow backdrop */}
                  <div className="absolute inset-2 rounded-full bg-emerald-500/20 blur-md animate-pulse" />

                  {/* Core Glowing Emerald Coin Node */}
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/50 animate-core-breathe">
                    <div className="w-6 h-6 rounded-full bg-slate-950/80 backdrop-blur-sm border border-emerald-300/60 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-emerald-400 to-teal-200 shadow-sm shadow-emerald-300" />
                    </div>
                  </div>

                  {/* Tiny comet satellite orbiting */}
                  <div className="absolute inset-0 animate-radar-spin pointer-events-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_8px_#34d399] -top-0.5 left-1/2 -translate-x-1/2" />
                  </div>
                </div>

                {/* Creative Financial Copy */}
                <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight flex items-center justify-center gap-1.5">
                  <span>Balancing the Books</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-bounce" />
                </h4>
                <p className="text-[11px] text-slate-400 dark:text-slate-400 font-medium mt-1">
                  Tracing every coin & trail...
                </p>
              </div>
            </div>
          </>
        )}

        <div className="space-y-4 sm:space-y-6 min-w-0">
          {/* Hero Spending Section (Current Month Snapshot) */}
          <HeroSpendSection
            stats={overviewStats}
            currency={currency}
            periodLabel="This Month"
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
          />

          {/* Visualizations Section: Independent Category Breakdown + 3-View Spending Trends */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 relative min-w-0 w-full">
            {/* Category Pie Chart with its own Month & Year Filters */}
            <CategoryPieChart
              currency={currency}
              refreshKey={refreshKey}
            />

            {/* Spending Trends Bar Chart with 3 Views: Daily, Monthly, and Yearly */}
            <MonthlyBarChart
              currency={currency}
              refreshKey={refreshKey}
            />
          </div>

          {/* Transactions Table: Lazy loaded on scroll with dedicated Date Range filter */}
          <ExpenseTable
            categories={categories}
            currency={currency}
            onEdit={(entry) => {
              setEditingExpense(entry);
              setIsExpenseModalOpen(true);
            }}
            onDelete={handleDeleteExpense}
            refreshKey={refreshKey}
          />
        </div>

        {/* Mobile Floating Action Button (FAB) */}
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 shadow-2xl shadow-emerald-500/50 flex items-center justify-center z-40 transition-all border border-emerald-400/40 cursor-pointer"
          aria-label="Add Expense"
        >
          <Plus className="w-6 h-6 stroke-[3]" />
        </button>
      </main>

      {/* Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        categories={categories}
        currency={currency}
        initialEntry={editingExpense}
        onSubmit={handleSaveExpense}
        onOpenManageCategories={() => setIsCategoryModalOpen(true)}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onCreateCategory={handleCreateCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategory}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (currentUser) setIsAuthModalOpen(false);
        }}
        onAuthSuccess={handleAuthSuccess}
      />

      <ConfirmDialog
        isOpen={isSignoutConfirmOpen}
        onClose={() => setIsSignoutConfirmOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out of CoinTrail?"
        description="Are you sure you want to end your current session? You can sign back in anytime to continue tracking your expenses."
        confirmText="Sign Out"
        cancelText="Stay Signed In"
        variant="warning"
        icon="logout"
      />
    </div>
  );
}
export default App;
