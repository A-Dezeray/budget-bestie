import { format, startOfDay, addDays, subDays, parseISO, isWithinInterval } from 'date-fns';
import { PERIOD_DAYS, REFERENCE_DATE } from '../constants';
import type { Income, Expense, PeriodData } from '../types';

export function getCurrentPeriodStart(): Date {
  const today = startOfDay(new Date());
  const daysSinceRef = Math.floor(
    (today.getTime() - REFERENCE_DATE.getTime()) / (1000 * 60 * 60 * 24)
  );
  const periodsElapsed = Math.floor(daysSinceRef / PERIOD_DAYS);
  return addDays(REFERENCE_DATE, periodsElapsed * PERIOD_DAYS);
}

export function getPeriodEnd(periodStart: Date): Date {
  return startOfDay(addDays(periodStart, PERIOD_DAYS - 1));
}

export function getPeriodLabel(start: Date, end: Date): string {
  const startMonth = format(start, 'MMM');
  const endMonth = format(end, 'MMM');
  return startMonth === endMonth
    ? `${format(start, 'MMM d')}-${format(end, 'd')}`
    : `${format(start, 'MMM d')} - ${format(end, 'MMM d')}`;
}

export function computePeriodData(
  periodStart: Date,
  incomes: Income[],
  expenses: Expense[]
): PeriodData {
  const start = startOfDay(periodStart);
  const end = getPeriodEnd(start);

  const periodIncomes = incomes.filter((i) => {
    const date = startOfDay(parseISO(i.date));
    return isWithinInterval(date, { start, end });
  });

  const periodExpenses = expenses.filter((e) => {
    const date = startOfDay(parseISO(e.date));
    return isWithinInterval(date, { start, end });
  });

  const totalIncome = periodIncomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = periodExpenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    periodStart: format(start, 'yyyy-MM-dd'),
    periodEnd: format(end, 'yyyy-MM-dd'),
    label: getPeriodLabel(start, end),
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
  };
}

export function getLast6Periods(
  incomes: Income[],
  expenses: Expense[]
): PeriodData[] {
  const periods: PeriodData[] = [];
  const currentStart = getCurrentPeriodStart();

  for (let i = 5; i >= 0; i--) {
    const periodStart = subDays(currentStart, i * PERIOD_DAYS);
    periods.push(computePeriodData(periodStart, incomes, expenses));
  }

  return periods;
}
