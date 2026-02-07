import { useBudget } from '../context/BudgetContext';
import { formatCurrency } from '../utils/currency';
import styles from './PeriodSummary.module.css';

export function PeriodSummary() {
  const { getCurrentPeriodData, getCategorySpending, getLast6PeriodsData } = useBudget();
  const current = getCurrentPeriodData();
  const categorySpending = getCategorySpending();
  const periods = getLast6PeriodsData();

  const previousPeriod = periods.length >= 2 ? periods[periods.length - 2] : null;

  const spendingChange = previousPeriod && previousPeriod.totalExpenses > 0
    ? ((current.totalExpenses - previousPeriod.totalExpenses) / previousPeriod.totalExpenses) * 100
    : null;

  const topCategory = categorySpending.length > 0 ? categorySpending[0] : null;

  const savingsRate = current.totalIncome > 0
    ? ((current.totalIncome - current.totalExpenses) / current.totalIncome) * 100
    : 0;

  return (
    <div className={styles.grid}>
      <div className={`card ${styles.summaryCard}`}>
        <span className={styles.label}>Period Balance</span>
        <span className={`${styles.value} ${current.balance >= 0 ? styles.positive : styles.negative}`}>
          {formatCurrency(current.balance)}
        </span>
        <span className={styles.sublabel}>{current.label}</span>
      </div>

      <div className={`card ${styles.summaryCard}`}>
        <span className={styles.label}>Savings Rate</span>
        <span className={`${styles.value} ${savingsRate >= 20 ? styles.positive : styles.negative}`}>
          {savingsRate.toFixed(0)}%
        </span>
        <span className={styles.sublabel}>
          {savingsRate >= 20 ? 'On target' : 'Below 20% target'}
        </span>
      </div>

      <div className={`card ${styles.summaryCard}`}>
        <span className={styles.label}>Top Category</span>
        <span className={styles.value} style={{ color: topCategory?.category.color }}>
          {topCategory ? topCategory.category.name : 'None'}
        </span>
        <span className={styles.sublabel}>
          {topCategory ? formatCurrency(topCategory.amount) : 'No expenses yet'}
        </span>
      </div>

      <div className={`card ${styles.summaryCard}`}>
        <span className={styles.label}>vs Last Period</span>
        <span className={`${styles.value} ${
          spendingChange !== null && spendingChange <= 0 ? styles.positive : styles.negative
        }`}>
          {spendingChange !== null ? `${spendingChange > 0 ? '+' : ''}${spendingChange.toFixed(0)}%` : '--'}
        </span>
        <span className={styles.sublabel}>
          {spendingChange !== null
            ? spendingChange <= 0 ? 'Spending decreased' : 'Spending increased'
            : 'No prior data'}
        </span>
      </div>
    </div>
  );
}
