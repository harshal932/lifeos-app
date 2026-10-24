import React from 'react';
import {
  Sun,
  Moon,
  Plus,
  Flame,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Target,
  Coins,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { HabitCard } from '../habits/HabitCard';
import { TransactionCard } from '../finance/TransactionCard';
import type {
  Habit,
  HabitCompletion,
  Transaction,
  Budget,
  AppSettings,
} from '../../types';
import {
  getLocalDateString,
  formatDisplayDate,
  getTimeBasedGreeting,
  getWeekDates,
  getDayOfWeek,
} from '../../utils/date';
import { calculateCashFlow, formatINR } from '../../utils/currency';
import { isHabitScheduledOn } from '../../utils/streaks';
import { completeHabit, undoHabitCompletion } from '../../services/habitService';
import { subDays } from 'date-fns';

interface HomePageProps {
  habits: Habit[];
  completions: HabitCompletion[];
  transactions: Transaction[];
  budget?: Budget;
  settings: AppSettings;
  onSelectTab: (tab: any) => void;
  onOpenAddHabit: () => void;
  onOpenAddTransaction: (type?: 'expense' | 'income') => void;
  onOpenBudgetModal: () => void;
  onToggleTheme: () => void;
  onLoadSampleData: () => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const HomePage: React.FC<HomePageProps> = ({
  habits,
  completions,
  transactions,
  budget,
  settings,
  onSelectTab,
  onOpenAddHabit,
  onOpenAddTransaction,
  onOpenBudgetModal,
  onToggleTheme,
  onLoadSampleData,
  onRefresh,
}) => {
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const greeting = getTimeBasedGreeting(today);

  // Active habits
  const activeHabits = habits.filter((h) => !h.isArchived);
  const scheduledTodayHabits = activeHabits.filter((h) => isHabitScheduledOn(h, todayStr));
  const completedTodayHabits = scheduledTodayHabits.filter((h) =>
    completions.some((c) => c.habitId === h.id && c.date === todayStr)
  );

  const todayCompletionPct =
    scheduledTodayHabits.length > 0
      ? Math.round((completedTodayHabits.length / scheduledTodayHabits.length) * 100)
      : 0;

  // Monthly Finances
  const currentMonthPrefix = todayStr.substring(0, 7);
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonthPrefix));
  const monthCashFlow = calculateCashFlow(currentMonthTransactions);

  const overallBudgetPaise = budget?.overallBudgetPaise || 0;
  const remainingBudgetPaise = overallBudgetPaise - monthCashFlow.effectiveExpensePaise;

  // Holdings
  const holdings = settings.holdings;
  const totalHoldingsPaise =
    (holdings?.cashPaise || 0) + (holdings?.shareMarketPaise || 0) + (holdings?.savedPaise || 0);

  // Weekly Overview (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = getLocalDateString(d);
    const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];

    const scheduled = activeHabits.filter((h) => isHabitScheduledOn(h, dateStr)).length;
    const completed = activeHabits.filter(
      (h) =>
        isHabitScheduledOn(h, dateStr) &&
        completions.some((c) => c.habitId === h.id && c.date === dateStr)
    ).length;

    const pct = scheduled > 0 ? Math.round((completed / scheduled) * 100) : 0;
    return {
      dateStr,
      dayLetter,
      scheduled,
      completed,
      pct,
      isToday: dateStr === todayStr,
    };
  });

  const weeklyScheduledTotal = last7Days.reduce((acc, d) => acc + d.scheduled, 0);
  const weeklyCompletedTotal = last7Days.reduce((acc, d) => acc + d.completed, 0);
  const weeklyConsistency =
    weeklyScheduledTotal > 0
      ? Math.round((weeklyCompletedTotal / weeklyScheduledTotal) * 100)
      : 100;

  // Recent 3 transactions
  const recentTransactions = [...transactions].slice(0, 3);

  // Quick 1-tap complete
  const handleToggleHabit = async (habitId: string, isCompleted: boolean) => {
    if (isCompleted) {
      await completeHabit(habitId, todayStr);
    } else {
      await undoHabitCompletion(habitId, todayStr);
    }
    await onRefresh();
  };

  const isBrandNewUser = habits.length === 0 && transactions.length === 0;

  return (
    <div className="space-y-6 pb-20">
      {/* SECTION A: HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/icons/icon-192.png"
            alt="LifeOS App Icon"
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl shadow-subtle border border-emerald-500/25 shrink-0"
          />
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
              {formatDisplayDate(todayStr, 'EEEE, dd MMMM yyyy')}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {greeting}!
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleTheme}
            aria-label="Toggle visual theme"
            className="p-2.5 rounded-xl bg-card border border-border shadow-subtle hover:bg-secondary text-foreground transition-all duration-200 active:scale-95"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-indigo-500" />
            )}
          </button>
        </div>
      </div>

      {/* SECTION F: ONBOARDING EMPTY STATE */}
      {isBrandNewUser && (
        <Card className="p-6 bg-gradient-to-br from-card via-card to-primary/5 border-primary/20 space-y-4">
          <div className="flex items-center gap-3">
            <img
              src="/icons/icon-192.png"
              alt="LifeOS"
              className="w-12 h-12 rounded-2xl shadow-sm border border-emerald-500/25 shrink-0"
            />
            <div>
              <h3 className="text-base font-bold text-foreground">Welcome to LifeOS</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Your private, offline-first personal dashboard for habits and finances.
              </p>
            </div>
          </div>

          <p className="text-xs text-foreground/80 leading-relaxed">
            All your data is kept 100% locally on this device in IndexedDB. Nothing is ever sent to
            any remote server. Start by creating your habits and recording your income or expenses.
          </p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Button size="sm" onClick={onOpenAddHabit}>
              <Plus className="w-4 h-4" />
              Create Habit
            </Button>
            <Button size="sm" variant="outline" onClick={() => onOpenAddTransaction('expense')}>
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
            <Button size="sm" variant="ghost" onClick={onLoadSampleData}>
              <Sparkles className="w-4 h-4 text-primary" />
              Load Starter Templates
            </Button>
          </div>
        </Card>
      )}

      {/* SECTION E: QUICK ACTION SHORTCUTS */}
      <div className="space-y-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block px-1">
          Quick Actions
        </span>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2">
          <button
            onClick={onOpenAddHabit}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:bg-secondary/40 transition-all active:scale-95 text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1.5">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-foreground leading-tight">Add Habit</span>
          </button>

          <button
            onClick={() => onOpenAddTransaction('expense')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/70 hover:border-destructive/40 hover:bg-secondary/40 transition-all active:scale-95 text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-1.5">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-foreground leading-tight">Add Expense</span>
          </button>

          <button
            onClick={() => onOpenAddTransaction('income')}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/40 hover:bg-secondary/40 transition-all active:scale-95 text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1.5">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-foreground leading-tight">Add Income</span>
          </button>

          <button
            onClick={onOpenBudgetModal}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-card border border-border/70 hover:border-primary/40 hover:bg-secondary/40 transition-all active:scale-95 text-center"
          >
            <div className="w-9 h-9 rounded-xl bg-secondary text-foreground flex items-center justify-center mb-1.5">
              <Wallet className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-semibold text-foreground leading-tight">Set Budget</span>
          </button>
        </div>
      </div>

      {/* SECTION B: TODAY'S HABITS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Today's Habits ({completedTodayHabits.length}/{scheduledTodayHabits.length})
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('habits')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
          >
            Manage <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Progress Card */}
        {scheduledTodayHabits.length > 0 ? (
          <div className="space-y-2.5">
            <Card className="p-4 bg-gradient-to-r from-card to-secondary/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-foreground">Completion Rate</span>
                <span className="text-sm font-black text-emerald-500">{todayCompletionPct}%</span>
              </div>
              <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${todayCompletionPct}%` }}
                />
              </div>
            </Card>

            {/* List of today's habits with 1-tap complete */}
            <div className="space-y-2">
              {scheduledTodayHabits.map((h) => (
                <HabitCard
                  key={h.id}
                  habit={h}
                  completions={completions}
                  onToggleComplete={handleToggleHabit}
                  onOpenDetails={() => onSelectTab('habits')}
                />
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-6 text-center bg-card">
            <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">
              {activeHabits.length === 0
                ? 'No habits created yet. Tap "Add Habit" above!'
                : 'No habits scheduled for today. Take rest or review your schedule!'}
            </p>
          </Card>
        )}
      </div>

      {/* SECTION C: FINANCIAL SUMMARY */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Monthly Financial Overview
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('finance')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
          >
            All Transactions <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Total Funds & Holdings Summary Banner */}
        <Card
          onClick={() => onSelectTab('finance')}
          className="p-3.5 bg-gradient-to-r from-card via-card to-primary/5 border border-primary/25 hover:border-primary/45 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center font-bold">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Total Funds & Net Holdings
                </span>
                <span className="text-base font-black text-foreground">
                  {formatINR(totalHoldingsPaise)}
                </span>
              </div>
            </div>
            <div className="text-right text-[11px] text-muted-foreground hidden sm:block">
              <span>Cash: <strong className="text-foreground">{formatINR(holdings?.cashPaise || 0, false)}</strong></span> •{' '}
              <span>Share Market: <strong className="text-foreground">{formatINR(holdings?.shareMarketPaise || 0, false)}</strong></span> •{' '}
              <span>Saved: <strong className="text-foreground">{formatINR(holdings?.savedPaise || 0, false)}</strong></span>
            </div>
          </div>
        </Card>

        {/* 2x2 Metric Cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-3.5 bg-card">
            <span className="text-[11px] text-muted-foreground font-semibold block">
              Income Received
            </span>
            <div className="text-lg font-black text-emerald-500 mt-0.5">
              {formatINR(monthCashFlow.totalIncomePaise)}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">This month</span>
          </Card>

          <Card className="p-3.5 bg-card">
            <span className="text-[11px] text-muted-foreground font-semibold block">
              Recorded Expenses
            </span>
            <div className="text-lg font-black text-destructive mt-0.5">
              {formatINR(monthCashFlow.effectiveExpensePaise)}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              {monthCashFlow.totalRefundPaise > 0 ? 'Net of refunds' : 'This month'}
            </span>
          </Card>

          <Card className="p-3.5 bg-card">
            <span className="text-[11px] text-muted-foreground font-semibold block">
              Net Cash Flow
            </span>
            <div
              className={`text-lg font-black mt-0.5 ${
                monthCashFlow.netCashFlowPaise >= 0 ? 'text-emerald-500' : 'text-destructive'
              }`}
            >
              {formatINR(monthCashFlow.netCashFlowPaise)}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">Income - Expense</span>
          </Card>

          <Card className="p-3.5 bg-card">
            <span className="text-[11px] text-muted-foreground font-semibold block">
              Budget Remaining
            </span>
            <div
              className={`text-lg font-black mt-0.5 ${
                overallBudgetPaise > 0 && remainingBudgetPaise < 0
                  ? 'text-destructive'
                  : 'text-foreground'
              }`}
            >
              {overallBudgetPaise > 0 ? formatINR(remainingBudgetPaise) : 'No limit'}
            </div>
            <span className="text-[10px] text-muted-foreground block mt-0.5">
              {overallBudgetPaise > 0 ? `Limit: ${formatINR(overallBudgetPaise)}` : 'Tap to set limit'}
            </span>
          </Card>
        </div>

        {/* Recent 3 transactions preview */}
        {recentTransactions.length > 0 && (
          <div className="space-y-2 pt-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block px-1">
              Recent Transactions
            </span>
            {recentTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onEdit={() => onSelectTab('finance')}
                onDelete={() => onSelectTab('finance')}
              />
            ))}
          </div>
        )}
      </div>

      {/* SECTION D: WEEKLY OVERVIEW */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Weekly Habit Consistency ({weeklyConsistency}%)
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('insights')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
          >
            Insights <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between gap-1">
            {last7Days.map((d) => (
              <div key={d.dateStr} className="flex-1 text-center space-y-1.5">
                <span
                  className={`text-[11px] font-bold block ${
                    d.isToday ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {d.dayLetter}
                </span>

                {/* Vertical bar */}
                <div className="w-full h-16 bg-secondary rounded-lg flex items-end p-0.5 overflow-hidden">
                  <div
                    className={`w-full rounded-md transition-all duration-300 ${
                      d.pct === 100
                        ? 'bg-emerald-500'
                        : d.pct > 0
                        ? 'bg-primary'
                        : 'bg-transparent'
                    }`}
                    style={{ height: `${Math.max(d.pct, 4)}%` }}
                  />
                </div>

                <span className="text-[10px] text-muted-foreground block font-medium">
                  {d.scheduled > 0 ? `${d.completed}/${d.scheduled}` : '-'}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Completed <strong className="text-foreground">{weeklyCompletedTotal}</strong> habit occurrences this week.
            </span>
          </div>
        </Card>
      </div>
    </div>
  );
};
