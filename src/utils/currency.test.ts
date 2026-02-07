import { test, expect, describe } from 'vitest';
import { formatCurrency, formatCompactCurrency } from './currency';

describe('formatCurrency', () => {
  test('formats positive amounts', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  test('formats zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  test('formats negative amounts', () => {
    expect(formatCurrency(-50)).toBe('-$50.00');
  });

  test('formats small amounts', () => {
    expect(formatCurrency(0.99)).toBe('$0.99');
  });
});

describe('formatCompactCurrency', () => {
  test('formats amounts under 1000 as dollars', () => {
    expect(formatCompactCurrency(500)).toBe('$500');
  });

  test('formats amounts over 1000 as k', () => {
    expect(formatCompactCurrency(1500)).toBe('$1.5k');
  });

  test('formats exactly 1000', () => {
    expect(formatCompactCurrency(1000)).toBe('$1.0k');
  });

  test('formats zero', () => {
    expect(formatCompactCurrency(0)).toBe('$0');
  });
});
