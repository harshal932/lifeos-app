import { db } from '../db';
import type { Transaction, TransactionType } from '../types';
import { calculateCashFlow, type CashFlowSummary } from '../utils/currency';

export async function getAllTransactions(): Promise<Transaction[]> {
  return db.transactions.reverse().sortBy('date');
}

export async function createTransaction(
  data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Transaction> {
  if (!data.amountPaise || data.amountPaise <= 0 || !Number.isInteger(data.amountPaise)) {
    throw new Error('Transaction amount must be a positive integer in paise.');
  }
  if (!data.date || !/^\d{4}-\d{2}-\d{2}$/.test(data.date)) {
    throw new Error('Valid date in YYYY-MM-DD format is required.');
  }
  if (!data.category || !data.category.trim()) {
    throw new Error('A category is required.');
  }

  const now = new Date().toISOString();
  const tx: Transaction = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  await db.transactions.add(tx);
  return tx;
}

export async function updateTransaction(
  id: string,
  updates: Partial<Omit<Transaction, 'id' | 'createdAt'>>
): Promise<void> {
  if (updates.amountPaise !== undefined) {
    if (updates.amountPaise <= 0 || !Number.isInteger(updates.amountPaise)) {
      throw new Error('Transaction amount must be a positive integer in paise.');
    }
  }
  if (updates.date !== undefined && !/^\d{4}-\d{2}-\d{2}$/.test(updates.date)) {
    throw new Error('Valid date in YYYY-MM-DD format is required.');
  }

  await db.transactions.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  await db.transactions.delete(id);
}

export async function getTransactionsForDateRange(
  startDateStr: string,
  endDateStr: string
): Promise<Transaction[]> {
  return db.transactions
    .where('date')
    .between(startDateStr, endDateStr, true, true)
    .reverse()
    .sortBy('date');
}

export async function getTransactionsForMonth(monthStr: string): Promise<Transaction[]> {
  // monthStr is YYYY-MM
  const startDate = `${monthStr}-01`;
  const endDate = `${monthStr}-31`;
  return getTransactionsForDateRange(startDate, endDate);
}

export interface MonthlyFinancialSummary extends CashFlowSummary {
  categoryExpenses: Record<string, number>; // category -> total paise
  categoryIncomes: Record<string, number>;
  transactionCount: number;
}

export async function getMonthlyFinancialSummary(monthStr: string): Promise<MonthlyFinancialSummary> {
  const transactions = await getTransactionsForMonth(monthStr);
  const cashFlow = calculateCashFlow(transactions);

  const categoryExpenses: Record<string, number> = {};
  const categoryIncomes: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.type === 'expense') {
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amountPaise;
    } else if (tx.type === 'refund') {
      // Refunds offset expenses in the category
      categoryExpenses[tx.category] = Math.max(0, (categoryExpenses[tx.category] || 0) - tx.amountPaise);
    } else if (tx.type === 'income') {
      categoryIncomes[tx.category] = (categoryIncomes[tx.category] || 0) + tx.amountPaise;
    }
  }

  return {
    ...cashFlow,
    categoryExpenses,
    categoryIncomes,
    transactionCount: transactions.length,
  };
}
