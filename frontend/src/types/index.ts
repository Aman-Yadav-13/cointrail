export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string;
  isDefault: boolean;
}

export interface ExpenseEntry {
  id: number;
  amount: number;
  category: Category;
  date: string;
  description?: string;
  createdAt: string;
}

export interface ExpenseRequest {
  amount: number;
  categoryId: number;
  date: string;
  description?: string;
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  color: string;
  icon: string;
  totalAmount: number;
  count: number;
  percentage?: number;
}

export interface MonthlyTrend {
  month: number;
  monthName: string;
  totalAmount: number;
  count: number;
}

export interface OverviewStats {
  totalSpent: number;
  totalTransactions: number;
  topCategory: string;
  dailyAverage: number;
  highestSingleExpense: number;
}

export interface Currency {
  symbol: string;
  code: string;
  label: string;
}

export const CURRENCIES: Currency[] = [
  { symbol: '₹', code: 'INR', label: 'Indian Rupee (₹)' },
  { symbol: '$', code: 'USD', label: 'US Dollar ($)' },
  { symbol: '€', code: 'EUR', label: 'Euro (€)' },
  { symbol: '£', code: 'GBP', label: 'British Pound (£)' },
  { symbol: '¥', code: 'JPY', label: 'Japanese Yen (¥)' },
  { symbol: 'A$', code: 'AUD', label: 'Australian Dollar (A$)' },
  { symbol: 'C$', code: 'CAD', label: 'Canadian Dollar (C$)' },
  { symbol: 'AED', code: 'AED', label: 'UAE Dirham (AED)' },
];

export interface User {
  id: number;
  username?: string;
  email: string;
  phoneNumber?: string;
  fullName: string;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  user: User;
}

export interface LoginCredentials {
  email: string;
  password: string;
  usernameOrEmail?: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  username?: string;
}

