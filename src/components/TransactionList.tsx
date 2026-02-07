import { format, parseISO } from 'date-fns';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/currency';
import type { Income, Expense } from '../types';
import styles from './TransactionList.module.css';

type Transaction = (Income & { type: 'income' }) | (Expense & { type: 'expense' });

export function TransactionList() {
  const { state, dispatch } = useBudget();

  const transactions: Transaction[] = [
    ...state.incomes.map((i) => ({ ...i, type: 'income' as const })),
    ...state.expenses.map((e) => ({ ...e, type: 'expense' as const })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  if (transactions.length === 0) {
    return (
      <div className={`card ${styles.container}`}>
        <h3 className="card-title">Recent Transactions</h3>
        <div className="empty-state">
          <p className="empty-state-text">No transactions yet. Add your first income or expense to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${styles.container}`}>
      <h3 className="card-title">Recent Transactions</h3>
      <div className={styles.list}>
        {transactions.slice(0, 10).map((transaction) => {
          const category =
            transaction.type === 'expense' ? getCategoryInfo(transaction.categoryId) : null;

          return (
            <div key={transaction.id} className={styles.item}>
              <div
                className={styles.icon}
                style={category ? { backgroundColor: category.color } : undefined}
              >
                {transaction.type === 'income' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                title="Delete"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                </svg>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
