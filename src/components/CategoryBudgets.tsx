import { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/currency';
import styles from './CategoryBudgets.module.css';

export function CategoryBudgets() {
  const { state, dispatch, getCategorySpending } = useBudget();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [budgetValue, setBudgetValue] = useState('');
  const categorySpending = getCategorySpending();

  const spendingMap = new Map(categorySpending.map((cs) => [cs.category.id, cs.amount]));

  const handleSetBudget = (categoryId: string) => {
    const budget = parseFloat(budgetValue);
    dispatch({
      type: 'SET_CATEGORY_BUDGET',
      payload: {
        categoryId,
        budget: budget > 0 ? budget : undefined,
      },
    });
    setEditingId(null);
    setBudgetValue('');
  };

  const startEditing = (categoryId: string, currentBudget?: number) => {
    setEditingId(categoryId);
    setBudgetValue(currentBudget?.toString() || '');
  };

  return (
    <div className={`card ${styles.container}`}>
      <h3 className="card-title">Category Budgets</h3>
      <div className={styles.list}>
        {state.categories.map((category) => {
          const spent = spendingMap.get(category.id) || 0;
          const budget = category.budget;
          const percentage = budget ? (spent / budget) * 100 : 0;
          const isOverBudget = budget ? spent > budget : false;

          return (
            <div key={category.id} className={styles.item}>
              <div className={styles.categoryInfo}>
                <span
                  className={styles.icon}
                  style={{ backgroundColor: category.color }}
                >
                  {category.icon}
                </span>
                <span className={styles.name}>{category.name}</span>
              </div>

              {editingId === category.id ? (
                <div className={styles.editForm}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="Budget amount"
                    value={budgetValue}
                    onChange={(e) => setBudgetValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSetBudget(category.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    aria-label={`Budget for ${category.name}`}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSetBudget(category.id)}
                  >
                    Set
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className={styles.budgetInfo}>
                  {budget ? (
                    <>
                      <div className={styles.progressBar}>
                        <div
                          className={`${styles.progressFill} ${isOverBudget ? styles.over : ''}`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <span className={`${styles.amount} ${isOverBudget ? styles.over : ''}`}>
                        {formatCurrency(spent)} / {formatCurrency(budget)}
                      </span>
                    </>
                  ) : (
                    <span className={styles.noBudget}>No budget set</span>
                  )}
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => startEditing(category.id, budget)}
                    aria-label={`Edit budget for ${category.name}`}
                  >
                    {budget ? 'Edit' : 'Set'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
