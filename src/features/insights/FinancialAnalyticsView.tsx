import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import type { Transaction, Budget, AppSettings } from '../../types';
import { Card } from '../../components/common/Card';
import { formatINR, paiseToRupees } from '../../utils/currency';
import { getLocalDateString } from '../../utils/date';
import {
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from 'date-fns';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';

interface FinancialAnalyticsViewProps {
  transactions: Transaction[];
  settings: AppSettings;
  budget?: Budget;
}

const PIE_COLORS = [
  '#6366f1',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
  '#ef4444',
  '#3b82f6',
];

export const FinancialAnalyticsView: React.FC<FinancialAnalyticsViewProps> = ({
  transactions,
  settings,
  budget,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<
    'today' | 'week' | 'month' | 'prev-month' | 'all'
  >('month');

  const today = new Date();
  const todayStr = getLocalDateString(today);

  // Filter transactions by period
  const filteredTransactions = transactions.filter((tx) => {
    if (filterPeriod === 'today') {
      return tx.date === todayStr;
    }
    if (filterPeriod === 'week') {
      const start = getLocalDateString(startOfWeek(today, { weekStartsOn: settings.weekStartDay }));
      const end = getLocalDateString(endOfWeek(today, { weekStartsOn: settings.weekStartDay }));
      return tx.date >= start && tx.date <= end;
    }
    if (filterPeriod === 'month') {
      const start = getLocalDateString(startOfMonth(today));
      const end = getLocalDateString(endOfMonth(today));
      return tx.date >= start && tx.date <= end;
    }
    if (filterPeriod === 'prev-month') {
      const prev = subMonths(today, 1);
      const start = getLocalDateString(startOfMonth(prev));
      const end = getLocalDateString(endOfMonth(prev));
      return tx.date >= start && tx.date <= end;
    }
    return true;
  });

  // Totals for filtered period
  let totalIncomePaise = 0;
  let totalExpensePaise = 0;
  let totalRefundPaise = 0;
  const categorySpendingMap: Record<string, number> = {};
  const dailySpendingMap: Record<string, { date: string; expense: number; income: number }> = {};

  for (const tx of filteredTransactions) {
    if (tx.type === 'income') {
      totalIncomePaise += tx.amountPaise;
      if (!dailySpendingMap[tx.date]) {
        dailySpendingMap[tx.date] = { date: tx.date.substring(5), expense: 0, income: 0 };
      }
      dailySpendingMap[tx.date].income += paiseToRupees(tx.amountPaise);
    } else if (tx.type === 'expense') {
      totalExpensePaise += tx.amountPaise;
      categorySpendingMap[tx.category] =
        (categorySpendingMap[tx.category] || 0) + tx.amountPaise;

      if (!dailySpendingMap[tx.date]) {
        dailySpendingMap[tx.date] = { date: tx.date.substring(5), expense: 0, income: 0 };
      }
      dailySpendingMap[tx.date].expense += paiseToRupees(tx.amountPaise);
    } else if (tx.type === 'refund') {
      totalRefundPaise += tx.amountPaise;
      categorySpendingMap[tx.category] = Math.max(
        0,
        (categorySpendingMap[tx.category] || 0) - tx.amountPaise
      );
    }
  }

  const effectiveExpensePaise = Math.max(0, totalExpensePaise - totalRefundPaise);
  const netCashFlowPaise = totalIncomePaise - effectiveExpensePaise;

  // Pie chart data
  const categoryData = Object.entries(categorySpendingMap)
    .filter(([_, paise]) => paise > 0)
    .map(([cat, paise]) => ({
      name: cat,
      value: paiseToRupees(paise),
    }))
    .sort((a, b) => b.value - a.value);

  // Daily chart data sorted by date
  const dailyData = Object.keys(dailySpendingMap)
    .sort()
    .map((k) => dailySpendingMap[k]);

  // Savings Goal calculations
  const savingsGoalPaise = settings.savingsGoalPaise || 0;
  const savingsProgressPct =
    savingsGoalPaise > 0
      ? Math.min(100, Math.max(0, Math.round((netCashFlowPaise / savingsGoalPaise) * 100)))
      : 0;

  return (
    <div className="space-y-5">
      {/* Date Range Selector Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(
          [
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'prev-month', label: 'Previous Month' },
            { id: 'all', label: 'All Time' },
          ] as const
        ).map((p) => (
          <button
            key={p.id}
            onClick={() => setFilterPeriod(p.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterPeriod === p.id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-card text-muted-foreground border border-border/80 hover:text-foreground'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <Card className="p-3 bg-card">
          <span className="text-[11px] text-muted-foreground font-semibold block">Total Income</span>
          <span className="text-base font-extrabold text-emerald-500">
            {formatINR(totalIncomePaise, false)}
          </span>
        </Card>
        <Card className="p-3 bg-card">
          <span className="text-[11px] text-muted-foreground font-semibold block">Total Expenses</span>
          <span className="text-base font-extrabold text-destructive">
            {formatINR(effectiveExpensePaise, false)}
          </span>
        </Card>
        <Card className="p-3 bg-card">
          <span className="text-[11px] text-muted-foreground font-semibold block">Net Cash Flow</span>
          <span
            className={`text-base font-extrabold ${
              netCashFlowPaise >= 0 ? 'text-emerald-500' : 'text-destructive'
            }`}
          >
            {formatINR(netCashFlowPaise, false)}
          </span>
        </Card>
      </div>

      {/* Savings Goal Card */}
      {savingsGoalPaise > 0 && (
        <Card className="p-4 bg-gradient-to-br from-card to-secondary/30 border border-primary/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-primary/15 text-primary">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Monthly Savings Goal</h4>
                <span className="text-[11px] text-muted-foreground">
                  Target: {formatINR(savingsGoalPaise)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-extrabold text-primary">{savingsProgressPct}%</span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${savingsProgressPct}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            * Net cashflow contributed: {formatINR(Math.max(0, netCashFlowPaise))} towards goal.
          </p>
        </Card>
      )}

      {/* Spending Breakdown Chart */}
      <Card className="p-4 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Expense Category Breakdown
        </h4>
        {categoryData.length > 0 ? (
          <div className="space-y-4">
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={65}
                    innerRadius={35}
                    paddingAngle={3}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Progress Bars */}
            <div className="space-y-2 pt-2 border-t border-border/40">
              {categoryData.slice(0, 5).map((item, idx) => {
                const totalExp = paiseToRupees(effectiveExpensePaise);
                const pct = totalExp > 0 ? Math.round((item.value / totalExp) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                        />
                        {item.name}
                      </span>
                      <span className="text-muted-foreground font-medium">
                        ₹{item.value.toLocaleString('en-IN')} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: PIE_COLORS[idx % PIE_COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No expenses recorded for the selected period.
          </div>
        )}
      </Card>

      {/* Daily Cashflow Trend Chart */}
      {dailyData.length > 0 && (
        <Card className="p-4 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Daily Activity Trend (₹)
          </h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toLocaleString('en-IN')}`]}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
};
