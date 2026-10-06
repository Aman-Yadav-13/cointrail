import axios from 'axios';
import type {
  Category,
  ExpenseEntry,
  ExpenseRequest,
  CategorySummary,
  MonthlyTrend,
  DailyTrend,
  YearlyTrend,
  PagedResponse,
  OverviewStats,
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage on every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('cointrail_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401 Unauthorized
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url.includes('/auth/')) {
      // Clear expired or invalid token
      localStorage.removeItem('cointrail_token');
      localStorage.removeItem('cointrail_user');
      window.dispatchEvent(new Event('cointrail_auth_expired'));
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const res = await client.post<AuthResponse>('/auth/login', credentials);
    if (res.data.token) {
      localStorage.setItem('cointrail_token', res.data.token);
      localStorage.setItem('cointrail_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const res = await client.post<AuthResponse>('/auth/register', credentials);
    if (res.data.token) {
      localStorage.setItem('cointrail_token', res.data.token);
      localStorage.setItem('cointrail_user', JSON.stringify(res.data.user));
    }
    return res.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await client.get<User>('/auth/me');
    return res.data;
  },

  logout(): void {
    localStorage.removeItem('cointrail_token');
    localStorage.removeItem('cointrail_user');
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await client.get<Category[]>('/categories');
    return res.data;
  },

  async getCategoriesPaged(page: number = 0, size: number = 15, search?: string): Promise<PagedResponse<Category>> {
    const params: Record<string, string | number> = { page, size };
    if (search && search.trim()) params.search = search.trim();
    const res = await client.get<PagedResponse<Category>>('/categories/paged', { params });
    return res.data;
  },

  async createCategory(data: { name: string; color: string; icon: string }): Promise<Category> {
    const res = await client.post<Category>('/categories', data);
    return res.data;
  },

  async updateCategory(id: number, data: { name: string; color: string; icon: string }): Promise<Category> {
    const res = await client.put<Category>(`/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await client.delete(`/categories/${id}`);
  },

  // Expenses
  async getExpenses(startDate?: string, endDate?: string, categoryId?: number): Promise<ExpenseEntry[]> {
    const params: Record<string, string | number> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (categoryId) params.categoryId = categoryId;
    const res = await client.get<ExpenseEntry[]>('/entries', { params });
    return res.data;
  },

  async getExpensesPaged(
    page: number = 0,
    size: number = 20,
    startDate?: string,
    endDate?: string,
    categoryId?: number
  ): Promise<PagedResponse<ExpenseEntry>> {
    const params: Record<string, string | number> = { page, size };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (categoryId) params.categoryId = categoryId;
    const res = await client.get<PagedResponse<ExpenseEntry>>('/entries', { params });
    return res.data;
  },

  async createExpense(data: ExpenseRequest): Promise<ExpenseEntry> {
    const res = await client.post<ExpenseEntry>('/entries', data);
    return res.data;
  },

  async updateExpense(id: number, data: ExpenseRequest): Promise<ExpenseEntry> {
    const res = await client.put<ExpenseEntry>(`/entries/${id}`, data);
    return res.data;
  },

  async deleteExpense(id: number): Promise<void> {
    await client.delete(`/entries/${id}`);
  },

  // Analytics
  async getCategorySummary(startDate?: string, endDate?: string): Promise<CategorySummary[]> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await client.get<CategorySummary[]>('/analytics/category-summary', { params });
    return res.data;
  },

  async getDailyTrend(year: number, month: number): Promise<DailyTrend[]> {
    const res = await client.get<DailyTrend[]>('/analytics/daily-trend', { params: { year, month } });
    return res.data;
  },

  async getMonthlyTrend(year: number): Promise<MonthlyTrend[]> {
    const res = await client.get<MonthlyTrend[]>('/analytics/monthly-trend', { params: { year } });
    return res.data;
  },

  async getYearlyTrend(): Promise<YearlyTrend[]> {
    const res = await client.get<YearlyTrend[]>('/analytics/yearly-trend');
    return res.data;
  },

  async getOverview(startDate?: string, endDate?: string): Promise<OverviewStats> {
    const params: Record<string, string> = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await client.get<OverviewStats>('/analytics/overview', { params });
    return res.data;
  },
};
