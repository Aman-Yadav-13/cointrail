import { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DateFilterBar } from './components/DateFilterBar';
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
  type CategorySummary,
  type MonthlyTrend,
  type OverviewStats,
  type ExpenseRequest,
  type User,
} from './types';
import { formatDateToLocalISO } from './utils/formatters';
import { RefreshCw, AlertCircle, Loader2, Plus } from 'lucide-react';

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

  // Date Filtering (default to current month)
  const [dateFilterPreset, setDateFilterPreset] = useState<string>('this-month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [periodLabel, setPeriodLabel] = useState<string>('This Month');
  const [currentDateAnchor, setCurrentDateAnchor] = useState<Date>(new Date());

  // Annual Trend Year
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

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

  // Data states
  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyTrend[]>([]);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

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
      setExpenses([]);
      setCategorySummary([]);
      setMonthlyTrend([]);
      setOverviewStats(null);
    };

    window.addEventListener('cointrail_auth_expired', handleAuthExpired);
    return () => window.removeEventListener('cointrail_auth_expired', handleAuthExpired);
  }, []);

  // Month stepping for mobile/tablet
  const handleStepMonth = (direction: -1 | 1) => {
    const nextDate = new Date(currentDateAnchor);
    nextDate.setMonth(nextDate.getMonth() + direction);
    setCurrentDateAnchor(nextDate);

    const year = nextDate.getFullYear();
    const month = nextDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startStr = formatDateToLocalISO(firstDay);
    const endStr = formatDateToLocalISO(lastDay);
    const monthName = nextDate.toLocaleString('default', { month: 'short' });

    setStartDate(startStr);
    setEndDate(endStr);
    setDateFilterPreset('custom');
    setPeriodLabel(`${monthName} ${year}`);
  };

  const handleDateFilterChange = (preset: string) => {
    setDateFilterPreset(preset);
    if (preset === 'this-month') {
      setCurrentDateAnchor(new Date());
    } else if (preset === 'last-month') {
      const now = new Date();
      setCurrentDateAnchor(new Date(now.getFullYear(), now.getMonth() - 1, 1));
    }
  };

  const handleCustomDateChange = (start: string, end: string, label?: string) => {
    setStartDate(start);
    setEndDate(end);
    setPeriodLabel(label || 'Custom Range');
    setDateFilterPreset('custom');
  };

  // Compute dates when filter preset changes
  useEffect(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    if (dateFilterPreset === 'this-month') {
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      setStartDate(formatDateToLocalISO(firstDay));
      setEndDate(formatDateToLocalISO(lastDay));
      setPeriodLabel('This Month');
    } else if (dateFilterPreset === 'last-month') {
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      setStartDate(formatDateToLocalISO(firstDay));
      setEndDate(formatDateToLocalISO(lastDay));
      setPeriodLabel('Last Month');
    } else if (dateFilterPreset === 'this-year') {
      const firstDay = new Date(year, 0, 1);
      const lastDay = new Date(year, 11, 31);
      setStartDate(formatDateToLocalISO(firstDay));
      setEndDate(formatDateToLocalISO(lastDay));
      setPeriodLabel(`Year ${year}`);
    } else if (dateFilterPreset === 'all') {
      setStartDate('2000-01-01');
      setEndDate('2099-12-31');
      setPeriodLabel('All Time');
    }
  }, [dateFilterPreset]);

  // Load all categories on mount or when user changes
  const loadCategories = useCallback(async () => {
    if (!currentUser) return;
    try {
      const cats = await api.getCategories();
      setCategories(cats);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  }, [currentUser]);

  // Load expenses and analytics based on active date range
  const loadData = useCallback(async () => {
    if (!currentUser || !startDate || !endDate) return;
    try {
      setLoading(true);
      setServerError(null);

      const [entriesData, summaryData, trendData, overviewData] = await Promise.all([
        api.getExpenses(startDate, endDate),
        api.getCategorySummary(startDate, endDate),
        api.getMonthlyTrend(selectedYear),
        api.getOverview(startDate, endDate),
      ]);

      setExpenses(entriesData);
      setCategorySummary(summaryData);
      setMonthlyTrend(trendData);
      setOverviewStats(overviewData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
      if (err?.response?.status !== 401) {
        setServerError(
          'Unable to connect to the backend server. Please verify the server is running on port 8080.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, startDate, endDate, selectedYear]);

  useEffect(() => {
    if (currentUser) {
      loadCategories();
    }
  }, [currentUser, loadCategories]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser, loadData]);

  // Auth Handlers
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setExpenses([]);
    setCategorySummary([]);
    setMonthlyTrend([]);
    setOverviewStats(null);
    setIsAuthModalOpen(true);
  };

  // Handlers for Expenses
  const handleSaveExpense = async (request: ExpenseRequest) => {
    if (editingExpense) {
      await api.updateExpense(editingExpense.id, request);
    } else {
      await api.createExpense(request);
    }
    await loadData();
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await api.deleteExpense(id);
      await loadData();
    } catch (err: any) {
      alert('Failed to delete expense: ' + (err?.response?.data?.message || err.message));
    }
  };

  // Handlers for Categories
  const handleCreateCategory = async (data: { name: string; color: string; icon: string }) => {
    await api.createCategory(data);
    await loadCategories();
  };

  const handleUpdateCategory = async (id: number, data: { name: string; color: string; icon: string }) => {
    await api.updateCategory(id, data);
    await loadCategories();
    await loadData();
  };

  const handleDeleteCategory = async (id: number) => {
    await api.deleteCategory(id);
    await loadCategories();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans text-slate-800 dark:text-slate-100 transition-colors">
      {/* Navigation */}
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
        dateFilterPreset={dateFilterPreset}
        onDateFilterChange={handleDateFilterChange}
        customStartDate={startDate}
        customEndDate={endDate}
        onCustomDateChange={handleCustomDateChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        currentUser={currentUser}
        onLogout={() => setIsSignoutConfirmOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-6 space-y-3.5 sm:space-y-6 pb-24 sm:pb-8 min-w-0 overflow-x-hidden">
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
                loadData();
              }}
              className="px-2.5 sm:px-3 py-1 bg-rose-100 dark:bg-rose-900/60 hover:bg-rose-200 dark:hover:bg-rose-900 rounded-lg text-xs font-semibold text-rose-900 dark:text-rose-200 transition-colors flex items-center space-x-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Dedicated Date Filter Bar for Mobile & Tablet (< lg screens) */}
        <DateFilterBar
          dateFilterPreset={dateFilterPreset}
          onDateFilterChange={handleDateFilterChange}
          startDate={startDate}
          endDate={endDate}
          periodLabel={periodLabel}
          onCustomDateChange={handleCustomDateChange}
          onStepMonth={handleStepMonth}
        />

        {/* Hero Spending Section (Seamless between Mobile, Tablet & Desktop) */}
        <HeroSpendSection
          stats={overviewStats}
          currency={currency}
          periodLabel={periodLabel}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
        />

        {/* Visualizations Section: Category Breakdown + Annual Spending Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 relative min-w-0 w-full">
          {loading && (
            <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 backdrop-blur-[1px] rounded-2xl flex items-center justify-center z-10">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 dark:text-emerald-400" />
            </div>
          )}
          <CategoryPieChart
            data={categorySummary}
            currency={currency}
            periodLabel={periodLabel}
          />
          <MonthlyBarChart
            data={monthlyTrend}
            currency={currency}
            selectedYear={selectedYear}
            onYearChange={(year) => setSelectedYear(year)}
          />
        </div>

        {/* Transactions Table */}
        <ExpenseTable
          expenses={expenses}
          categories={categories}
          currency={currency}
          onEdit={(entry) => {
            setEditingExpense(entry);
            setIsExpenseModalOpen(true);
          }}
          onDelete={handleDeleteExpense}
        />

        {/* Mobile Floating Action Button (FAB) for One-Thumb Expense Logging */}
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          className="sm:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 shadow-2xl shadow-emerald-500/50 flex items-center justify-center z-40 transition-all border border-emerald-400/40"
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
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        canClose={currentUser !== null}
      />

      {/* Sign Out Confirmation Modal */}
      <ConfirmDialog
        isOpen={isSignoutConfirmOpen}
        onClose={() => setIsSignoutConfirmOpen(false)}
        onConfirm={() => {
          setIsSignoutConfirmOpen(false);
          handleLogout();
        }}
        title="Sign Out of CoinTrail?"
        description="Are you sure you want to sign out? Your current session will end and you will need to sign in again to access your account."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
        icon="logout"
      />
    </div>
  );
}

export default App;
