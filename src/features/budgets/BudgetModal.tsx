import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import type { Budget } from '../../types';
import { parseRupeesToPaise, paiseToRupees, formatINR } from '../../utils/currency';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthStr: string; // YYYY-MM
  existingBudget?: Budget;
  expenseCategories: string[];
  onSave: (budget: Budget) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  monthStr,
  existingBudget,
  expenseCategories,
  onSave,
}) => {
  const [overallLimitInput, setOverallLimitInput] = useState('');
  const [categoryBudgetsInput, setCategoryBudgetsInput] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (existingBudget) {
      setOverallLimitInput(
        existingBudget.overallBudgetPaise > 0
          ? paiseToRupees(existingBudget.overallBudgetPaise).toString()
          : ''
      );

      const catInputs: Record<string, string> = {};
      for (const [cat, paise] of Object.entries(existingBudget.categoryBudgets || {})) {
        if (paise > 0) {
          catInputs[cat] = paiseToRupees(paise).toString();
        }
      }
      setCategoryBudgetsInput(catInputs);
    } else {
      setOverallLimitInput('');
      setCategoryBudgetsInput({});
    }
    setError('');
  }, [existingBudget, isOpen]);

  const handleCategoryChange = (cat: string, val: string) => {
    setCategoryBudgetsInput((prev) => ({
      ...prev,
      [cat]: val,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');

      const overallPaise = parseRupeesToPaise(overallLimitInput);
      const catBudgetsPaise: Record<string, number> = {};

      for (const [cat, val] of Object.entries(categoryBudgetsInput)) {
        const p = parseRupeesToPaise(val);
        if (p > 0) {
          catBudgetsPaise[cat] = p;
        }
      }

      const budgetData: Budget = {
        id: monthStr,
        month: monthStr,
        overallBudgetPaise: overallPaise,
        categoryBudgets: catBudgetsPaise,
        warningThresholds: existingBudget?.warningThresholds || [50, 75, 90, 100],
        updatedAt: new Date().toISOString(),
      };

      await onSave(budgetData);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save budget');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Student Monthly Pocket Money & Budget (${monthStr})`}
      description="Set your monthly pocket money allowance and category spending limits."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-destructive/15 text-destructive rounded-xl">
            {error}
          </div>
        )}

        {/* Overall Limit */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Total Monthly Pocket Money / Allowance Limit (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm font-bold text-muted-foreground">
              ₹
            </span>
            <input
              type="number"
              step="1"
              min="0"
              inputMode="numeric"
              value={overallLimitInput}
              onChange={(e) => setOverallLimitInput(e.target.value)}
              placeholder="e.g. 35000"
              className="w-full pl-8 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm font-extrabold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <span className="text-[11px] text-muted-foreground mt-1 block">
            Leave 0 or empty for no spending limit.
          </span>
        </div>

        {/* Category Specific Limits */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <span className="text-xs font-bold text-foreground block">
            Category Budgets (Optional)
          </span>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {expenseCategories.map((cat) => (
              <div key={cat} className="flex items-center justify-between gap-3 text-xs">
                <span className="font-semibold text-foreground min-w-[100px] truncate">{cat}</span>
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-2 text-xs font-bold text-muted-foreground">
                    ₹
                  </span>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    inputMode="numeric"
                    value={categoryBudgetsInput[cat] || ''}
                    onChange={(e) => handleCategoryChange(cat, e.target.value)}
                    placeholder="No limit"
                    className="w-full pl-6 pr-3 py-1.5 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Budget'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
