import React, { createContext, useContext, useReducer, useEffect, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  BudgetState,
  Category,
  Income,
  Expense,
  SavingsGoal,
  BudgetHealth,
  BudgetHealthStatus,
  PeriodData,
} from '../types';
import { DEFAULT_CATEGORIES } from '../types';
import { format, parseISO, isWithinInterval, startOfDay, addDays, subDays } from 'date-fns';

const STORAGE_KEY = 'flow-finance-data';
const PERIOD_DAYS = 14; // Biweekly = 14 days

// Action types
type BudgetAction =
  | { type: 'ADD_INCOME'; payload: Omit<Income, 'id'> }
  | { type: 'UPDATE_INCOME'; payload: Income }
  | { type: 'DELETE_INCOME'; payload: string }
  | { type: 'ADD_EXPENSE'; payload: Omit<Expense, 'id'> }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Omit<Category, 'id'> }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_SAVINGS_GOAL'; payload: Omit<SavingsGoal, 'id'> }
  | { type: 'UPDATE_SAVINGS_GOAL'; payload: SavingsGoal }
  | { type: 'DELETE_SAVINGS_GOAL'; payload: string }
  | { type: 'CONTRIBUTE_TO_GOAL'; payload: { goalId: string; amount: number } }
  | { type: 'LOAD_DATA'; payload: BudgetState }
  | { type: 'RESET_DATA' };

const initialState: BudgetState = {
  categories: DEFAULT_CATEGORIES,
  incomes: [],
  expenses: [],
  savingsGoals: [],
};

function budgetReducer(state: BudgetState, action: BudgetAction): BudgetState {
  switch (action.type) {
    case 'ADD_INCOME':
      return {
        ...state,
        incomes: [...state.incomes, { ...action.payload, id: uuidv4() }],
      };
    case 'UPDATE_INCOME':
      return {
        ...state,
        incomes: state.incomes.map((i) =>
          i.id === action.payload.id ? action.payload : i
        ),
      };
    case 'DELETE_INCOME':
      return {
        ...state,
        incomes: state.incomes.filter((i) => i.id !== action.payload),
      };
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, { ...action.payload, id: uuidv4() }],
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.payload.id ? action.payload : e
        ),
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      };
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, { ...action.payload, id: uuidv4() }],
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter((c) => c.id !== action.payload),
        expenses: state.expenses.filter((e) => e.categoryId !== action.payload),
      };
    case 'ADD_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: [...state.savingsGoals, { ...action.payload, id: uuidv4() }],
      };
    case 'UPDATE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((g) =>
          g.id === action.payload.id ? action.payload : g
        ),
      };
    case 'DELETE_SAVINGS_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.filter((g) => g.id !== action.payload),
      };
    case 'CONTRIBUTE_TO_GOAL':
      return {
        ...state,
        savingsGoals: state.savingsGoals.map((g) =>
          g.id === action.payload.goalId
            ? { ...g, currentAmount: g.currentAmount + action.payload.amount }
            : g
        ),
      };
    case 'LOAD_DATA':
      return action.payload;
    case 'RESET_DATA':
      return initialState;
    default:
      return state;
  }
}

// Helper: Get the start of the current biweekly period
// Periods start on Mondays, aligned to a reference date
function getCurrentPeriodStart(): Date {
  const today = startOfDay(new Date());
  // Reference: Use Jan 1, 2024 as anchor (was a Monday)
  const reference = new Date(2024, 0, 1);
  const daysSinceRef = Math.floor((today.getTime() - reference.getTime()) / (1000 * 60 * 60 * 24));
  const periodsElapsed = Math.floor(daysSinceRef / PERIOD_DAYS);
  return addDays(reference, periodsElapsed * PERIOD_DAYS);
}

interface BudgetContextType {
  state: BudgetState;
  dispatch: React.Dispatch<BudgetAction>;
  // Computed values
  getCurrentPeriodData: () => PeriodData;
  getPeriodData: (periodStart: Date) => PeriodData;
  getLast6PeriodsData: () => PeriodData[];
  getBudgetHealth: () => BudgetHealth;
  getCategorySpending: (periodStart?: Date) => { category: Category; amount: number }[];
  getRemainingBalance: () => number;
  exportToCSV: () => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        dispatch({ type: 'LOAD_DATA', payload: parsed });
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  // Save data to localStorage on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const getPeriodData = (periodStart: Date): PeriodData => {
    const start = startOfDay(periodStart);
    const end = startOfDay(addDays(start, PERIOD_DAYS - 1));

    const periodIncomes = state.incomes.filter((i) => {
      const date = startOfDay(parseISO(i.date));
      return isWithinInterval(date, { start, end });
    });

    const periodExpenses = state.expenses.filter((e) => {
      const date = startOfDay(parseISO(e.date));
      return isWithinInterval(date, { start, end });
    });

    const totalIncome = periodIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Format label like "Nov 11-24" or "Nov 25 - Dec 8" if crosses months
    const startMonth = format(start, 'MMM');
    const endMonth = format(end, 'MMM');
    const label = startMonth === endMonth
      ? `${format(start, 'MMM d')}-${format(end, 'd')}`
      : `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;

    return {
      periodStart: format(start, 'yyyy-MM-dd'),
      periodEnd: format(end, 'yyyy-MM-dd'),
      label,
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
    };
  };

  const getCurrentPeriodData = (): PeriodData => {
    return getPeriodData(getCurrentPeriodStart());
  };

  const getLast6PeriodsData = (): PeriodData[] => {
    const periods: PeriodData[] = [];
    const currentStart = getCurrentPeriodStart();

    for (let i = 5; i >= 0; i--) {
      const periodStart = subDays(currentStart, i * PERIOD_DAYS);
      periods.push(getPeriodData(periodStart));
    }

    return periods;
  };

  const getBudgetHealth = (): BudgetHealth => {
    const { totalIncome, totalExpenses } = getCurrentPeriodData();

    if (totalIncome === 0) {
      return {
        status: 'warning',
        percentage: 0,
        message: 'Add your income to start tracking',
      };
    }

    const percentage = (totalExpenses / totalIncome) * 100;
    let status: BudgetHealthStatus;
    let message: string;

    if (percentage <= 50) {
      status = 'excellent';
      message = 'Excellent savings rate this period';
    } else if (percentage <= 70) {
      status = 'good';
      message = 'On track with room to optimize';
    } else if (percentage <= 85) {
      status = 'warning';
      message = 'Approaching budget threshold';
    } else if (percentage <= 100) {
      status = 'danger';
      message = 'Spending exceeds recommended limits';
    } else {
      status = 'critical';
      message = 'Expenses exceed income this period';
    }

    return { status, percentage, message };
  };

  const getCategorySpending = (periodStart?: Date): { category: Category; amount: number }[] => {
    const start = startOfDay(periodStart || getCurrentPeriodStart());
    const end = startOfDay(addDays(start, PERIOD_DAYS - 1));

    const categorySpending = state.categories.map((category) => {
      const amount = state.expenses
        .filter((e) => {
          const date = startOfDay(parseISO(e.date));
          return (
            e.categoryId === category.id &&
            isWithinInterval(date, { start, end })
          );
        })
        .reduce((sum, e) => sum + e.amount, 0);

      return { category, amount };
    });

    return categorySpending.filter((cs) => cs.amount > 0).sort((a, b) => b.amount - a.amount);
  };

  const getRemainingBalance = (): number => {
    const { balance } = getCurrentPeriodData();
    return balance;
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Type', 'Category', 'Description/Source', 'Amount'];
    const rows: string[][] = [];

    // Add incomes
    state.incomes.forEach((income) => {
      rows.push([
        income.date,
        'Income',
        '',
        income.source,
        income.amount.toString(),
      ]);
    });

    // Add expenses
    state.expenses.forEach((expense) => {
      const category = state.categories.find((c) => c.id === expense.categoryId);
      rows.push([
        expense.date,
        'Expense',
        category ? category.name : '',
        expense.description,
        (-expense.amount).toString(),
      ]);
    });

    // Sort by date
    rows.sort((a, b) => a[0].localeCompare(b[0]));

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `flow-finance-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
  };

  return (
    <BudgetContext.Provider
      value={{
        state,
        dispatch,
        getCurrentPeriodData,
        getPeriodData,
        getLast6PeriodsData,
        getBudgetHealth,
        getCategorySpending,
        getRemainingBalance,
        exportToCSV,
      }}
    >
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudget() {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within a BudgetProvider');
  }
  return context;
}
