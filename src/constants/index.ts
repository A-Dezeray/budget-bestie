import type { Category } from '../types';

// Storage keys
export const STORAGE_KEY = 'flow-finance-data';
export const THEME_STORAGE_KEY = 'flow-finance-theme';

// Period configuration
export const PERIOD_DAYS = 14;
export const REFERENCE_DATE = new Date(2024, 0, 1); // Jan 1, 2024 (Monday)

// Budget health thresholds
export const HEALTH_THRESHOLDS = {
  excellent: 50,
  good: 70,
  warning: 85,
  danger: 100,
} as const;

// Default categories
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'housing', name: 'Housing', icon: 'H', color: '#264653' },
  { id: 'food', name: 'Food & Dining', icon: 'F', color: '#2a9d8f' },
  { id: 'transport', name: 'Transportation', icon: 'T', color: '#457b9d' },
  { id: 'utilities', name: 'Utilities', icon: 'U', color: '#e9c46a' },
  { id: 'entertainment', name: 'Entertainment', icon: 'E', color: '#f4a261' },
  { id: 'shopping', name: 'Shopping', icon: 'S', color: '#e76f51' },
  { id: 'health', name: 'Health', icon: 'He', color: '#84a98c' },
  { id: 'education', name: 'Education', icon: 'Ed', color: '#577590' },
  { id: 'personal', name: 'Personal Care', icon: 'P', color: '#bc6c25' },
  { id: 'subscriptions', name: 'Subscriptions', icon: 'Su', color: '#6d597a' },
  { id: 'savings', name: 'Savings', icon: 'Sa', color: '#2d6a4f' },
  { id: 'other', name: 'Other', icon: 'O', color: '#6c757d' },
];

// Savings goal icon options
export const GOAL_ICONS = ['G', 'H', 'V', 'C', 'R', 'E', 'T', 'S', 'F', 'O'];
