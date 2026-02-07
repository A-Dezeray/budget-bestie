import React, { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type {
  BudgetState,
  Category,
  Income,
  Expense,
  SavingsGoal,
  BudgetHealth,
  PeriodData,
} from '../types';
import { STORAGE_KEY, DEFAULT_CATEGORIES, PERIOD_DAYS } from '../constants';
import { computePeriodData, getCurrentPeriodStart, getLast6Periods } from '../utils/periods';
import { computeBudgetHealth } from '../utils/budgetHealth';
import { exportToCSV, exportToJSON, importFromJSON } from '../utils/csv';
import { generateRecurringTransactions } from '../utils/recurring';
import { startOfDay, addDays, parseISO, isWithinInterval } from 'date-fns';

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
  | { type: 'SET_CATEGORY_BUDGET'; payload: { categoryId: string; budget: number | undefined } }
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
    case 'SET_CATEGORY_BUDGET':
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.categoryId
            ? { ...c, budget: action.payload.budget }
            : c
        ),
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

interface BudgetContextType {
  state: BudgetState;
  dispatch: React.Dispatch<BudgetAction>;
  getCurrentPeriodData: () => PeriodData;
  getPeriodData: (periodStart: Date) => PeriodData;
  getLast6PeriodsData: () => PeriodData[];
  getBudgetHealth: () => BudgetHealth;
  getCategorySpending: (periodStart?: Date) => { category: Category; amount: number; budget?: number }[];
  getRemainingBalance: () => number;
  handleExportCSV: () => void;
  handleExportJSON: () => void;
  handleImportJSON: (file: File) => Promise<void>;
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

  // Auto-generate recurring transactions on mount
  useEffect(() => {
    const { newIncomes, newExpenses } = generateRecurringTransactions(
      state.incomes,
      state.expenses
    );

    for (const income of newIncomes) {
      dispatch({ type: 'ADD_INCOME', payload: income });
    }
    for (const expense of newExpenses) {
      dispatch({ type: 'ADD_EXPENSE', payload: expense });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPeriodData = useCallback(
    (periodStart: Date): PeriodData => {
      return computePeriodData(periodStart, state.incomes, state.expenses);
    },
    [state.incomes, state.expenses]
  );

  const getCurrentPeriodDataFn = useCallback((): PeriodData => {
    return getPeriodData(getCurrentPeriodStart());
  }, [getPeriodData]);

  const getLast6PeriodsData = useCallback((): PeriodData[] => {
    return getLast6Periods(state.incomes, state.expenses);
  }, [state.incomes, state.expenses]);

  const getBudgetHealth = useCallback((): BudgetHealth => {
    const { totalIncome, totalExpenses } = getCurrentPeriodDataFn();
    return computeBudgetHealth(totalIncome, totalExpenses);
  }, [getCurrentPeriodDataFn]);

  const getCategorySpending = useCallback(
    (periodStart?: Date): { category: Category; amount: number; budget?: number }[] => {
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

        return { category, amount, budget: category.budget };
      });

      return categorySpending.filter((cs) => cs.amount > 0).sort((a, b) => b.amount - a.amount);
    },
    [state.categories, state.expenses]
  );

  const getRemainingBalance = useCallback((): number => {
    const { balance } = getCurrentPeriodDataFn();
    return balance;
  }, [getCurrentPeriodDataFn]);

  const handleExportCSV = useCallback(() => {
    exportToCSV(state);
  }, [state]);

  const handleExportJSON = useCallback(() => {
    exportToJSON(state);
  }, [state]);

  const handleImportJSON = useCallback(async (file: File) => {
    const data = await importFromJSON(file);
    dispatch({ type: 'LOAD_DATA', payload: data });
  }, []);

  return (
    <BudgetContext.Provider
      value={{
        state,
        dispatch,
        getCurrentPeriodData: getCurrentPeriodDataFn,
        getPeriodData,
        getLast6PeriodsData,
        getBudgetHealth,
        getCategorySpending,
        getRemainingBalance,
        handleExportCSV,
        handleExportJSON,
        handleImportJSON,
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
