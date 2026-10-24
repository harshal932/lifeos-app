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
  CreditCard
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { TransactionCard } from './TransactionCard';
import { AddEditTransactionModal } from './AddEditTransactionModal';
import { HoldingsCard } from './HoldingsCard';
import { UpdateHoldingsModal } from './UpdateHoldingsModal';
import type { Transaction, TransactionType, Budget, AppSettings, UserHoldings } from '../../types';
import {
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../../services/financeService';
import { calculateCashFlow, formatINR } from '../../utils/currency';
import { getCurrentMonthString, parseLocalDate } from '../../utils/date';
import { format, subMonths, addMonths } from 'date-fns';

interface FinancePageProps {
  transactions: Transaction[];
  budget?: Budget;
  settings?: AppSettings;
  expenseCategories: string[];
  incomeCategories: string[];
  paymentMethods: string[];
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
  onUpdateHoldings,
  onRefresh,
}) => {
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
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  // Month transactions
  const monthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const monthCashFlow = calculateCashFlow(monthTransactions);

  // Remaining budget
  const overallBudgetPaise = budget?.overallBudgetPaise || 0;
  const remainingBudgetPaise = overallBudgetPaise - monthCashFlow.effectiveExpensePaise;
  const budgetUtilization =
    overallBudgetPaise > 0
      ? Math.round((monthCashFlow.effectiveExpensePaise / overallBudgetPaise) * 100)
      : 0;

  // Category breakdown calculation for expenses
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

  // Filtered & sorted transactions
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

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* 1. Header and Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            Expense Manager
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Track daily spending, cash flow, and asset holdings in Indian Rupees (₹).
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-1.5 bg-secondary/60 p-1.5 rounded-2xl border border-border/70 self-start sm:self-auto shadow-subtle">
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

      {/* 2. TOTAL ASSET HOLDINGS CARD */}
      <HoldingsCard
        holdings={settings?.holdings}
        onEdit={() => setIsHoldingsModalOpen(true)}
      />

      {/* 3. METRICS OVERVIEW GRID */}
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

      {/* 4. QUICK ADD BUTTONS */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          onClick={() => {
            setModalDefaultType('expense');
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="bg-destructive hover:bg-destructive/90 text-white shadow-md shadow-destructive/20 font-bold py-3 text-sm rounded-2xl gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Expense
        </Button>
        <Button
          onClick={() => {
            setModalDefaultType('income');
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 font-bold py-3 text-sm rounded-2xl gap-2"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          Add Income
        </Button>
      </div>

      {/* 5. MONTHLY CATEGORY SPENDING BREAKDOWN */}
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

      {/* 6. SEARCH AND FILTER CONTROLS */}
      <Card className="p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchant, category, notes..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-secondary/40 border border-border/70 rounded-2xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
            />
          </div>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3.5 py-2.5 bg-secondary/50 border border-border/70 rounded-2xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary/50"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {/* Type Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-border/40 text-xs">
          <span className="text-[11px] font-bold text-muted-foreground uppercase mr-1">Type:</span>
          {(['all', 'expense', 'income', 'refund', 'transfer'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1 rounded-full capitalize font-semibold transition-all ${
                selectedType === t
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </Card>

      {/* 7. TRANSACTIONS LIST */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {displayMonthName} Records ({filteredTransactions.length})
          </span>
        </div>

        {filteredTransactions.length > 0 ? (
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
        ) : (
          <div className="p-10 text-center bg-card rounded-3xl border border-dashed border-border/80 space-y-3">
            <Wallet className="w-12 h-12 text-muted-foreground/30 mx-auto" />
            <div>
              <h4 className="text-base font-bold text-foreground">
                {searchQuery ? 'No transactions match filters' : 'No transactions recorded for this month'}
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                {searchQuery
                  ? 'Try clearing the search query or changing your filters.'
                  : 'Keep your finances in control by recording your first expense or income for this month.'}
              </p>
            </div>
            {!searchQuery && (
              <Button
                size="sm"
                onClick={() => {
                  setModalDefaultType('expense');
                  setEditingTransaction(null);
                  setIsAddModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" /> Add First Transaction
              </Button>
            )}
          </div>
        )}
      </div>

      {/* 8. MOBILE FLOATING ACTION BUTTON (FAB) */}
      <div className="sm:hidden fixed right-5 bottom-20 z-40">
        <button
          onClick={() => {
            setModalDefaultType('expense');
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-2xl flex items-center justify-center active:scale-90 transition-transform shadow-primary/30"
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
        }}
        onSave={handleSaveTransaction}
        transactionToEdit={editingTransaction}
        defaultType={modalDefaultType}
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
              This transaction record will be permanently deleted and all monthly totals will update immediately.
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
