import { useRef, useState } from 'react';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import styles from './SettingsPage.module.css';

export function SettingsPage() {
  const { handleExportCSV, handleExportJSON, handleImportJSON, dispatch } = useBudget();
  const { theme, toggleTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await handleImportJSON(file);
      setImportStatus('success');
      setTimeout(() => setImportStatus('idle'), 3000);
    } catch {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    dispatch({ type: 'RESET_DATA' });
    setShowResetConfirm(false);
  };

  return (
    <div className={styles.container}>
      <h2>Settings</h2>

      <div className={styles.sections}>
        <section className={`card ${styles.section}`}>
          <h3 className="card-title">Appearance</h3>
          <div className={styles.setting}>
            <div>
              <span className={styles.settingLabel}>Theme</span>
              <span className={styles.settingDescription}>
                Switch between light and dark mode
              </span>
            </div>
            <button
              type="button"
              className={`btn btn-secondary ${styles.themeBtn}`}
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </div>
        </section>

        <section className={`card ${styles.section}`}>
          <h3 className="card-title">Data Management</h3>

          <div className={styles.setting}>
            <div>
              <span className={styles.settingLabel}>Export CSV</span>
              <span className={styles.settingDescription}>
                Download your transactions as a spreadsheet
              </span>
            </div>
            <button type="button" className="btn btn-secondary" onClick={handleExportCSV}>
              Export CSV
            </button>
          </div>

          <div className={styles.setting}>
            <div>
              <span className={styles.settingLabel}>Backup Data</span>
              <span className={styles.settingDescription}>
                Download a complete backup of all your data
              </span>
            </div>
            <button type="button" className="btn btn-secondary" onClick={handleExportJSON}>
              Download Backup
            </button>
          </div>

          <div className={styles.setting}>
            <div>
              <span className={styles.settingLabel}>Restore Data</span>
              <span className={styles.settingDescription}>
                Import a previously exported backup file
              </span>
            </div>
            <div className={styles.importGroup}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Import Backup
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className={styles.hiddenInput}
                aria-label="Select backup file to import"
              />
              {importStatus === 'success' && (
                <span className={styles.successMsg}>Data restored successfully</span>
              )}
              {importStatus === 'error' && (
                <span className={styles.errorMsg}>Failed to import data</span>
              )}
            </div>
          </div>
        </section>

        <section className={`card ${styles.section} ${styles.dangerZone}`}>
          <h3 className="card-title">Danger Zone</h3>

          <div className={styles.setting}>
            <div>
              <span className={styles.settingLabel}>Reset All Data</span>
              <span className={styles.settingDescription}>
                Permanently delete all transactions, goals, and settings
              </span>
            </div>
            {showResetConfirm ? (
              <div className={styles.confirmGroup}>
                <button type="button" className="btn btn-danger" onClick={handleReset}>
                  Confirm Reset
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => setShowResetConfirm(true)}
              >
                Reset Data
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
