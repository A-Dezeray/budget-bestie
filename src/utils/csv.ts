import { format } from 'date-fns';
import type { BudgetState } from '../types';

export function exportToCSV(state: BudgetState): void {
  const headers = ['Date', 'Type', 'Category', 'Description/Source', 'Amount'];
  const rows: string[][] = [];

  state.incomes.forEach((income) => {
    rows.push([income.date, 'Income', '', income.source, income.amount.toString()]);
  });

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
  URL.revokeObjectURL(link.href);
}

export function exportToJSON(state: BudgetState): void {
  const json = JSON.stringify(state, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `flow-finance-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

export function importFromJSON(file: File): Promise<BudgetState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (!data.categories || !data.incomes || !data.expenses || !data.savingsGoals) {
          reject(new Error('Invalid backup file format'));
          return;
        }
        resolve(data as BudgetState);
      } catch {
        reject(new Error('Failed to parse backup file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
