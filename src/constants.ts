import { Category, ThemeColor, Theme } from './types';

export const CATEGORY_COLORS: Record<Category, string> = {
  [Category.FOOD]: '#F87171',
  [Category.BILLS]: '#FBBF24',
  [Category.ENTERTAINMENT]: '#A78BFA',
  [Category.SHOPPING]: '#34D399',
  [Category.HEALTH]: '#F472B6',
  [Category.OTHER]: '#9CA3AF',
  [Category.GROCERIES]: '#4ADE80',
  [Category.RENT]: '#FB923C',
  [Category.EDUCATION]: '#38BDF8',
  [Category.INTERNET]: '#22D3EE',
  [Category.FUEL]: '#F97316',
  [Category.TRAVEL]: '#0EA5E9',
};


export const INITIAL_BALANCE = 0.00;

export const THEME_COLORS: Record<ThemeColor, string> = {
  emerald: '#10b981',
  blue: '#3b82f6',
  violet: '#8b5cf6',
  rose: '#f43f5e',
  amber: '#f59e0b',
  cyan: '#06b6d4',
};

export const LIGHT_THEME: Theme = {
  colors: {
    primary: '#10b981',
    primaryDark: '#059669',
    background: '#f3f4f6',
    card: '#ffffff',
    text: '#1f2937',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
};

export const DARK_THEME: Theme = {
  colors: {
    primary: '#10b981',
    primaryDark: '#059669',
    background: '#111827',
    card: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#9ca3af',
    border: '#374151',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
  },
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};