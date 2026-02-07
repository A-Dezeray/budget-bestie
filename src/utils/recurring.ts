import { format, getDaysInMonth } from 'date-fns';
import { getCurrentPeriodStart, getPeriodEnd } from './periods';
import type { Income, Expense } from '../types';

function getRecurringDatesInPeriod(recurringDay: number, periodStart: Date, periodEnd: Date): string[] {
  const dates: string[] = [];
  const startMonth = periodStart.getMonth();
  const startYear = periodStart.getFullYear();
  const endMonth = periodEnd.getMonth();
  const endYear = periodEnd.getFullYear();

  // Check current period's months (could span 2 months)
  const monthsToCheck: { year: number; month: number }[] = [
    { year: startYear, month: startMonth },
  ];
  if (startMonth !== endMonth || startYear !== endYear) {
    monthsToCheck.push({ year: endYear, month: endMonth });
  }

  for (const { year, month } of monthsToCheck) {
    const maxDay = getDaysInMonth(new Date(year, month));
    const day = Math.min(recurringDay, maxDay);
    const date = new Date(year, month, day);

    if (date >= periodStart && date <= periodEnd) {
      dates.push(format(date, 'yyyy-MM-dd'));
    }
  }

  return dates;
}

export function generateRecurringTransactions(
  incomes: Income[],
  expenses: Expense[]
): { newIncomes: Omit<Income, 'id'>[]; newExpenses: Omit<Expense, 'id'>[] } {
  const periodStart = getCurrentPeriodStart();
  const periodEnd = getPeriodEnd(periodStart);

  const newIncomes: Omit<Income, 'id'>[] = [];
  const newExpenses: Omit<Expense, 'id'>[] = [];

  // Process recurring incomes
  const recurringIncomes = incomes.filter((i) => i.isRecurring && i.recurringDay);
  for (const income of recurringIncomes) {
    const dates = getRecurringDatesInPeriod(income.recurringDay!, periodStart, periodEnd);
    for (const date of dates) {
      const alreadyExists = incomes.some(
        (i) => i.source === income.source && i.date === date && i.amount === income.amount
      );
      if (!alreadyExists) {
        newIncomes.push({
          amount: income.amount,
          source: income.source,
          date,
          isRecurring: true,
          recurringDay: income.recurringDay,
        });
      }
    }
  }

  // Process recurring expenses
  const recurringExpenses = expenses.filter((e) => e.isRecurring && e.recurringDay);
  for (const expense of recurringExpenses) {
    const dates = getRecurringDatesInPeriod(expense.recurringDay!, periodStart, periodEnd);
    for (const date of dates) {
      const alreadyExists = expenses.some(
        (e) =>
          e.description === expense.description &&
          e.date === date &&
          e.amount === expense.amount &&
          e.categoryId === expense.categoryId
      );
      if (!alreadyExists) {
        newExpenses.push({
          amount: expense.amount,
          description: expense.description,
          categoryId: expense.categoryId,
          date,
          isRecurring: true,
          recurringDay: expense.recurringDay,
        });
      }
    }
  }

  return { newIncomes, newExpenses };
}
