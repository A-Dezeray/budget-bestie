import { useState } from 'react';
import { format } from 'date-fns';
import { useBudget } from '../context/BudgetContext';
import styles from './TransactionForm.module.css';

interface FormData {
  amount: string;
  source: string;
  date: string;
  isRecurring: boolean;
  recurringDay: string;
}

interface FormErrors {
  amount?: string;
  source?: string;
  date?: string;
}

export function IncomeForm() {
  const { dispatch } = useBudget();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    amount: '',
    source: '',
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

    if (!formData.source.trim()) {
      newErrors.source = 'Please enter an income source';
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
      type: 'ADD_INCOME',
      payload: {
        amount: parseFloat(formData.amount),
        source: formData.source.trim(),
        date: formData.date,
        isRecurring: formData.isRecurring,
        recurringDay: formData.isRecurring ? parseInt(formData.recurringDay) : undefined,
      },
    });

    setFormData({
      amount: '',
      source: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      isRecurring: false,
      recurringDay: '1',
    });
    setErrors({});
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button type="button" className={`btn btn-success ${styles.addButton}`} onClick={() => setIsOpen(true)}>
        Add Income
      </button>
    );
  }

  return (
    <div className={`card ${styles.formCard} fade-in`}>
      <div className={styles.formHeader}>
        <h3 className={styles.formTitle}>Add Income</h3>
        <button type="button" className="btn btn-ghost btn-icon" onClick={() => setIsOpen(false)} title="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="income-amount" className="form-label">Amount ($)</label>
            <input
              id="income-amount"
              type="number"
              step="0.01"
              min="0"
              className={`form-input ${errors.amount ? 'error' : ''}`}
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              aria-invalid={!!errors.amount}
              aria-describedby={errors.amount ? 'income-amount-error' : undefined}
            />
            {errors.amount && <span id="income-amount-error" className="form-error" role="alert">{errors.amount}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="income-date" className="form-label">Date</label>
            <input
              id="income-date"
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
          <label htmlFor="income-source" className="form-label">Source</label>
          <input
            id="income-source"
            type="text"
            className={`form-input ${errors.source ? 'error' : ''}`}
            placeholder="e.g., Salary, Freelance, Side hustle"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            aria-invalid={!!errors.source}
          />
          {errors.source && <span className="form-error" role="alert">{errors.source}</span>}
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
            Add Income
          </button>
        </div>
      </form>
    </div>
  );
}
