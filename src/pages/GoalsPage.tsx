import { ErrorBoundary } from '../components/ErrorBoundary';
import { SavingsGoals } from '../components/SavingsGoals';
import { CategoryBudgets } from '../components/CategoryBudgets';
import styles from './GoalsPage.module.css';

export function GoalsPage() {
  return (
    <div className={styles.container}>
      <h2>Goals & Budgets</h2>

      <div className={styles.grid}>
        <div>
          <ErrorBoundary>
            <SavingsGoals />
          </ErrorBoundary>
        </div>
        <div>
          <ErrorBoundary>
            <CategoryBudgets />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
