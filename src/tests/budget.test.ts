import { describe, it, expect } from 'vitest';
import { calculateCashFlow } from '../utils/currency';

describe('Budget and Threshold Calculations', () => {
  it('calculates percentage used and remaining budget accurately', () => {
    const budgetPaise = 3000000; // ₹30,000.00
    const spentPaise = 1500000; // ₹15,000.00

    const remainingPaise = budgetPaise - spentPaise;
    const percentageUsed = Math.round((spentPaise / budgetPaise) * 100);

    expect(remainingPaise).toBe(1500000);
    expect(percentageUsed).toBe(50);
  });

  it('triggers 50%, 75%, 90%, and 100% threshold flags properly', () => {
    const budgetPaise = 1000000; // ₹10,000
    const thresholds = [50, 75, 90, 100];

    const getTriggeredThreshold = (spent: number) => {
      const pct = Math.round((spent / budgetPaise) * 100);
      if (pct >= 100) return 100;
      for (const t of [...thresholds].reverse()) {
        if (t < 100 && pct >= t) return t;
      }
      return 0;
    };

    expect(getTriggeredThreshold(450000)).toBe(0); // 45% -> none
    expect(getTriggeredThreshold(500000)).toBe(50); // 50%
    expect(getTriggeredThreshold(760000)).toBe(75); // 76%
    expect(getTriggeredThreshold(920000)).toBe(90); // 92%
    expect(getTriggeredThreshold(1100000)).toBe(100); // 110% -> exceeded
  });

  it('correctly factors in refunds to reduce total spent against category budgets', () => {
    const transactions = [
      { type: 'expense', amountPaise: 400000 }, // ₹4,000 spent on Groceries
      { type: 'refund', amountPaise: 100000 }, // ₹1,000 refunded
    ];

    const flow = calculateCashFlow(transactions);
    expect(flow.totalExpensePaise).toBe(400000);
    expect(flow.totalRefundPaise).toBe(100000);
    expect(flow.effectiveExpensePaise).toBe(300000); // ₹3,000 effective spent
  });
});
