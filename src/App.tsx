import { ThemeProvider } from './context/ThemeContext';
import { BudgetProvider } from './context/BudgetContext';
import { Header } from './components/Header';
import { BudgetHealthIndicator } from './components/BudgetHealthIndicator';
import { IncomeForm } from './components/IncomeForm';
import { ExpenseForm } from './components/ExpenseForm';
import { TransactionList } from './components/TransactionList';
import { SpendingChart } from './components/SpendingChart';
import { SpendingDonut } from './components/SpendingDonut';
import { SavingsGoals } from './components/SavingsGoals';
import styles from './App.module.css';

function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <div className={styles.app}>
          <Header />
          <main className={styles.main}>
            <div className={styles.container}>
              <BudgetHealthIndicator />

              <div className={styles.grid}>
                <div className={styles.leftColumn}>
                  <div className={styles.formButtons}>
                    <IncomeForm />
                    <ExpenseForm />
                  </div>
                  <TransactionList />
                  <SavingsGoals />
                </div>

                <div className={styles.rightColumn}>
                  <SpendingDonut />
                  <SpendingChart />
                </div>
              </div>
            </div>
          </main>

          <footer className={styles.footer}>
            <p>Flow Finance</p>
          </footer>
        </div>
      </BudgetProvider>
    </ThemeProvider>
  );
}

export default App;
