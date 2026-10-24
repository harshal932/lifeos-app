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
    <div className="space-y-5 pb-20">
      {/* Header and Month Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Personal Finances
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Accurate income, expense and cashflow manager in INR (₹).
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-2xl border border-border/60 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 rounded-xl hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold px-2 text-foreground min-w-[100px] text-center">
            {displayMonthName}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1.5 rounded-xl hover:bg-card text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* TOTAL AMOUNT & ASSET HOLDINGS SECTION (CASH, SHAREMARKET, SAVED) */}
      <HoldingsCard
        holdings={settings?.holdings}
        onEdit={() => setIsHoldingsModalOpen(true)}
      />

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Income Card */}
        <Card className="p-4 bg-emerald-500/[0.04] border-emerald-500/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">Total Income</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-500">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-foreground">
            {formatINR(monthCashFlow.totalIncomePaise)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">Received this month</span>
        </Card>

        {/* Expenses Card */}
        <Card className="p-4 bg-destructive/[0.04] border-destructive/20">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-semibold text-destructive">Total Expenses</span>
            <div className="p-1.5 rounded-lg bg-destructive/15 text-destructive">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-foreground">
            {formatINR(monthCashFlow.effectiveExpensePaise)}
          </div>
          {monthCashFlow.totalRefundPaise > 0 && (
            <span className="text-[10px] text-cyan-500 mt-1 block">
              Includes -{formatINR(monthCashFlow.totalRefundPaise)} refund credit
            </span>
          )}
        </Card>

        {/* Net Cash Flow Card */}
        <Card className="p-4 bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-semibold">Net Cash Flow</span>
            <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl font-black ${
              monthCashFlow.netCashFlowPaise >= 0 ? 'text-emerald-500' : 'text-destructive'
            }`}
          >
            {formatINR(monthCashFlow.netCashFlowPaise)}
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">Income minus expenses</span>
        </Card>

        {/* Budget Remaining Card */}
        <Card className="p-4 bg-card">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span className="font-semibold">Remaining Budget</span>
            <div className="p-1.5 rounded-lg bg-secondary text-foreground">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`text-xl font-black ${
              overallBudgetPaise > 0 && remainingBudgetPaise < 0
                ? 'text-destructive'
                : 'text-foreground'
            }`}
          >
            {overallBudgetPaise > 0 ? formatINR(remainingBudgetPaise) : 'No limit set'}
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                budgetUtilization > 100 ? 'bg-destructive' : 'bg-primary'
              }`}
              style={{ width: `${Math.min(100, budgetUtilization)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Quick Add Action Buttons */}
      <div className="flex items-center gap-2">
        <Button
          onClick={() => {
            setModalDefaultType('expense');
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="flex-1 bg-destructive/90 hover:bg-destructive text-white shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </Button>
        <Button
          onClick={() => {
            setModalDefaultType('income');
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Income
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 bg-card rounded-2xl border border-border shadow-subtle space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search merchant, category, notes..."
              className="w-full pl-9 pr-3 py-2 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>

          {/* Sort By Dropdown */}
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/40 text-xs">
          {/* Type Filter */}
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-muted-foreground font-semibold">Type:</span>
            {(['all', 'expense', 'income', 'refund', 'transfer'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all ${
                  selectedType === t
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-secondary/40 text-muted-foreground hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
            {displayMonthName} Records ({filteredTransactions.length})
          </span>
        </div>

        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx) => (
            <TransactionCard
              key={tx.id}
              transaction={tx}
              onEdit={(t) => {
                setEditingTransaction(t);
                setIsAddModalOpen(true);
              }}
              onDelete={(id) => setDeletingId(id)}
            />
          ))
        ) : (
          <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border/80">
            <Wallet className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-foreground">
              {searchQuery ? 'No transactions match filters' : 'No transactions recorded for this month'}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              {searchQuery
                ? 'Try clearing the search query or changing your filters.'
                : 'Keep your finances in control by adding your first expense or income for this month.'}
            </p>
            {!searchQuery && (
              <Button
                size="sm"
                onClick={() => {
                  setModalDefaultType('expense');
                  setEditingTransaction(null);
                  setIsAddModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Add First Transaction
              </Button>
            )}
          </div>
        )}
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
          <div className="w-full max-w-sm bg-card p-5 rounded-2xl border border-border shadow-elevated space-y-4">
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
