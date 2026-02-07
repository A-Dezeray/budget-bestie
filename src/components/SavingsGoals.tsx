import { useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/currency';
import { GOAL_ICONS } from '../constants';
import type { SavingsGoal } from '../types';
import styles from './SavingsGoals.module.css';

interface FormData {
  name: string;
  targetAmount: string;
  icon: string;
  deadline: string;
}

interface FormErrors {
  name?: string;
  targetAmount?: string;
}

export function SavingsGoals() {
  const { state, dispatch } = useBudget();
  const [isAdding, setIsAdding] = useState(false);
  const [contributingTo, setContributingTo] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    targetAmount: '',
    icon: 'G',
    deadline: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Please enter a goal name';
    }

    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Please enter a valid target amount';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    dispatch({
      type: 'ADD_SAVINGS_GOAL',
      payload: {
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        currentAmount: 0,
        icon: formData.icon,
        deadline: formData.deadline || undefined,
      },
    });

    setFormData({ name: '', targetAmount: '', icon: 'G', deadline: '' });
    setErrors({});
    setIsAdding(false);
  };

  const handleContribute = (goal: SavingsGoal) => {
    const amount = parseFloat(contributionAmount);
    if (amount > 0) {
      dispatch({
        type: 'CONTRIBUTE_TO_GOAL',
        payload: { goalId: goal.id, amount },
      });
    }
    setContributingTo(null);
    setContributionAmount('');
  };

  const handleDelete = (goalId: string) => {
    dispatch({ type: 'DELETE_SAVINGS_GOAL', payload: goalId });
  };

  const getProgress = (goal: SavingsGoal) => {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  };

  return (
    <div className={`card ${styles.container}`}>
      <div className="card-header">
        <h3 className="card-title">Savings Goals</h3>
        {!isAdding && (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAdding(true)}>
            New Goal
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleSubmit} className={`${styles.form} fade-in`}>
          <div className={styles.iconPicker}>
            {GOAL_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                className={`${styles.iconBtn} ${formData.icon === icon ? styles.selected : ''}`}
                onClick={() => setFormData({ ...formData, icon })}
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="form-group">
            <label className="form-label">Goal Name</label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="e.g., Vacation Fund"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Target Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`form-input ${errors.targetAmount ? 'error' : ''}`}
                placeholder="0.00"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              />
              {errors.targetAmount && <span className="form-error">{errors.targetAmount}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Deadline (optional)</label>
              <input
                type="date"
                className="form-input"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>

          <div className={styles.formActions}>
            <button type="button" className="btn btn-ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Goal
            </button>
          </div>
        </form>
      )}

      {state.savingsGoals.length === 0 && !isAdding ? (
        <div className="empty-state">
          <p className="empty-state-text">Set a savings goal to track your progress.</p>
        </div>
      ) : (
        <div className={styles.goals}>
          {state.savingsGoals.map((goal) => (
            <div key={goal.id} className={styles.goal}>
              <div className={styles.goalHeader}>
                <span className={styles.goalIcon}>{goal.icon}</span>
                <span className={styles.goalName}>{goal.name}</span>
                <button
                  type="button"
                  className={`btn btn-ghost btn-icon btn-sm ${styles.deleteBtn}`}
                  onClick={() => handleDelete(goal.id)}
                  title="Delete goal"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                  </svg>
                </button>
              </div>

              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${getProgress(goal)}%` }}
                />
              </div>

              <div className={styles.goalStats}>
                <span className={styles.goalCurrent}>
                  {formatCurrency(goal.currentAmount)}
                </span>
                <span className={styles.goalTarget}>
                  of {formatCurrency(goal.targetAmount)}
                </span>
                <span className={styles.goalPercent}>
                  {getProgress(goal).toFixed(0)}%
                </span>
              </div>

              {contributingTo === goal.id ? (
                <div className={styles.contributeForm}>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="form-input"
                    placeholder="Amount"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleContribute(goal)}
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    onClick={() => {
                      setContributingTo(null);
                      setContributionAmount('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className={`btn btn-secondary btn-sm ${styles.contributeBtn}`}
                  onClick={() => setContributingTo(goal.id)}
                >
                  Add Funds
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
