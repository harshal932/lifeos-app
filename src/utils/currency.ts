/**
 * Exact monetary arithmetic and Indian Currency formatting for LifeOS.
 * All internal financial amounts are represented in integer paise (1 Rupee = 100 paise)
 * to eliminate IEEE 754 floating point imprecision.
 */

/**
 * Formats a paise integer amount into Indian Rupee format (e.g. ₹1,25,000.00).
 */
export function formatINR(paise: number, showDecimals = true, symbol = '₹'): string {
  if (!Number.isFinite(paise) || isNaN(paise)) {
    paise = 0;
  }

  const isNegative = paise < 0;
  const absPaise = Math.abs(Math.round(paise));
  const rupees = Math.floor(absPaise / 100);
  const remainingPaise = absPaise % 100;

  // Format integer rupees using Indian numbering system (3, 2, 2, ...)
  const rupeeStr = rupees.toString();
  let formattedRupees = '';

  if (rupeeStr.length <= 3) {
    formattedRupees = rupeeStr;
  } else {
    const lastThree = rupeeStr.substring(rupeeStr.length - 3);
    const otherNumbers = rupeeStr.substring(0, rupeeStr.length - 3);
    const withCommas = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    formattedRupees = `${withCommas},${lastThree}`;
  }

  let result = symbol ? `${symbol}${formattedRupees}` : formattedRupees;

  if (showDecimals) {
    const paiseStr = remainingPaise.toString().padStart(2, '0');
    result += `.${paiseStr}`;
  }

  return isNegative ? `-${result}` : result;
}

/**
 * Converts a rupee decimal or string input into integer paise safely.
 * e.g. "125.50" -> 12550, 100 -> 10000, "₹ 1,500.25" -> 150025
 */
export function parseRupeesToPaise(input: string | number): number {
  if (typeof input === 'number') {
    if (!Number.isFinite(input) || isNaN(input)) return 0;
    return Math.round(input * 100);
  }

  if (!input) return 0;

  // Clean string: remove currency symbols, spaces, commas
  const cleaned = input.toString().replace(/[^0-9.-]/g, '').trim();
  if (!cleaned) return 0;

  const parsed = parseFloat(cleaned);
  if (!Number.isFinite(parsed) || isNaN(parsed)) return 0;

  // Round to closest integer paise to avoid 123.45 * 100 = 12344.999999999998
  return Math.round(parsed * 100);
}

/**
 * Converts integer paise into standard decimal rupee number for input fields.
 */
export function paiseToRupees(paise: number): number {
  if (!Number.isFinite(paise) || isNaN(paise)) return 0;
  return Math.round(paise) / 100;
}

/**
 * Calculates net cash flow, eligible income, eligible expenses, and refund adjustments.
 * Rules:
 * - Income adds to cash flow
 * - Expenses subtract from cash flow
 * - Refunds subtract from expense totals or are credited back appropriately without double counting as regular salary/earned income
 * - Transfers are excluded from net cash flow calculations
 */
export interface CashFlowSummary {
  totalIncomePaise: number;
  totalExpensePaise: number;
  totalRefundPaise: number;
  netCashFlowPaise: number;
  effectiveExpensePaise: number; // totalExpense - totalRefund
}

export function calculateCashFlow(
  transactions: Array<{ type: string; amountPaise: number }>
): CashFlowSummary {
  let totalIncomePaise = 0;
  let totalExpensePaise = 0;
  let totalRefundPaise = 0;

  for (const tx of transactions) {
    const amount = Math.max(0, Math.round(tx.amountPaise || 0));
    if (tx.type === 'income') {
      totalIncomePaise += amount;
    } else if (tx.type === 'expense') {
      totalExpensePaise += amount;
    } else if (tx.type === 'refund') {
      totalRefundPaise += amount;
    }
    // transfers are excluded from income and expense
  }

  const effectiveExpensePaise = Math.max(0, totalExpensePaise - totalRefundPaise);
  const netCashFlowPaise = totalIncomePaise - effectiveExpensePaise;

  return {
    totalIncomePaise,
    totalExpensePaise,
    totalRefundPaise,
    netCashFlowPaise,
    effectiveExpensePaise,
  };
}
