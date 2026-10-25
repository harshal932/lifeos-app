import React, { useState } from 'react';
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
  BookOpen,
  Brain,
  Layers,
  ArrowRight,
  ListTodo,
  Check,
  AlertCircle,
  Zap,
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
import { subDays, getDaysInMonth, parseISO } from 'date-fns';

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
  const remainingBudgetPaise = overallBudgetPaise - monthCashFlow.effectiveExpensePaise;
  const daysInMonth = getDaysInMonth(today);
  const dailyTargetPaise = overallBudgetPaise > 0 ? Math.round(overallBudgetPaise / daysInMonth) : 0;
  const isOverDailyBudget = dailyTargetPaise > 0 && todayCashFlow.effectiveExpensePaise > dailyTargetPaise;

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

  // Quick 1-tap complete habit
  const handleToggleHabit = async (habitId: string, isCompleted: boolean) => {
    if (isCompleted) {
      await completeHabit(habitId, todayStr);
    } else {
      await undoHabitCompletion(habitId, todayStr);
    }
    await onRefresh();
  };

  // Quick toggle task
  const handleToggleTask = async (taskId: string, isCompleted: boolean) => {
    await toggleTask(taskId, isCompleted);
    await onRefresh();
  };

  const isBrandNewUser = habits.length === 0 && transactions.length === 0 && tasks.length === 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. GREETING & HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            {formatDisplayDate(todayStr, 'EEEE, dd MMMM yyyy')}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2 mt-0.5">
            {greeting} 👋
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick theme toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-2xl bg-secondary/60 hover:bg-secondary text-foreground border border-border/60 transition-all active:scale-95 shadow-subtle"
            title="Toggle Theme"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-500" />
            )}
          </button>
        </div>
      </div>

      {/* 2. ONBOARDING CARD FOR NEW USERS */}
      {isBrandNewUser && (
        <Card className="p-5 bg-gradient-to-br from-primary/10 via-card to-card border-primary/30 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold">
              ✨
            </div>
            <div>
              <h3 className="font-bold text-foreground text-sm">Welcome to LifeOS Student Edition!</h3>
              <p className="text-xs text-muted-foreground">
                Your private student to-do list, day-to-day expense tracker, and study routine manager.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <Button size="sm" onClick={onLoadSampleData}>
              Load Starter Templates
            </Button>
            {onOpenAddTask && (
              <Button size="sm" variant="outline" onClick={onOpenAddTask}>
                Create Today's To-Do
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onOpenAddHabit}>
              Create Study Habit
            </Button>
          </div>
        </Card>
      )}

      {/* 3. HERO OVERVIEW CARDS: TO-DOS, HABITS & DAY'S SPENDING */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Today's To-Dos Card */}
        <Card
          onClick={() => onSelectTab('tasks')}
          className="relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between group cursor-pointer hover:border-primary/60 transition-all shadow-subtle"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                <ListTodo className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Today's To-Dos
              </span>
            </div>
            <span className="text-[11px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
              {todayTasksPct}% Done
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {completedTodayTasks.length}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                / {todayTasks.length} tasks completed
              </span>
            </div>

            <div className="w-full h-1.5 bg-secondary rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${todayTasksPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs">
            <span className="text-muted-foreground font-medium text-[11px]">
              {todayTasks.length - completedTodayTasks.length} pending today
            </span>
            <span className="text-primary font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform text-[11px]">
              Tasks <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Card>

        {/* Today's Habits Card */}
        <Card
          onClick={() => onSelectTab('habits')}
          className="relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between group cursor-pointer hover:border-emerald-500/60 transition-all shadow-subtle"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Habits
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              {todayCompletionPct}% Done
            </span>
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                {completedTodayHabits.length}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-muted-foreground">
                / {scheduledTodayHabits.length} routines
              </span>
            </div>

            <div className="w-full h-2 bg-secondary rounded-full mt-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                style={{ width: `${todayCompletionPct}%` }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs">
            <span className="text-muted-foreground flex items-center gap-1 font-medium text-[11px]">
              <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {weeklyConsistency}% streak consistency
            </span>
            <span className="text-emerald-500 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform text-[11px]">
              Habits <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Card>

        {/* Day-to-Day Expense Snapshot Card */}
        <Card
          onClick={() => onSelectTab('finance')}
          className="relative overflow-hidden p-4 sm:p-5 flex flex-col justify-between group cursor-pointer hover:border-indigo-500/60 transition-all shadow-subtle"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-destructive/15 text-destructive flex items-center justify-center">
                <Wallet className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Today's Spending
              </span>
            </div>
            {dailyTargetPaise > 0 && (
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  isOverDailyBudget
                    ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {isOverDailyBudget ? 'Over Budget' : 'On Track'}
              </span>
            )}
          </div>

          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight font-mono">
                {formatINR(todayCashFlow.effectiveExpensePaise)}
              </span>
              {todayCashFlow.totalIncomePaise > 0 && (
                <span className="text-xs font-semibold text-emerald-500 flex items-center gap-0.5">
                  <ArrowDownLeft className="w-3 h-3" /> +{formatINR(todayCashFlow.totalIncomePaise)}
                </span>
              )}
            </div>

            {dailyTargetPaise > 0 ? (
              <div className="text-[11px] text-muted-foreground mt-1.5 flex items-center justify-between font-medium">
                <span>Daily allowance: {formatINR(dailyTargetPaise)}</span>
                <span className="font-mono">
                  {Math.round((todayCashFlow.effectiveExpensePaise / dailyTargetPaise) * 100)}%
                </span>
              </div>
            ) : (
              <span className="text-[11px] text-muted-foreground mt-1 block font-medium">
                {todayExpenses.length} expense(s) logged today
              </span>
            )}
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-border/40 text-xs">
            <span className="text-muted-foreground font-medium text-[11px]">
              Monthly: {formatINR(monthCashFlow.effectiveExpensePaise)}
            </span>
            <span className="text-indigo-400 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform text-[11px]">
              Expenses <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Card>
      </div>

      {/* 4. WORD OF THE DAY FEATURED BANNER */}
      <Card
        onClick={() => onSelectTab('vocabulary')}
        className="cursor-pointer group relative overflow-hidden p-4 sm:p-5 bg-gradient-to-br from-indigo-950/40 via-card to-card border-indigo-500/30 hover:border-indigo-500/60 transition-all duration-300"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <Sparkles className="w-3 h-3" /> Word of the Day
              </span>
              <span className="text-[11px] font-mono italic text-muted-foreground">
                ({wotd.partOfSpeech})
              </span>
              <span className="text-[11px] font-semibold uppercase text-indigo-400/80">
                • {wotd.difficulty}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 pt-1">
              <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight group-hover:text-indigo-400 transition-colors">
                {wotd.word}
              </h3>
              <span className="text-base sm:text-lg font-bold text-amber-400 font-devanagari">
                — {wotd.marathiMeaning}
              </span>
            </div>

            <p className="text-xs text-muted-foreground line-clamp-1 pt-0.5">
              {wotd.meaning}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Explore Vocab <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </Card>

      {/* 5. QUICK-ACTION BUTTONS */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block px-1 mb-2.5">
          Quick Actions
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Add Task */}
          <button
            onClick={() => {
              if (onOpenAddTask) onOpenAddTask();
              else onSelectTab('tasks');
            }}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/70 hover:border-primary/50 hover:bg-secondary/40 transition-all active:scale-95 text-left group shadow-subtle"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ListTodo className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Add To-Do</span>
              <span className="text-[10px] text-muted-foreground">Assignments & study</span>
            </div>
          </button>

          {/* Record Expense */}
          <button
            onClick={() => onOpenAddTransaction('expense')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/70 hover:border-destructive/50 hover:bg-secondary/40 transition-all active:scale-95 text-left group shadow-subtle"
          >
            <div className="w-10 h-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Daily Expense</span>
              <span className="text-[10px] text-muted-foreground">Canteen, chai, travel</span>
            </div>
          </button>

          {/* Add Habit */}
          <button
            onClick={onOpenAddHabit}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/70 hover:border-emerald-500/50 hover:bg-secondary/40 transition-all active:scale-95 text-left group shadow-subtle"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Add Habit</span>
              <span className="text-[10px] text-muted-foreground">Build routine</span>
            </div>
          </button>

          {/* Practice Vocab Quiz */}
          <button
            onClick={() => onSelectTab('vocabulary')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-card border border-border/70 hover:border-indigo-500/50 hover:bg-secondary/40 transition-all active:scale-95 text-left group shadow-subtle"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-xs font-bold text-foreground block">Start Quiz</span>
              <span className="text-[10px] text-muted-foreground">Practice vocab</span>
            </div>
          </button>
        </div>
      </div>

      {/* 6. TODAY'S TASKS LIST WIDGET */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <ListTodo className="w-4 h-4 text-primary" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Today's To-Dos ({completedTodayTasks.length}/{todayTasks.length})
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('tasks')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
          >
            View All Tasks ({tasks.length}) <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayTasks.length > 0 ? (
          <div className="space-y-2">
            {todayTasks.map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  t.completed
                    ? 'bg-secondary/20 border-border/40 opacity-70'
                    : 'bg-card/70 hover:bg-card border-border/70 shadow-subtle'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => handleToggleTask(t.id, !t.completed)}
                    className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
                      t.completed
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-muted-foreground/40 hover:border-primary'
                    }`}
                  >
                    {t.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>

                  <div className="min-w-0 flex-1">
                    <span
                      className={`text-sm font-semibold truncate block ${
                        t.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {t.title}
                    </span>
                    <div className="flex items-center gap-2 text-[10.5px] text-muted-foreground mt-0.5">
                      <span className="capitalize">{t.priority}</span>
                      <span>•</span>
                      <span>{t.category}</span>
                      {t.dueTime && <span>• @ {t.dueTime}</span>}
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
          <Card className="p-5 text-center bg-card flex flex-col items-center justify-center">
            <ListTodo className="w-7 h-7 text-muted-foreground/40 mb-1.5" />
            <p className="text-xs text-muted-foreground font-medium">
              No tasks due today. Stay ahead or add one!
            </p>
            {onOpenAddTask && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenAddTask}
                className="mt-3 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Today's Task
              </Button>
            )}
          </Card>
        )}
      </div>

      {/* 7. TODAY'S EXPENSE TRACKER FEED WIDGET */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-destructive" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Today's Day-to-Day Expenses ({todayExpenses.length}) • Total: {formatINR(todayCashFlow.effectiveExpensePaise)}
            </h3>
          </div>
          <button
            onClick={() => onSelectTab('finance')}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-0.5"
          >
            Open Day Tracker <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayTransactions.length > 0 ? (
          <div className="space-y-2">
            {todayTransactions.map((tx) => (
              <TransactionCard
                key={tx.id}
                transaction={tx}
                onEdit={() => onSelectTab('finance')}
              />
            ))}
          </div>
        ) : (
          <Card className="p-5 text-center bg-card flex flex-col items-center justify-center">
            <Wallet className="w-7 h-7 text-muted-foreground/40 mb-1.5" />
            <p className="text-xs text-muted-foreground font-medium">
              No expenses recorded today. Log your morning chai, canteen meal, auto fare, or xerox!
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => onOpenAddTransaction('expense')}
              className="mt-3 text-xs font-bold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Log Day's Expense
            </Button>
          </Card>
        )}
      </div>

      {/* 8. TODAY'S HABITS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
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

        {scheduledTodayHabits.length > 0 ? (
          <div className="space-y-2.5">
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
          <Card className="p-6 text-center bg-card">
            <Calendar className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs text-muted-foreground font-medium">
              {activeHabits.length === 0
                ? 'No habits created yet. Tap "Add Habit" above to get started!'
                : 'No habits scheduled for today. Rest or check your schedule!'}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
