import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/currency';
import styles from './BudgetHealthIndicator.module.css';

export function BudgetHealthIndicator() {
  const { getBudgetHealth, getCurrentPeriodData } = useBudget();
  const health = getBudgetHealth();
  const { totalIncome, totalExpenses, balance } = getCurrentPeriodData();

  return (
    <div className={`card ${styles.container}`} role="region" aria-label="Budget Health">
      <div className={styles.healthBar} role="progressbar" aria-valuenow={Math.round(health.percentage)} aria-valuemin={0} aria-valuemax={100} aria-label={`Budget used: ${health.percentage.toFixed(0)}%`}>
        <div
          className={`${styles.healthFill} ${styles[health.status]}`}
          style={{ width: `${Math.min(health.percentage, 100)}%` }}
        />
        {health.percentage > 100 && (
          <div
            className={`${styles.healthOverflow}`}
            style={{ width: `${Math.min(health.percentage - 100, 50)}%` }}
          />
        )}
      </div>

      <div className={styles.message}>
        <span className={`${styles.statusDot} ${styles[health.status]}`} />
        <span className={styles.messageText}>{health.message}</span>
      </div>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Income</span>
          <span className={`${styles.statValue} ${styles.income}`}>
            {formatCurrency(totalIncome)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Spent</span>
          <span className={`${styles.statValue} ${styles.expense}`}>
            {formatCurrency(totalExpenses)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Remaining</span>
          <span className={`${styles.statValue} ${balance >= 0 ? styles.positive : styles.negative}`}>
            {formatCurrency(balance)}
          </span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>Used</span>
          <span className={`${styles.statValue} ${styles[health.status]}`}>
            {health.percentage.toFixed(0)}%
          </span>
        </div>
      </div>
    </div>
  );
}
