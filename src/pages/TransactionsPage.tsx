import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/currency';
import { IncomeForm } from '../components/IncomeForm';
import { ExpenseForm } from '../components/ExpenseForm';
import type { Income, Expense } from '../types';
import styles from './TransactionsPage.module.css';

type Transaction = (Income & { type: 'income' }) | (Expense & { type: 'expense' });
type FilterType = 'all' | 'income' | 'expense';

export function TransactionsPage() {
  const { state, dispatch } = useBudget();
  const [filter, setFilter] = useState<FilterType>('all');
  const [search, setSearch] = useState('');

  const transactions: Transaction[] = [
    ...state.incomes.map((i) => ({ ...i, type: 'income' as const })),
    ...state.expenses.map((e) => ({ ...e, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filtered = transactions.filter((t) => {
    if (filter !== 'all' && t.type !== filter) return false;
    if (search) {
      const term = search.toLowerCase();
      const text = t.type === 'income'
        ? (t as Income).source
        : (t as Expense).description;
      return text.toLowerCase().includes(term);
    }
    return true;
  });

  const handleDelete = (transaction: Transaction) => {
    if (transaction.type === 'income') {
      dispatch({ type: 'DELETE_INCOME', payload: transaction.id });
    } else {
      dispatch({ type: 'DELETE_EXPENSE', payload: transaction.id });
    }
  };

  const getCategoryInfo = (categoryId: string) => {
    return state.categories.find((c) => c.id === categoryId);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Transactions</h2>
        <div className={styles.actions}>
          <IncomeForm />
          <ExpenseForm />
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.filters} role="tablist" aria-label="Transaction filter">
          {(['all', 'income', 'expense'] as FilterType[]).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              className={`${styles.filterBtn} ${filter === f ? styles.active : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <input
          type="search"
          className={`form-input ${styles.search}`}
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search transactions"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <p className="empty-state-text">
              {search ? 'No transactions match your search.' : 'No transactions yet.'}
            </p>
          </div>
        </div>
      ) : (
        <div className={`card ${styles.list}`}>
          {filtered.map((transaction) => {
            const category =
              transaction.type === 'expense' ? getCategoryInfo(transaction.categoryId) : null;

            return (
              <div key={transaction.id} className={styles.item}>
                <div
                  className={styles.icon}
                  style={category ? { backgroundColor: category.color } : undefined}
                >
                  {transaction.type === 'income' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M12 19V5M5 12l7-7 7 7"/>
                    </svg>
                  ) : (
                    <span>{category?.icon || 'O'}</span>
                  )}
                </div>

                <div className={styles.details}>
                  <span className={styles.description}>
                    {transaction.type === 'income'
                      ? (transaction as Income).source
                      : (transaction as Expense).description}
                  </span>
                  <span className={styles.meta}>
                    {format(parseISO(transaction.date), 'MMM d, yyyy')}
                    {category && ` · ${category.name}`}
                    {transaction.isRecurring && (
                      <span className={styles.recurringBadge}>Recurring</span>
                    )}
                  </span>
                </div>

                <div className={styles.amount}>
                  <span
                    className={`${styles.value} ${
                      transaction.type === 'income' ? styles.income : styles.expense
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>

                <button
                  type="button"
                  className={`btn btn-ghost btn-icon ${styles.deleteBtn}`}
                  onClick={() => handleDelete(transaction)}
                  aria-label={`Delete ${transaction.type === 'income' ? (transaction as Income).source : (transaction as Expense).description}`}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}

      <p className={styles.count} aria-live="polite">
        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
