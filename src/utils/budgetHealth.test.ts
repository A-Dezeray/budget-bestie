import { describe, it, expect } from 'vitest';
import { computeBudgetHealth } from './budgetHealth';

describe('computeBudgetHealth', () => {
  it('returns warning with 0% when no income', () => {
    const result = computeBudgetHealth(0, 0);
    expect(result.status).toBe('warning');
    expect(result.percentage).toBe(0);
    expect(result.message).toBe('Add your income to start tracking');
  });

  it('returns excellent when spending is under 50%', () => {
    const result = computeBudgetHealth(1000, 400);
    expect(result.status).toBe('excellent');
    expect(result.percentage).toBe(40);
  });

  it('returns good when spending is 50-70%', () => {
    const result = computeBudgetHealth(1000, 600);
    expect(result.status).toBe('good');
    expect(result.percentage).toBe(60);
  });

  it('returns warning when spending is 70-85%', () => {
    const result = computeBudgetHealth(1000, 800);
    expect(result.status).toBe('warning');
    expect(result.percentage).toBe(80);
  });

  it('returns danger when spending is 85-100%', () => {
    const result = computeBudgetHealth(1000, 950);
    expect(result.status).toBe('danger');
    expect(result.percentage).toBe(95);
  });

  it('returns critical when spending exceeds income', () => {
    const result = computeBudgetHealth(1000, 1200);
    expect(result.status).toBe('critical');
    expect(result.percentage).toBe(120);
  });

  it('returns exactly at boundary thresholds', () => {
    expect(computeBudgetHealth(100, 50).status).toBe('excellent');
    expect(computeBudgetHealth(100, 70).status).toBe('good');
    expect(computeBudgetHealth(100, 85).status).toBe('warning');
    expect(computeBudgetHealth(100, 100).status).toBe('danger');
  });
});
