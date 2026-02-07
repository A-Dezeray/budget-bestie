import { ErrorBoundary } from '../components/ErrorBoundary';
import { BudgetHealthIndicator } from '../components/BudgetHealthIndicator';
import { PeriodSummary } from '../components/PeriodSummary';
import { IncomeForm } from '../components/IncomeForm';
import { ExpenseForm } from '../components/ExpenseForm';
import { TransactionList } from '../components/TransactionList';
import { SpendingDonut } from '../components/SpendingDonut';
import { SpendingChart } from '../components/SpendingChart';
import styles from './DashboardPage.module.css';

export function DashboardPage() {
  return (
    <div className={styles.container}>
      <ErrorBoundary>
        <BudgetHealthIndicator />
      </ErrorBoundary>

      <ErrorBoundary>
        <PeriodSummary />
      </ErrorBoundary>

      <div className={styles.grid}>
        <div className={styles.leftColumn}>
          <div className={styles.formButtons}>
            <IncomeForm />
            <ExpenseForm />
          </div>
          <ErrorBoundary>
            <TransactionList />
          </ErrorBoundary>
        </div>

        <div className={styles.rightColumn}>
          <ErrorBoundary>
            <SpendingDonut />
          </ErrorBoundary>
          <ErrorBoundary>
            <SpendingChart />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
