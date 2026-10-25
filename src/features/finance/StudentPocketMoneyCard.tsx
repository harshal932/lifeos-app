import React from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { formatINR } from '../../utils/currency';
import { Wallet, PiggyBank, Plus, Edit3, ArrowDownLeft, Sparkles, AlertTriangle } from 'lucide-react';
import { getDaysInMonth, parseISO } from 'date-fns';

interface StudentPocketMoneyCardProps {
  monthStr: string;
  monthlyBudgetPaise: number;
  monthlySpentPaise: number;
  monthlyIncomePaise: number;
  onOpenBudgetModal: () => void;
  onOpenAddIncome: () => void;
}

export const StudentPocketMoneyCard: React.FC<StudentPocketMoneyCardProps> = ({
  monthStr,
  monthlyBudgetPaise,
  monthlySpentPaise,
  monthlyIncomePaise,
  onOpenBudgetModal,
  onOpenAddIncome,
}) => {
  const currentDate = new Date();
  const daysInMonth = getDaysInMonth(currentDate);
  const currentDay = currentDate.getDate();
  const daysRemaining = Math.max(1, daysInMonth - currentDay + 1);

  // If monthly budget isn't set, fallback to default student allowance or income
  const effectiveAllowancePaise = monthlyBudgetPaise > 0 ? monthlyBudgetPaise : monthlyIncomePaise;
  const remainingPaise = effectiveAllowancePaise - monthlySpentPaise;
  const isOverAllowance = effectiveAllowancePaise > 0 && remainingPaise < 0;

  const spentPercentage =
    effectiveAllowancePaise > 0
      ? Math.min(100, Math.round((monthlySpentPaise / effectiveAllowancePaise) * 100))
      : 0;

  // Safe daily limit for remaining days
  const safeDailyRemainingPaise =
    remainingPaise > 0 ? Math.round(remainingPaise / daysRemaining) : 0;

  return (
    <Card className="p-4 sm:p-5 border-border/70 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center font-bold">
            <Wallet className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Allowance & Pocket Money
            </span>
            <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
              Monthly Budget
              {effectiveAllowancePaise > 0 && (
                <span className="text-xs font-normal text-muted-foreground font-mono">
                  ({monthStr})
                </span>
              )}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAddIncome}
            className="text-xs h-7.5 px-2.5 gap-1 text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30"
          >
            <Plus className="w-3.5 h-3.5" />
            + Pocket Money
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={onOpenBudgetModal}
            className="text-xs h-7.5 px-2.5 gap-1 border-border/80"
          >
            <Edit3 className="w-3.5 h-3.5" />
            Set Limit
          </Button>
        </div>
      </div>

      {/* Main Pocket Money Hero */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Monthly Allowance */}
        <div className="p-3 rounded-xl bg-secondary/30 border border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground block">
            Monthly Allowance / Limit
          </span>
          <div className="text-xl sm:text-2xl font-black text-foreground font-mono mt-0.5">
            {effectiveAllowancePaise > 0 ? formatINR(effectiveAllowancePaise) : 'Not Set'}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            {monthlyBudgetPaise > 0 ? 'Fixed monthly budget' : 'From pocket money received'}
          </span>
        </div>

        {/* 2. Spent So Far */}
        <div className="p-3 rounded-xl bg-destructive/[0.04] border border-destructive/20">
          <span className="text-[11px] font-semibold text-destructive block">
            Spent This Month
          </span>
          <div className="text-xl sm:text-2xl font-black text-foreground font-mono mt-0.5">
            {formatINR(monthlySpentPaise)}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            {spentPercentage}% of monthly allowance
          </span>
        </div>

        {/* 3. Remaining Balance */}
        <div
          className={`p-3 rounded-xl border ${
            isOverAllowance
              ? 'bg-rose-500/[0.06] border-rose-500/30'
              : 'bg-emerald-500/[0.04] border-emerald-500/20'
          }`}
        >
          <span
            className={`text-[11px] font-semibold block ${
              isOverAllowance ? 'text-rose-400' : 'text-emerald-500'
            }`}
          >
            {isOverAllowance ? 'Exceeded By' : 'Remaining Pocket Money'}
          </span>
          <div
            className={`text-xl sm:text-2xl font-black font-mono mt-0.5 ${
              isOverAllowance ? 'text-rose-400' : 'text-emerald-500'
            }`}
          >
            {formatINR(Math.abs(remainingPaise))}
          </div>
          <span className="text-[10px] text-muted-foreground block mt-0.5">
            {daysRemaining} day(s) left in month
          </span>
        </div>
      </div>

      {/* Progress Bar & Safe Daily Guideline */}
      {effectiveAllowancePaise > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-muted-foreground text-[11px]">
              Pocket Money Consumption
            </span>
            <span
              className={`font-mono text-[11px] ${
                spentPercentage >= 90 ? 'text-rose-400' : 'text-primary'
              }`}
            >
              {spentPercentage}%
            </span>
          </div>

          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                spentPercentage > 100
                  ? 'bg-rose-500'
                  : spentPercentage >= 80
                  ? 'bg-amber-500'
                  : 'bg-gradient-to-r from-primary to-emerald-400'
              }`}
              style={{ width: `${Math.min(100, spentPercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              Safe daily spend: <strong className="text-foreground font-mono">{formatINR(safeDailyRemainingPaise)}/day</strong>
            </span>
            <span>{daysRemaining} days remaining</span>
          </div>
        </div>
      )}
    </Card>
  );
};
