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
  ChevronRight,
  Sparkles,
  BookA,
  Brain,
  ListTodo,
  Check,
  TrendingUp,
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
  TaskItem,
} from '../../types';
import {
  getLocalDateString,
  formatDisplayDate,
  getTimeBasedGreeting,
} from '../../utils/date';
import { calculateCashFlow, formatINR } from '../../utils/currency';
import { isHabitScheduledOn } from '../../utils/streaks';
import { completeHabit, undoHabitCompletion } from '../../services/habitService';
import { toggleTask } from '../../services/taskService';
import { getWordOfTheDay } from '../../services/vocabService';
import { subDays, getDaysInMonth } from 'date-fns';

interface HomePageProps {
  habits: Habit[];
  completions: HabitCompletion[];
  transactions: Transaction[];
  tasks?: TaskItem[];
  budget?: Budget;
  settings: AppSettings;
  onSelectTab: (tab: any) => void;
  onOpenAddHabit: () => void;
  onOpenAddTask?: () => void;
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
  tasks = [],
  budget,
  settings,
  onSelectTab,
  onOpenAddHabit,
  onOpenAddTask,
  onOpenAddTransaction,
  onOpenBudgetModal,
  onToggleTheme,
  onLoadSampleData,
  onRefresh,
}) => {
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const greeting = getTimeBasedGreeting(today);
  const wotd = getWordOfTheDay(todayStr);

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

  // Tasks for today
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const completedTodayTasks = todayTasks.filter((t) => t.completed);
  const pendingTodayTasks = todayTasks.filter((t) => !t.completed);
  const todayTasksPct =
    todayTasks.length > 0
      ? Math.round((completedTodayTasks.length / todayTasks.length) * 100)
      : 0;

  // Daily Spending for Today
  const todayTransactions = transactions.filter((t) => t.date === todayStr);
  const todayExpenses = todayTransactions.filter((t) => t.type === 'expense');
  const todayCashFlow = calculateCashFlow(todayTransactions);

  // Monthly Finances & Daily Budget
  const currentMonthPrefix = todayStr.substring(0, 7);
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(currentMonthPrefix));
  const monthCashFlow = calculateCashFlow(currentMonthTransactions);

  const overallBudgetPaise = budget?.overallBudgetPaise || 0;
  const daysInMonth = getDaysInMonth(today);
  const dailyTargetPaise = overallBudgetPaise > 0 ? Math.round(overallBudgetPaise / daysInMonth) : 0;
  const isOverDailyBudget = dailyTargetPaise > 0 && todayCashFlow.effectiveExpensePaise > dailyTargetPaise;

  // Weekly Consistency (Last 7 Days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = getLocalDateString(d);
    const scheduled = activeHabits.filter((h) => isHabitScheduledOn(h, dateStr)).length;
    const completed = activeHabits.filter(
      (h) =>
        isHabitScheduledOn(h, dateStr) &&
        completions.some((c) => c.habitId === h.id && c.date === dateStr)
    ).length;
    return { scheduled, completed };
  });

  const weeklyScheduledTotal = last7Days.reduce((acc, d) => acc + d.scheduled, 0);
  const weeklyCompletedTotal = last7Days.reduce((acc, d) => acc + d.completed, 0);
  const weeklyConsistency =
    weeklyScheduledTotal > 0
      ? Math.round((weeklyCompletedTotal / weeklyScheduledTotal) * 100)
      : 100;

  // Handlers
  const handleToggleHabit = async (habitId: string, isCompleted: boolean) => {
    if (isCompleted) {
      await completeHabit(habitId, todayStr);
    } else {
      await undoHabitCompletion(habitId, todayStr);
    }
    await onRefresh();
  };

  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    await toggleTask(taskId, isCompleted);
    await onRefresh();
  };

  const isBrandNewUser = habits.length === 0 && transactions.length === 0 && tasks.length === 0;

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* 1. GREETING & TODAY'S BRIEFING HEADER */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-border/50">
        <div>
          <span className="text-xs font-medium text-muted-foreground tracking-wide block">
            {formatDisplayDate(todayStr, 'EEEE, dd MMMM yyyy')}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2 mt-0.5">
            {greeting}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {pendingTodayTasks.length > 0
              ? `${pendingTodayTasks.length} task${pendingTodayTasks.length > 1 ? 's' : ''} pending today`
              : 'All scheduled tasks completed for today'}
            {' • '}
            {completedTodayHabits.length}/{scheduledTodayHabits.length} habits done
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleTheme}
            className="h-8.5 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            title="Toggle theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-indigo-500 mr-1.5" />
            )}
            <span className="text-[11px] capitalize">{settings.theme === 'dark' ? 'Light' : 'Dark'}</span>
          </Button>

          {isBrandNewUser && (
            <Button size="sm" onClick={onLoadSampleData} className="h-8.5 text-xs font-medium">
              Load Starter Templates
            </Button>
          )}
        </div>
      </section>

      {/* 2. CONSOLIDATED OVERVIEW COCKPIT (To-Dos, Habits, Daily Spending) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* To-Dos Overview */}
        <div
          onClick={() => onSelectTab('tasks')}
          className="p-4 rounded-xl bg-card border border-border/70 hover:border-border transition-all cursor-pointer group shadow-subtle flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-secondary text-primary flex items-center justify-center">
                <ListTodo className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                Today's Tasks
              </span>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-0.5">
              View <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {completedTodayTasks.length}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                / {todayTasks.length} completed
              </span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${todayTasksPct}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
            <span>{pendingTodayTasks.length} pending today</span>
            <span className="font-medium text-foreground">{todayTasksPct}%</span>
          </div>
        </div>

        {/* Habits Overview */}
        <div
          onClick={() => onSelectTab('habits')}
          className="p-4 rounded-xl bg-card border border-border/70 hover:border-border transition-all cursor-pointer group shadow-subtle flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                Daily Habits
              </span>
            </div>
            <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-0.5">
              View <ChevronRight className="w-3 h-3" />
            </span>
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground">
                {completedTodayHabits.length}
              </span>
              <span className="text-xs text-muted-foreground font-medium">
                / {scheduledTodayHabits.length} routines
              </span>
            </div>
            <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${todayCompletionPct}%` }}
              />
            </div>
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
            <span className="flex items-center gap-1 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {weeklyConsistency}% weekly consistency
            </span>
            <span className="font-medium text-foreground">{todayCompletionPct}%</span>
          </div>
        </div>

        {/* Daily Spending Overview */}
        <div
          onClick={() => onSelectTab('finance')}
          className="p-4 rounded-xl bg-card border border-border/70 hover:border-border transition-all cursor-pointer group shadow-subtle flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-muted-foreground tracking-wide">
                Today's Spent
              </span>
            </div>
            {dailyTargetPaise > 0 ? (
              <Badge
                variant={isOverDailyBudget ? 'destructive' : 'success'}
                className="text-[10px] px-1.5 py-0"
              >
                {isOverDailyBudget ? 'Over Budget' : 'On Track'}
              </Badge>
            ) : (
              <span className="text-[11px] font-semibold text-muted-foreground group-hover:text-foreground transition-colors flex items-center gap-0.5">
                View <ChevronRight className="w-3 h-3" />
              </span>
            )}
          </div>

          <div className="my-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold tracking-tight text-foreground font-mono">
                {formatINR(todayCashFlow.effectiveExpensePaise)}
              </span>
              {todayCashFlow.totalIncomePaise > 0 && (
                <span className="text-[11px] font-semibold text-emerald-400 flex items-center">
                  <ArrowDownLeft className="w-3 h-3" /> +{formatINR(todayCashFlow.totalIncomePaise)}
                </span>
              )}
            </div>
            {dailyTargetPaise > 0 ? (
              <div className="w-full h-1.5 bg-secondary rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isOverDailyBudget ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round((todayCashFlow.effectiveExpensePaise / dailyTargetPaise) * 100)
                    )}%`,
                  }}
                />
              </div>
            ) : (
              <div className="h-1.5 mt-2" />
            )}
          </div>

          <div className="text-[11px] text-muted-foreground flex items-center justify-between pt-1">
            <span>
              {dailyTargetPaise > 0
                ? `Limit: ${formatINR(dailyTargetPaise)}`
                : `${todayExpenses.length} expense(s)`}
            </span>
            <span>Monthly: {formatINR(monthCashFlow.effectiveExpensePaise)}</span>
          </div>
        </div>
      </section>

      {/* 3. COMPACT QUICK ACTIONS STRIP */}
      <section className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5">
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            if (onOpenAddTask) onOpenAddTask();
            else onSelectTab('tasks');
          }}
          className="shrink-0 text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
          Add To-Do
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onOpenAddTransaction('expense')}
          className="shrink-0 text-xs font-semibold text-foreground hover:border-rose-500/40"
        >
          <ArrowUpRight className="w-3.5 h-3.5 mr-1 text-rose-400 stroke-[2.5]" />
          Log Expense
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onOpenAddHabit}
          className="shrink-0 text-xs font-semibold text-foreground hover:border-emerald-500/40"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400 stroke-[2.5]" />
          New Habit
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onSelectTab('vocabulary')}
          className="shrink-0 text-xs font-semibold text-foreground"
        >
          <Brain className="w-3.5 h-3.5 mr-1 text-primary stroke-[2.5]" />
          Vocab Quiz
        </Button>
      </section>

      {/* 4. COMPACT WORD OF THE DAY BAR */}
      <section
        onClick={() => onSelectTab('vocabulary')}
        className="p-3 sm:px-4 rounded-xl bg-card border border-border/70 hover:border-border cursor-pointer transition-all flex items-center justify-between gap-3 shadow-subtle group"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center shrink-0">
            <BookA className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Word of the Day
              </span>
              <span className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                {wotd.word}
              </span>
              <span className="text-xs text-amber-400 font-medium font-devanagari">
                — {wotd.marathiMeaning}
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground truncate mt-0.5">
              {wotd.meaning}
            </p>
          </div>
        </div>

        <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground shrink-0 flex items-center gap-0.5">
          Review <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </section>

      {/* 5. TODAY'S TASKS LIST */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Today's To-Dos ({completedTodayTasks.length}/{todayTasks.length})
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('tasks')}
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
          >
            All Tasks ({tasks.length}) <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {todayTasks.length > 0 ? (
          <div className="space-y-1.5">
            {todayTasks.map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded-lg border transition-all flex items-center justify-between gap-3 ${
                  t.completed
                    ? 'bg-secondary/20 border-border/30 opacity-70'
                    : 'bg-card border-border/60 hover:border-border shadow-subtle'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(t.id, !t.completed)}
                    className={`w-4.5 h-4.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      t.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-muted-foreground/50 hover:border-primary'
                    }`}
                  >
                    {t.completed && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-xs sm:text-sm font-medium truncate block ${
                        t.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {t.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">
                      <span className="capitalize">{t.priority}</span>
                      <span>•</span>
                      <span>{t.category}</span>
                      {t.dueTime && <span>• {t.dueTime}</span>}
                    </div>
                  </div>
                </div>

                <Badge
                  variant={
                    t.priority === 'urgent'
                      ? 'destructive'
                      : t.priority === 'high'
                      ? 'warning'
                      : 'outline'
                  }
                  className="text-[10px] uppercase font-bold shrink-0"
                >
                  {t.priority}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              No tasks due today. Stay ahead or plan your next task!
            </span>
            {onOpenAddTask && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAddTask}
                className="h-7 text-xs font-medium"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Task
              </Button>
            )}
          </div>
        )}
      </section>

      {/* 6. TODAY'S EXPENSES FEED */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Today's Expenses ({todayExpenses.length}) • Total: {formatINR(todayCashFlow.effectiveExpensePaise)}
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('finance')}
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
          >
            Expenses Page <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {todayTransactions.length > 0 ? (
          <div className="space-y-1.5">
            {todayTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onEdit={() => onSelectTab('finance')}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              No expenses recorded today (canteen, chai, travel, printouts).
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenAddTransaction('expense')}
              className="h-7 text-xs font-medium"
            >
              <Plus className="w-3 h-3 mr-1" />
              Log Expense
            </Button>
          </div>
        )}
      </section>

      {/* 7. TODAY'S HABITS */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Today's Routines ({completedTodayHabits.length}/{scheduledTodayHabits.length})
            </h2>
          </div>
          <button
            onClick={() => onSelectTab('habits')}
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center gap-0.5 transition-colors"
          >
            Manage Habits <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {scheduledTodayHabits.length > 0 ? (
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
        ) : (
          <div className="p-4 rounded-xl bg-card border border-border/50 text-center flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {activeHabits.length === 0
                ? 'No habits created yet.'
                : 'No habits scheduled for today.'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAddHabit}
              className="h-7 text-xs font-medium"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Habit
            </Button>
          </div>
        )}
      </section>
    </div>
  );
};
