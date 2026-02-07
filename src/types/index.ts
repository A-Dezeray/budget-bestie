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

