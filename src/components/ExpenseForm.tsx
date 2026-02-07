import { useState } from 'react';
import { format } from 'date-fns';
import { useBudget } from '../context/BudgetContext';
import styles from './TransactionForm.module.css';

interface FormData {
  amount: string;
  description: string;
  categoryId: string;
  date: string;
  isRecurring: boolean;
  recurringDay: string;
}

interface FormErrors {
  amount?: string;
  description?: string;
  categoryId?: string;
  date?: string;
}

export function ExpenseForm() {
  const { dispatch, state } = useBudget();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    description: '',
    categoryId: state.categories[0]?.id || '',
    date: format(new Date(), 'yyyy-MM-dd'),
    isRecurring: false,
    recurringDay: '1',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Please select a category';
    }

    if (!formData.date) {
      newErrors.date = 'Please select a date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        date: formData.date,
        isRecurring: formData.isRecurring,
        recurringDay: formData.isRecurring ? parseInt(formData.recurringDay) : undefined,
      },
    });

    setFormData({
      amount: '',
      description: '',
      categoryId: state.categories[0]?.id || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      isRecurring: false,
      recurringDay: '1',
    });
    setErrors({});
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button type="button" className={`btn btn-danger ${styles.addButton}`} onClick={() => setIsOpen(true)}>
        Add Expense
      </button>
    );
  }

  return (
    <div className={`card ${styles.formCard} fade-in`}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Add Expense</h3>
        <button type="button" className="btn btn-ghost btn-icon" onClick={() => setIsOpen(false)} title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="expense-amount" className="form-label">Amount ($)</label>
            <input
              id="expense-amount"
              type="number"
              step="0.01"
              min="0"
              className={`form-input ${errors.amount ? 'error' : ''}`}
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              aria-invalid={!!errors.amount}
            />
            {errors.amount && <span className="form-error" role="alert">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="expense-date" className="form-label">Date</label>
            <input
              id="expense-date"
              type="date"
              className={`form-input ${errors.date ? 'error' : ''}`}
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              aria-invalid={!!errors.date}
            />
            {errors.date && <span className="form-error" role="alert">{errors.date}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="expense-description" className="form-label">Description</label>
          <input
            id="expense-description"
            type="text"
            className={`form-input ${errors.description ? 'error' : ''}`}
            placeholder="e.g., Groceries at Whole Foods"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            aria-invalid={!!errors.description}
          />
          {errors.description && <span className="form-error" role="alert">{errors.description}</span>}
        </div>

        <div className="form-group" role="radiogroup" aria-label="Expense category">
          <span className="form-label">Category</span>
          <div className={styles.categoryGrid}>
            {state.categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`${styles.categoryBtn} ${
                  formData.categoryId === category.id ? styles.selected : ''
                }`}
                style={{
                  '--category-color': category.color,
                } as React.CSSProperties}
                onClick={() => setFormData({ ...formData, categoryId: category.id })}
              >
                <span className={styles.categoryIcon}>{category.icon}</span>
                <span className={styles.categoryName}>{category.name}</span>
              </button>
            ))}
          </div>
          {errors.categoryId && <span className="form-error">{errors.categoryId}</span>}
        </div>

        <div className={styles.checkboxGroup}>
          <label className={styles.checkbox}>
            <input
              type="checkbox"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
            />
            <span className={styles.checkboxLabel}>Recurring monthly</span>
          </label>

          {formData.isRecurring && (
            <div className={styles.recurringDay}>
              <span>on day</span>
              <select
                className="form-input"
                value={formData.recurringDay}
                onChange={(e) => setFormData({ ...formData, recurringDay: e.target.value })}
              >
                {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={() => setIsOpen(false)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Add Expense
          </button>
        </div>
      </form>
    </div>
  );
}
