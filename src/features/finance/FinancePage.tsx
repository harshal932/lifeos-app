import React, { useState } from 'react';
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  PieChart,
  Tag,
  CreditCard,
  Calendar,
  Clock,
  Sparkles,
  Coffee,
  Utensils,
  Car,
  ShoppingCart,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { TransactionCard } from './TransactionCard';
import { AddEditTransactionModal } from './AddEditTransactionModal';
import { HoldingsCard } from './HoldingsCard';
import { UpdateHoldingsModal } from './UpdateHoldingsModal';
import { StudentPocketMoneyCard } from './StudentPocketMoneyCard';
import type { Transaction, TransactionType, Budget, AppSettings, UserHoldings } from '../../types';
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../services/financeService';
import { calculateCashFlow, formatINR } from '../../utils/currency';
import { getCurrentMonthString, getLocalDateString, parseLocalDate, formatDisplayDate } from '../../utils/date';
import { format, subMonths, addMonths, subDays, addDays, getDaysInMonth } from 'date-fns';
import { Check, CheckCircle2, Printer, BookOpen, Smartphone } from 'lucide-react';

interface FinancePageProps {
  transactions: Transaction[];
  budget?: Budget;
  settings?: AppSettings;
  expenseCategories: string[];
  incomeCategories: string[];
  paymentMethods: string[];
  onOpenBudgetModal?: () => void;
  onUpdateHoldings?: (holdings: UserHoldings) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const FinancePage: React.FC<FinancePageProps> = ({
  transactions,
  budget,
  settings,
  expenseCategories,
  incomeCategories,
  paymentMethods,
  onOpenBudgetModal,
  onUpdateHoldings,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(getLocalDateString());
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonthString());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isHoldingsModalOpen, setIsHoldingsModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('expense');
  const [modalDefaultCategory, setModalDefaultCategory] = useState<string | undefined>(undefined);
  const [modalDefaultDate, setModalDefaultDate] = useState<string | undefined>(undefined);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [quickFeedback, setQuickFeedback] = useState<string | null>(null);

  const todayStr = getLocalDateString();
  const yesterdayStr = getLocalDateString(subDays(new Date(), 1));
  const isSelectedDateToday = selectedDate === todayStr;
  const isSelectedDateYesterday = selectedDate === yesterdayStr;

  // Day navigation
  const currentDateObj = parseLocalDate(selectedDate);
  const handlePrevDay = () => {
    const prev = subDays(currentDateObj, 1);
    setSelectedDate(getLocalDateString(prev));
  };
  const handleNextDay = () => {
    const next = addDays(currentDateObj, 1);
    setSelectedDate(getLocalDateString(next));
  };
  const handleJumpToToday = () => {
    setSelectedDate(todayStr);
  };
  const handleJumpToYesterday = () => {
    setSelectedDate(yesterdayStr);
  };

  // Student 1-Tap Quick-Add Expense
  const handleDirectQuickLog = async (item: {
    category: string;
    amountRupees: number;
    description: string;
  }) => {
    try {
      await createTransaction({
        type: 'expense',
        amountPaise: item.amountRupees * 100,
        category: item.category,
        date: selectedDate,
        paymentMethod: 'UPI',
        description: item.description,
      });
      setQuickFeedback(`✓ Logged ₹${item.amountRupees} for ${item.description}!`);
      setTimeout(() => setQuickFeedback(null), 3500);
      await onRefresh();
    } catch (err) {
      console.error('Failed to quick log expense:', err);
    }
  };

  // Month navigation
  const currentMonthDate = parseLocalDate(`${selectedMonth}-01`);
  const displayMonthName = format(currentMonthDate, 'MMMM yyyy');

  const handlePrevMonth = () => {
    const prev = subMonths(currentMonthDate, 1);
    setSelectedMonth(format(prev, 'yyyy-MM'));
  };

  const handleNextMonth = () => {
    const next = addMonths(currentMonthDate, 1);
    setSelectedMonth(format(next, 'yyyy-MM'));
  };

  // Transactions on selected day
  const dayTransactions = transactions.filter((t) => t.date === selectedDate);
  const dayCashFlow = calculateCashFlow(dayTransactions);

  // Month transactions
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const monthCashFlow = calculateCashFlow(monthTransactions);

  // Remaining budget & Daily Allowance calculation
  const overallBudgetPaise = budget?.overallBudgetPaise || 0;
  const daysInCurMonth = getDaysInMonth(currentMonthDate);
  const dailyTargetPaise = overallBudgetPaise > 0 ? Math.round(overallBudgetPaise / daysInCurMonth) : 0;
  const remainingBudgetPaise = overallBudgetPaise - monthCashFlow.effectiveExpensePaise;
  const budgetUtilization =
    overallBudgetPaise > 0
      ? Math.round((monthCashFlow.effectiveExpensePaise / overallBudgetPaise) * 100)
      : 0;

  const dayBudgetUtilization =
    dailyTargetPaise > 0
      ? Math.round((dayCashFlow.effectiveExpensePaise / dailyTargetPaise) * 100)
      : 0;

  // Day Category breakdown
  const dayCategoryTotals = dayTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amountPaise;
      return acc;
    }, {} as Record<string, number>);

  const sortedDayCategories = Object.entries(dayCategoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amountPaise]) => ({
      category: cat,
      amountPaise,
      percentage:
        dayCashFlow.totalExpensePaise > 0
          ? Math.round((amountPaise / dayCashFlow.totalExpensePaise) * 100)
          : 0,
    }));

  // Monthly Category breakdown calculation for expenses
  const categoryTotals = monthTransactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amountPaise;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amountPaise]) => ({
      category: cat,
      amountPaise,
      percentage:
        monthCashFlow.totalExpensePaise > 0
          ? Math.round((amountPaise / monthCashFlow.totalExpensePaise) * 100)
          : 0,
    }));

  // Filtered & sorted transactions (for monthly tab or search)
  const filteredTransactions = monthTransactions
    .filter((t) => {
      if (selectedType !== 'all' && t.type !== selectedType) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      if (selectedPaymentMethod !== 'all' && t.paymentMethod !== selectedPaymentMethod) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.paymentMethod.toLowerCase().includes(q) ||
          (t.notes && t.notes.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') return b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);
      if (sortBy === 'date-asc') return a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
      if (sortBy === 'amount-desc') return b.amountPaise - a.amountPaise;
      if (sortBy === 'amount-asc') return a.amountPaise - b.amountPaise;
      return 0;
    });

  // Handlers
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data);
    } else {
      await createTransaction(data);
    }
    await onRefresh();
  };

  const handleDeleteConfirm = async () => {
    if (deletingId) {
      await deleteTransaction(deletingId);
      setDeletingId(null);
      await onRefresh();
    }
  };

  // Quick Open Modal with pre-configured settings
  const openAddModal = (opts?: {
    type?: TransactionType;
    category?: string;
    date?: string;
  }) => {
    setEditingTransaction(null);
    setModalDefaultType(opts?.type || 'expense');
    setModalDefaultCategory(opts?.category);
    setModalDefaultDate(opts?.date || (viewMode === 'daily' ? selectedDate : getLocalDateString()));
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* 1. Header and View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground flex items-center gap-2">
            Day-to-Day Life Expense Tracker
            <span className="text-[10px] bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Student Edition
            </span>
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Log daily canteen, chai, travel, and xerox spending effortlessly with daily pocket money limits.
          </p>
        </div>

        {/* View Switcher: Daily vs Monthly */}
        <div className="flex items-center gap-1 bg-secondary/80 p-1 rounded-2xl border border-border/70 self-start sm:self-auto shadow-subtle">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'daily'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Tracker</span>
          </button>
          <button
            onClick={() => setViewMode('monthly')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'monthly'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <PieChart className="w-3.5 h-3.5" />
            <span>Pocket Money Overview</span>
          </button>
        </div>
      </div>

      {/* Instant Feedback Toast Banner */}
      {quickFeedback && (
        <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-between shadow-subtle animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{quickFeedback}</span>
          </div>
          <button
            onClick={() => setQuickFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ======================================================== */}
      {/* DAILY VIEW MODE */}
      {/* ======================================================== */}
      {viewMode === 'daily' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Day Navigation & Calendar Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-secondary/40 p-3 sm:p-4 rounded-2xl border border-border/70">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevDay}
                className="p-2 rounded-xl hover:bg-card text-muted-foreground hover:text-foreground border border-border/50 transition-all active:scale-95"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-foreground">
                  {format(currentDateObj, 'EEE, dd MMMM yyyy')}
                </span>
                {isSelectedDateToday && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-primary/20 text-primary border border-primary/30">
                    Today
                  </span>
                )}
                {isSelectedDateYesterday && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Yesterday
                  </span>
                )}
              </div>

              <button
                onClick={handleNextDay}
                className="p-2 rounded-xl hover:bg-card text-muted-foreground hover:text-foreground border border-border/50 transition-all active:scale-95"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
              <button
                onClick={handleJumpToYesterday}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelectedDateYesterday
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                Yesterday
              </button>
              <button
                onClick={handleJumpToToday}
                className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  isSelectedDateToday
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-card border-border/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                Today
              </button>
              {/* Date Input for fast jump */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) setSelectedDate(e.target.value);
                }}
                className="bg-background/80 border border-border rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              />
            </div>
          </div>

          {/* Daily Spending & Budget Gauge */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Total Spent on Selected Day */}
            <Card className="p-4 bg-gradient-to-br from-card to-card/70 border-border/70 shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-destructive">
                  {isSelectedDateToday ? "Today's Spent" : 'Day Total Spent'}
                </span>
                <div className="p-1.5 rounded-xl bg-destructive/15 text-destructive">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                {formatINR(dayCashFlow.effectiveExpensePaise)}
              </div>
              <span className="text-[11px] text-muted-foreground block">
                {dayTransactions.filter((t) => t.type === 'expense').length} expense item(s) logged
              </span>
            </Card>

            {/* Daily Budget Comparison */}
            <Card className="p-4 bg-gradient-to-br from-card to-card/70 border-border/70 shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-foreground">Daily Allowance Target</span>
                <div className="p-1.5 rounded-xl bg-primary/15 text-primary">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                {dailyTargetPaise > 0 ? formatINR(dailyTargetPaise) : 'No limit set'}
              </div>
              {dailyTargetPaise > 0 ? (
                <div>
                  <div className="flex items-center justify-between text-[10.5px] mt-1 font-semibold">
                    <span
                      className={
                        dayCashFlow.effectiveExpensePaise > dailyTargetPaise
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }
                    >
                      {dayCashFlow.effectiveExpensePaise > dailyTargetPaise
                        ? `Exceeded by ${formatINR(dayCashFlow.effectiveExpensePaise - dailyTargetPaise)}`
                        : `${formatINR(dailyTargetPaise - dayCashFlow.effectiveExpensePaise)} remaining`}
                    </span>
                    <span className="text-muted-foreground">{dayBudgetUtilization}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        dayBudgetUtilization > 100 ? 'bg-destructive' : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(100, dayBudgetUtilization)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[11px] text-muted-foreground">Set monthly pocket money limit</span>
                  {onOpenBudgetModal && (
                    <button
                      onClick={onOpenBudgetModal}
                      className="text-[11px] text-primary hover:underline font-bold"
                    >
                      Set Limit
                    </button>
                  )}
                </div>
              )}
            </Card>

            {/* Income & Day Balance */}
            <Card className="p-4 bg-gradient-to-br from-card to-card/70 border-border/70 shadow-subtle space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-emerald-500">Day Pocket Money / Inflow</span>
                <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-500">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                {formatINR(dayCashFlow.totalIncomePaise)}
              </div>
              <span className="text-[11px] text-muted-foreground block">
                Net day balance: {formatINR(dayCashFlow.netCashFlowPaise)}
              </span>
            </Card>
          </div>

          {/* Student 1-Tap Quick-Add Daily Expense Shortcuts */}
          <Card className="p-4 bg-secondary/30 border-border/70 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  1-Tap Student Quick Log
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Tap once to instantly log for {isSelectedDateToday ? 'Today' : formatDisplayDate(selectedDate, 'dd MMM')}:
                </span>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openAddModal({ type: 'expense', date: selectedDate })}
                className="text-xs font-bold py-1.5 px-3"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Custom Expense
              </Button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              <button
                onClick={() =>
                  handleDirectQuickLog({
                    category: 'Chai & Snacks',
                    amountRupees: 15,
                    description: 'Chai / Tea',
                  })
                }
                className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/70 hover:border-amber-400/60 hover:bg-amber-500/10 transition-all shadow-subtle text-left active:scale-95 group"
              >
                <Coffee className="w-4 h-4 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Chai</span>
                  <span className="text-[10.5px] font-mono text-muted-foreground">₹15</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleDirectQuickLog({
                    category: 'Canteen & Food',
                    amountRupees: 60,
                    description: 'Canteen Lunch',
                  })
                }
                className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/70 hover:border-emerald-400/60 hover:bg-emerald-500/10 transition-all shadow-subtle text-left active:scale-95 group"
              >
                <Utensils className="w-4 h-4 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Canteen</span>
                  <span className="text-[10.5px] font-mono text-muted-foreground">₹60</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleDirectQuickLog({
                    category: 'Chai & Snacks',
                    amountRupees: 20,
                    description: 'Samosa / Snack',
                  })
                }
                className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/70 hover:border-orange-400/60 hover:bg-orange-500/10 transition-all shadow-subtle text-left active:scale-95 group"
              >
                <span className="text-base leading-none">🥟</span>
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Samosa</span>
                  <span className="text-[10.5px] font-mono text-muted-foreground">₹20</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleDirectQuickLog({
                    category: 'Auto & Bus / Metro',
                    amountRupees: 25,
                    description: 'Auto / Metro Fare',
                  })
                }
                className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/70 hover:border-blue-400/60 hover:bg-blue-500/10 transition-all shadow-subtle text-left active:scale-95 group"
              >
                <Car className="w-4 h-4 text-blue-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Auto/Bus</span>
                  <span className="text-[10.5px] font-mono text-muted-foreground">₹25</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleDirectQuickLog({
                    category: 'Xerox & Printout',
                    amountRupees: 20,
                    description: 'Notes Xerox & Prints',
                  })
                }
                className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/70 hover:border-indigo-400/60 hover:bg-indigo-500/10 transition-all shadow-subtle text-left active:scale-95 group"
              >
                <Printer className="w-4 h-4 text-indigo-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Xerox</span>
                  <span className="text-[10.5px] font-mono text-muted-foreground">₹20</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleDirectQuickLog({
                    category: 'Books & Stationery',
                    amountRupees: 50,
                    description: 'Notebook & Pen',
                  })
                }
                className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/70 hover:border-cyan-400/60 hover:bg-cyan-500/10 transition-all shadow-subtle text-left active:scale-95 group"
              >
                <BookOpen className="w-4 h-4 text-cyan-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Stationery</span>
                  <span className="text-[10.5px] font-mono text-muted-foreground">₹50</span>
                </div>
              </button>

              <button
                onClick={() =>
                  handleDirectQuickLog({
                    category: 'Recharge & Data',
                    amountRupees: 199,
                    description: 'Mobile Data Pack',
                  })
                }
                className="flex items-center gap-2 p-2.5 rounded-xl bg-card border border-border/70 hover:border-violet-400/60 hover:bg-violet-500/10 transition-all shadow-subtle text-left active:scale-95 group"
              >
                <Smartphone className="w-4 h-4 text-violet-400 shrink-0 group-hover:scale-110 transition-transform" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-foreground block truncate">Recharge</span>
                  <span className="text-[10.5px] font-mono text-muted-foreground">₹199</span>
                </div>
              </button>
            </div>
          </Card>

          {/* Daily Category Breakdown (if multiple categories) */}
          {sortedDayCategories.length > 0 && (
            <Card className="p-4 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Spending by Category (This Day)
                  </h3>
                </div>
                <span className="text-xs font-bold text-foreground font-mono">
                  {formatINR(dayCashFlow.totalExpensePaise)} total
                </span>
              </div>

              <div className="space-y-2">
                {sortedDayCategories.map((item) => (
                  <div key={item.category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{item.category}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-foreground">{formatINR(item.amountPaise)}</span>
                        <span className="text-muted-foreground text-[10px] w-7 text-right">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Daily Transactions Timeline Feed */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">
                  Day’s Timeline ({dayTransactions.length})
                </h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openAddModal({ type: 'income', date: selectedDate })}
                className="text-xs text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 border-emerald-500/30"
              >
                + Add Income
              </Button>
            </div>

            {dayTransactions.length === 0 ? (
              <div className="p-8 text-center bg-card/40 rounded-2xl border border-dashed border-border/70 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Wallet className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h4 className="text-base font-semibold text-foreground">
                  No expenses recorded on this day
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  {isSelectedDateToday
                    ? 'Log your morning coffee, commute, or snacks to keep your daily spending accurate.'
                    : 'Nothing was recorded for this date.'}
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openAddModal({ type: 'expense', date: selectedDate })}
                  className="mt-4 text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Log Expense
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {dayTransactions.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    onEdit={(t) => {
                      setEditingTransaction(t);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={(id) => setDeletingId(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MONTHLY OVERVIEW MODE */}
      {/* ======================================================== */}
      {viewMode === 'monthly' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Month Navigation */}
          <div className="flex items-center justify-between bg-secondary/40 p-3 sm:p-4 rounded-2xl border border-border/70">
            <span className="text-sm font-semibold text-muted-foreground">Select Month:</span>
            <div className="flex items-center gap-1.5 bg-secondary/80 p-1.5 rounded-2xl border border-border/70 shadow-subtle">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-xl hover:bg-card text-muted-foreground hover:text-foreground transition-all active:scale-95"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold px-3 text-foreground min-w-[110px] text-center">
                {displayMonthName}
              </span>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-xl hover:bg-card text-muted-foreground hover:text-foreground transition-all active:scale-95"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* STUDENT POCKET MONEY & ALLOWANCE WALLET */}
          <StudentPocketMoneyCard
            monthStr={selectedMonth}
            monthlyBudgetPaise={overallBudgetPaise}
            monthlySpentPaise={monthCashFlow.effectiveExpensePaise}
            monthlyIncomePaise={monthCashFlow.totalIncomePaise}
            onOpenBudgetModal={() => onOpenBudgetModal && onOpenBudgetModal()}
            onOpenAddIncome={() => openAddModal({ type: 'income', category: 'Pocket Money' })}
          />

          {/* MONTHLY METRICS OVERVIEW GRID */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Income Card */}
            <Card className="p-4 bg-emerald-500/[0.04] border-emerald-500/20 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Total Income</span>
                <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-500">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
                {formatINR(monthCashFlow.totalIncomePaise)}
              </div>
              <span className="text-[10px] text-muted-foreground block font-medium">Earned this month</span>
            </Card>

            {/* Expenses Card */}
            <Card className="p-4 bg-destructive/[0.04] border-destructive/20 space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold text-destructive">Total Expenses</span>
                <div className="p-1.5 rounded-xl bg-destructive/15 text-destructive">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl sm:text-2xl font-black text-foreground font-mono">
                {formatINR(monthCashFlow.effectiveExpensePaise)}
              </div>
              <span className="text-[10px] text-muted-foreground block font-medium">
                {monthCashFlow.totalRefundPaise > 0
                  ? `Ref: -${formatINR(monthCashFlow.totalRefundPaise)}`
                  : 'Spent this month'}
              </span>
            </Card>

            {/* Net Cash Flow Card */}
            <Card className="p-4 bg-card space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold">Net Cash Flow</span>
                <div className="p-1.5 rounded-xl bg-primary/15 text-primary">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`text-xl sm:text-2xl font-black font-mono ${
                  monthCashFlow.netCashFlowPaise >= 0 ? 'text-emerald-500' : 'text-destructive'
                }`}
              >
                {formatINR(monthCashFlow.netCashFlowPaise)}
              </div>
              <span className="text-[10px] text-muted-foreground block font-medium">Income minus expenses</span>
            </Card>

            {/* Budget Remaining Card */}
            <Card className="p-4 bg-card space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-bold">Remaining Budget</span>
                <div className="p-1.5 rounded-xl bg-secondary text-foreground">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div
                className={`text-xl sm:text-2xl font-black font-mono ${
                  overallBudgetPaise > 0 && remainingBudgetPaise < 0
                    ? 'text-destructive'
                    : 'text-foreground'
                }`}
              >
                {overallBudgetPaise > 0 ? formatINR(remainingBudgetPaise) : 'No limit set'}
              </div>
              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    budgetUtilization > 100 ? 'bg-destructive' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min(100, budgetUtilization)}%` }}
                />
              </div>
            </Card>
          </div>

          {/* Quick Add Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => openAddModal({ type: 'expense' })}
              className="bg-destructive hover:bg-destructive/90 text-white shadow-md shadow-destructive/20 font-bold py-3 text-sm rounded-2xl gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Expense
            </Button>
            <Button
              onClick={() => openAddModal({ type: 'income' })}
              className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 font-bold py-3 text-sm rounded-2xl gap-2"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add Income
            </Button>
          </div>

          {/* Monthly Category Spending Breakdown */}
          {sortedCategories.length > 0 && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                    Monthly Spending by Category
                  </h3>
                </div>
                <span className="text-xs font-bold text-foreground">
                  {sortedCategories.length} Categories
                </span>
              </div>

              <div className="space-y-3">
                {sortedCategories.map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{item.category}</span>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-extrabold text-foreground">{formatINR(item.amountPaise)}</span>
                        <span className="text-muted-foreground text-[10px] w-8 text-right font-bold">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Search and Filter Controls */}
          <Card className="p-4 sm:p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search description, category, payment method..."
                  className="w-full bg-secondary/40 border border-border rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/60 transition-all"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {/* Type Filter */}
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="bg-secondary/40 border border-border rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="all">All Types</option>
                  <option value="expense">Expenses Only</option>
                  <option value="income">Incomes Only</option>
                  <option value="refund">Refunds Only</option>
                  <option value="transfer">Transfers Only</option>
                </select>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-secondary/40 border border-border rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="all">All Categories</option>
                  {[...expenseCategories, ...incomeCategories].map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                {/* Payment Method Filter */}
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="bg-secondary/40 border border-border rounded-xl px-2.5 py-2 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
                >
                  <option value="all">All Methods</option>
                  {paymentMethods.map((pm) => (
                    <option key={pm} value={pm}>
                      {pm}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>

          {/* Month Transaction List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Month Transactions ({filteredTransactions.length})</span>
            </div>

            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center bg-card/40 rounded-2xl border border-dashed border-border/70 flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                  <Wallet className="w-6 h-6 stroke-[1.8]" />
                </div>
                <h4 className="text-base font-semibold text-foreground">
                  No transactions found for this month
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                  Record your expenses or switch months to view historical data.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredTransactions.map((tx) => (
                  <TransactionCard
                    key={tx.id}
                    transaction={tx}
                    onEdit={(t) => {
                      setEditingTransaction(t);
                      setIsAddModalOpen(true);
                    }}
                    onDelete={(id) => setDeletingId(id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Floating Action Button for Mobile / Fast Log */}
      <div className="fixed bottom-20 sm:bottom-8 right-5 sm:right-8 z-30">
        <button
          onClick={() => openAddModal({ type: 'expense' })}
          className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-elevated flex items-center justify-center hover:scale-105 active:scale-95 transition-all group border border-white/20"
          title="Add Expense"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Add / Edit Transaction Modal */}
      <AddEditTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
          setModalDefaultCategory(undefined);
          setModalDefaultDate(undefined);
        }}
        onSave={handleSaveTransaction}
        transactionToEdit={editingTransaction}
        defaultType={modalDefaultType}
        defaultCategory={modalDefaultCategory}
        defaultDate={modalDefaultDate}
        expenseCategories={expenseCategories}
        incomeCategories={incomeCategories}
        paymentMethods={paymentMethods}
      />

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card p-6 rounded-3xl border border-border shadow-elevated space-y-4">
            <h3 className="text-base font-bold text-foreground">Delete Transaction?</h3>
            <p className="text-xs text-muted-foreground">
              This transaction record will be permanently deleted and all totals will update immediately.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeletingId(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteConfirm}>
                Confirm Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Update Holdings Modal */}
      <UpdateHoldingsModal
        isOpen={isHoldingsModalOpen}
        onClose={() => setIsHoldingsModalOpen(false)}
        holdings={settings?.holdings}
        onSave={async (newHoldings) => {
          if (onUpdateHoldings) {
            await onUpdateHoldings(newHoldings);
          }
          await onRefresh();
        }}
      />
    </div>
  );
};
