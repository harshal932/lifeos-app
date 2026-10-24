import { db } from '../db';
import type { Budget } from '../types';
import { getMonthlyFinancialSummary } from './financeService';

export async function getBudgetForMonth(monthStr: string): Promise<Budget | undefined> {
  return db.budgets.get(monthStr);
}

export async function saveBudget(budget: Budget): Promise<void> {
  await db.budgets.put({
    ...budget,
    id: budget.month,
    updatedAt: new Date().toISOString(),
  });
}

export interface CategoryBudgetStatus {
  category: string;
  budgetPaise: number;
  spentPaise: number;
  remainingPaise: number;
  percentageUsed: number;
  isOverBudget: boolean;
}

export interface OverallBudgetStatus {
  month: string;
  overallBudgetPaise: number;
  totalSpentPaise: number;
  remainingPaise: number;
  percentageUsed: number;
  isOverBudget: boolean;
  warnings: string[];
  categories: CategoryBudgetStatus[];
}

export async function calculateBudgetStatus(monthStr: string): Promise<OverallBudgetStatus> {
  const budget = await getBudgetForMonth(monthStr);
  const financialSummary = await getMonthlyFinancialSummary(monthStr);

  const overallBudgetPaise = budget?.overallBudgetPaise || 0;
  const totalSpentPaise = financialSummary.effectiveExpensePaise;
  const remainingPaise = overallBudgetPaise - totalSpentPaise;
  const percentageUsed =
    overallBudgetPaise > 0 ? Math.round((totalSpentPaise / overallBudgetPaise) * 100) : 0;
  const isOverBudget = overallBudgetPaise > 0 && totalSpentPaise > overallBudgetPaise;

  const warnings: string[] = [];
  const thresholds = budget?.warningThresholds || [50, 75, 90, 100];

  if (overallBudgetPaise > 0) {
    if (percentageUsed >= 100) {
      warnings.push(`Overall monthly budget has been exceeded by ${Math.abs(percentageUsed - 100)}%!`);
    } else {
      for (const t of [...thresholds].reverse()) {
        if (t < 100 && percentageUsed >= t) {
          warnings.push(`You have reached ${percentageUsed}% of your overall monthly budget.`);
          break;
        }
      }
    }
  }

  // Category breakdown
  const categoryBudgets = budget?.categoryBudgets || {};
  const categories: CategoryBudgetStatus[] = [];

  const allCategories = new Set([
    ...Object.keys(categoryBudgets),
    ...Object.keys(financialSummary.categoryExpenses),
  ]);

  for (const cat of allCategories) {
    const catBudget = categoryBudgets[cat] || 0;
    const catSpent = financialSummary.categoryExpenses[cat] || 0;
    if (catBudget > 0 || catSpent > 0) {
      const catRemaining = catBudget - catSpent;
      const catPct = catBudget > 0 ? Math.round((catSpent / catBudget) * 100) : 100;
      categories.push({
        category: cat,
        budgetPaise: catBudget,
        spentPaise: catSpent,
        remainingPaise: catRemaining,
        percentageUsed: catPct,
        isOverBudget: catBudget > 0 && catSpent > catBudget,
      });
    }
  }

  // Sort categories by highest spent
  categories.sort((a, b) => b.spentPaise - a.spentPaise);

  return {
    month: monthStr,
    overallBudgetPaise,
    totalSpentPaise,
    remainingPaise,
    percentageUsed,
    isOverBudget,
    warnings,
    categories,
  };
}
