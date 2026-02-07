import { Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { BudgetProvider } from './context/BudgetContext';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { GoalsPage } from './pages/GoalsPage';
import { SettingsPage } from './pages/SettingsPage';
import styles from './App.module.css';

function App() {
  return (
    <ThemeProvider>
      <BudgetProvider>
        <div className={styles.app}>
          <a href="#main-content" className="sr-only">
            Skip to main content
          </a>
          <Header />
          <main id="main-content" className={styles.main}>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </ErrorBoundary>
          </main>

          <footer className={styles.footer}>
            <p>Flow Finance</p>
          </footer>

          <MobileNav />
        </div>
      </BudgetProvider>
    </ThemeProvider>
  );
}

export default App;
