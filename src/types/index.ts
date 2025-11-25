export interface Category {
  id: string;
  name: string;
  icon: string; // Short text label or abbreviation
  color: string;
  budget?: number; // Optional biweekly budget limit
}

export interface Income {
  id: string;
  amount: number;
  source: string;
  date: string; // ISO date string
  isRecurring: boolean;
  recurringDay?: number; // Day of month for recurring income
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  date: string; // ISO date string
  isRecurring: boolean;
  recurringDay?: number; // Day of month for recurring expenses
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string; // Optional deadline
  icon: string; // Short text label
}

export interface PeriodData {
  periodStart: string; // ISO date string for start of period
  periodEnd: string; // ISO date string for end of period
  label: string; // Display label (e.g., "Nov 11-24")
  totalIncome: number;
  totalExpenses: number;
  balance: number;
}

export interface BudgetState {
  categories: Category[];
  incomes: Income[];
  expenses: Expense[];
  savingsGoals: SavingsGoal[];
}

export type BudgetHealthStatus = 'excellent' | 'good' | 'warning' | 'danger' | 'critical';

export interface BudgetHealth {
  status: BudgetHealthStatus;
  percentage: number; // Percentage of income spent
  message: string;
}

// Default categories with clean icons
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'housing', name: 'Housing', icon: 'H', color: '#264653' },
  { id: 'food', name: 'Food & Dining', icon: 'F', color: '#2a9d8f' },
  { id: 'transport', name: 'Transportation', icon: 'T', color: '#457b9d' },
  { id: 'utilities', name: 'Utilities', icon: 'U', color: '#e9c46a' },
  { id: 'entertainment', name: 'Entertainment', icon: 'E', color: '#f4a261' },
  { id: 'shopping', name: 'Shopping', icon: 'S', color: '#e76f51' },
  { id: 'health', name: 'Health', icon: 'He', color: '#84a98c' },
  { id: 'education', name: 'Education', icon: 'Ed', color: '#577590' },
  { id: 'personal', name: 'Personal Care', icon: 'P', color: '#bc6c25' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'Su', color: '#6d597a' },
  { id: 'savings', name: 'Savings', icon: 'Sa', color: '#2d6a4f' },
  { id: 'other', name: 'Other', icon: 'O', color: '#6c757d' },
];
