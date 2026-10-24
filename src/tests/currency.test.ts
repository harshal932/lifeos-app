import { describe, it, expect } from 'vitest';
import {
  formatINR,
  parseRupeesToPaise,
  paiseToRupees,
  calculateCashFlow,
} from '../utils/currency';

describe('Currency and Monetary Arithmetic', () => {
  it('formats Indian rupee amounts with appropriate commas and decimals', () => {
    expect(formatINR(12500000)).toBe('₹1,25,000.00');
    expect(formatINR(10050)).toBe('₹100.50');
    expect(formatINR(50)).toBe('₹0.50');
    expect(formatINR(0)).toBe('₹0.00');
    expect(formatINR(1000000000)).toBe('₹1,00,00,000.00');
  });

  it('formats negative amounts correctly', () => {
    expect(formatINR(-250000)).toBe('-₹2,500.00');
  });

  it('formats amounts without decimals when requested', () => {
    expect(formatINR(12500000, false)).toBe('₹1,25,000');
  });

  it('safely parses user input into integer paise avoiding floating point errors', () => {
    expect(parseRupeesToPaise('1250')).toBe(125000);
    expect(parseRupeesToPaise('1250.50')).toBe(125050);
    expect(parseRupeesToPaise('₹ 1,25,000.00')).toBe(12500000);
    expect(parseRupeesToPaise(100.25)).toBe(10025);
    expect(parseRupeesToPaise('0.05')).toBe(5);
  });

  it('converts integer paise back to rupee float accurately', () => {
    expect(paiseToRupees(125050)).toBe(1250.5);
    expect(paiseToRupees(50000)).toBe(500);
  });

  it('calculates cash flow correctly treating refunds and transfers properly', () => {
    const transactions = [
      { type: 'income', amountPaise: 5000000 }, // ₹50,000 income
      { type: 'expense', amountPaise: 1500000 }, // ₹15,000 expense
      { type: 'refund', amountPaise: 200000 }, // ₹2,000 refund (credited back against expenses)
      { type: 'transfer', amountPaise: 1000000 }, // ₹10,000 transfer (excluded)
    ];

    const result = calculateCashFlow(transactions);

    expect(result.totalIncomePaise).toBe(5000000);
    expect(result.totalExpensePaise).toBe(1500000);
    expect(result.totalRefundPaise).toBe(200000);
    expect(result.effectiveExpensePaise).toBe(1300000); // 15,000 - 2,000 = 13,000
    expect(result.netCashFlowPaise).toBe(3700000); // 50,000 - 13,000 = 37,000
  });
});
