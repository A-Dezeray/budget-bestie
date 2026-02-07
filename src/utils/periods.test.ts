import { describe, it, expect } from 'vitest';
import { computePeriodData, getPeriodLabel } from './periods';

describe('computePeriodData', () => {
  it('computes totals for incomes and expenses within period', () => {
    const periodStart = new Date(2024, 0, 1); // Jan 1
    const incomes = [
      { id: '1', amount: 500, source: 'Salary', date: '2024-01-05', isRecurring: false },
      { id: '2', amount: 300, source: 'Freelance', date: '2024-01-10', isRecurring: false },
    ];
    const expenses = [
      { id: '3', amount: 200, description: 'Groceries', categoryId: 'food', date: '2024-01-03', isRecurring: false },
    ];

    const result = computePeriodData(periodStart, incomes, expenses);
    expect(result.totalIncome).toBe(800);
    expect(result.totalExpenses).toBe(200);
    expect(result.balance).toBe(600);
  });

  it('excludes transactions outside period', () => {
    const periodStart = new Date(2024, 0, 1);
    const incomes = [
      { id: '1', amount: 500, source: 'Salary', date: '2024-01-20', isRecurring: false }, // Outside 14 days
    ];

    const result = computePeriodData(periodStart, incomes, []);
    expect(result.totalIncome).toBe(0);
  });

  it('returns zero when no transactions', () => {
    const periodStart = new Date(2024, 0, 1);
    const result = computePeriodData(periodStart, [], []);
    expect(result.totalIncome).toBe(0);
    expect(result.totalExpenses).toBe(0);
    expect(result.balance).toBe(0);
  });
});

describe('getPeriodLabel', () => {
  it('formats same-month periods', () => {
    const start = new Date(2024, 0, 1);
    const end = new Date(2024, 0, 14);
    expect(getPeriodLabel(start, end)).toBe('Jan 1-14');
  });

  it('formats cross-month periods', () => {
    const start = new Date(2024, 0, 25);
    const end = new Date(2024, 1, 7);
    expect(getPeriodLabel(start, end)).toBe('Jan 25 - Feb 7');
  });
});
