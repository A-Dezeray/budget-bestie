import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import { formatCurrency } from '../utils/currency';
import styles from './Charts.module.css';

export function SpendingDonut() {
  const { getCategorySpending } = useBudget();
  const { theme } = useTheme();
  const categorySpending = getCategorySpending();

  const chartData = categorySpending.map((cs) => ({
    name: cs.category.name,
    value: cs.amount,
    color: cs.category.color,
  }));

  const totalSpending = categorySpending.reduce((sum, cs) => sum + cs.amount, 0);

  const tooltipStyle = {
    background: theme === 'dark' ? '#161b22' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: '8px',
    boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
    color: theme === 'dark' ? '#f0f6fc' : '#1a1a2e',
  };

  if (chartData.length === 0) {
    return (
      <div className={`card ${styles.container}`}>
        <h3 className="card-title">Spending Overview</h3>
        <div className="empty-state">
          <p className="empty-state-text">No expenses recorded this period.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${styles.container}`}>
      <h3 className="card-title">Spending Overview</h3>
      <div className={styles.donutWrapper}>
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  stroke={theme === 'dark' ? '#0d1117' : '#ffffff'}
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [formatCurrency(value), '']}
              contentStyle={tooltipStyle}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className={styles.donutCenter}>
          <span className={styles.donutTotal}>{formatCurrency(totalSpending)}</span>
          <span className={styles.donutLabel}>This Period</span>
        </div>
      </div>

      <div className={styles.legend}>
        {categorySpending.slice(0, 5).map((cs) => {
          const isOverBudget = cs.budget && cs.amount > cs.budget;
          return (
            <div key={cs.category.id} className={styles.legendItem}>
              <span
                className={styles.legendColor}
                style={{ background: cs.category.color }}
              />
              <span className={styles.legendIcon}>{cs.category.icon}</span>
              <span className={styles.legendName}>{cs.category.name}</span>
              <span className={`${styles.legendValue} ${isOverBudget ? styles.overBudget : ''}`}>
                {formatCurrency(cs.amount)}
                {cs.budget ? ` / ${formatCurrency(cs.budget)}` : ''}
              </span>
              <span className={styles.legendPercent}>
                {((cs.amount / totalSpending) * 100).toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
