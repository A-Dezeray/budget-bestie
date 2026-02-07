import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useBudget } from '../context/BudgetContext';
import { useTheme } from '../context/ThemeContext';
import { formatCompactCurrency } from '../utils/currency';
import styles from './Charts.module.css';

export function SpendingChart() {
  const { getLast6PeriodsData } = useBudget();
  const { theme } = useTheme();
  const periodsData = getLast6PeriodsData();

  const chartData = periodsData.map((data) => ({
    period: data.label,
    income: data.totalIncome,
    expenses: data.totalExpenses,
    balance: data.balance,
  }));

  const hasData = periodsData.some((d) => d.totalIncome > 0 || d.totalExpenses > 0);

  const gridColor = theme === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const textColor = theme === 'dark' ? '#a3aab5' : '#4a4a68';
  const incomeColor = theme === 'dark' ? '#3fb950' : '#2d6a4f';
  const expenseColor = theme === 'dark' ? '#f85149' : '#9b2226';

  const tooltipStyle = {
    background: theme === 'dark' ? '#161b22' : '#ffffff',
    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: '8px',
    boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.05)',
    color: theme === 'dark' ? '#f0f6fc' : '#1a1a2e',
  };

  if (!hasData) {
    return (
      <div className={`card ${styles.container}`}>
        <h3 className="card-title">Recent Periods</h3>
        <div className="empty-state">
          <p className="empty-state-text">Add transactions to see your spending trends.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`card ${styles.container}`}>
      <h3 className="card-title">Recent Periods</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="period"
              tick={{ fill: textColor, fontSize: 12 }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
            />
            <YAxis
              tickFormatter={formatCompactCurrency}
              tick={{ fill: textColor, fontSize: 12 }}
              axisLine={{ stroke: gridColor }}
              tickLine={{ stroke: gridColor }}
            />
            <Tooltip
              formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              contentStyle={tooltipStyle}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              name="Income"
              stroke={incomeColor}
              strokeWidth={2}
              dot={{ fill: incomeColor, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke={expenseColor}
              strokeWidth={2}
              dot={{ fill: expenseColor, strokeWidth: 2, r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
