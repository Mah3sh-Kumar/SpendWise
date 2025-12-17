export interface Transaction {
  id: string;
  amount: number;
  place: string;
  category: Category;
  note?: string;
  timestamp: number;
}

export enum Category {
  FOOD = 'Food',
  BILLS = 'Bills',
  ENTERTAINMENT = 'Entertainment',
  SHOPPING = 'Shopping',
  HEALTH = 'Health',
  GROCERIES = 'Groceries',
  RENT = 'Rent',
  EDUCATION = 'Education',
  INTERNET = 'Internet',
  FUEL = 'Fuel',
  TRAVEL = 'Travel',
  OTHER = 'Other',
}


export interface UserProfile {
  name: string;
  email?: string;
  isDriveLinked?: boolean;
  monthlyBudget?: number;
}

export type ThemeColor = 'emerald' | 'blue' | 'violet' | 'rose' | 'amber' | 'cyan';

export interface AppState {
  vaultTotal: number;
  transactions: Transaction[];
  userProfile: UserProfile;
  darkMode: boolean;
  themeColor: ThemeColor;
}

export type TimeView = 'daily' | 'weekly' | 'monthly';

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export type ToastType = 'success' | 'error' | 'warning';

export interface Theme {
  colors: {
    primary: string;
    primaryDark: string;
    background: string;
    card: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    error: string;
    warning: string;
  };
}