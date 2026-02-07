import { HEALTH_THRESHOLDS } from '../constants';
import type { BudgetHealth, BudgetHealthStatus } from '../types';

export function computeBudgetHealth(
  totalIncome: number,
  totalExpenses: number
): BudgetHealth {
  if (totalIncome === 0) {
    return {
      status: 'warning',
      percentage: 0,
      message: 'Add your income to start tracking',
    };
  }

  const percentage = (totalExpenses / totalIncome) * 100;
  let status: BudgetHealthStatus;
  let message: string;

  if (percentage <= HEALTH_THRESHOLDS.excellent) {
    status = 'excellent';
    message = 'Excellent savings rate this period';
  } else if (percentage <= HEALTH_THRESHOLDS.good) {
    status = 'good';
    message = 'On track with room to optimize';
  } else if (percentage <= HEALTH_THRESHOLDS.warning) {
    status = 'warning';
    message = 'Approaching budget threshold';
  } else if (percentage <= HEALTH_THRESHOLDS.danger) {
    status = 'danger';
    message = 'Spending exceeds recommended limits';
  } else {
    status = 'critical';
    message = 'Expenses exceed income this period';
  }

  return { status, percentage, message };
}
