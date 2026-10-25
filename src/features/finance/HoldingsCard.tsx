import React from 'react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import type { UserHoldings } from '../../types';
import { formatINR } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';
import { Banknote, TrendingUp, PiggyBank, Edit3, Coins, Wallet } from 'lucide-react';

interface HoldingsCardProps {
  holdings?: UserHoldings;
  onEdit: () => void;
}

export const HoldingsCard: React.FC<HoldingsCardProps> = ({ holdings, onEdit }) => {
  const cashPaise = holdings?.cashPaise || 0;
  const shareMarketPaise = holdings?.shareMarketPaise || 0;
  const savedPaise = holdings?.savedPaise || 0;
  const totalAmountPaise = cashPaise + shareMarketPaise + savedPaise;

  // Percentage calculations
  const cashPct = totalAmountPaise > 0 ? Math.round((cashPaise / totalAmountPaise) * 100) : 0;
  const shareMarketPct =
    totalAmountPaise > 0 ? Math.round((shareMarketPaise / totalAmountPaise) * 100) : 0;
  const savedPct = totalAmountPaise > 0 ? Math.round((savedPaise / totalAmountPaise) * 100) : 0;

  return (
    <Card className="p-4 sm:p-5 border-border/70 space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-secondary text-primary flex items-center justify-center font-bold">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Asset & Funds Overview
            </span>
            <h3 className="text-sm font-bold text-foreground">Holdings & Savings</h3>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onEdit}
          className="text-xs h-8 px-2.5 gap-1.5 border-border/80 hover:border-primary/40"
        >
          <Edit3 className="w-3.5 h-3.5" />
          Update
        </Button>
      </div>

      {/* Hero Total Amount */}
      <div className="space-y-1">
        <span className="text-xs font-semibold text-muted-foreground block">Total Amount</span>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            {formatINR(totalAmountPaise)}
          </span>
          {totalAmountPaise > 0 && (
            <Badge variant="primary" className="text-[10px] py-0 px-2">
              Combined Assets
            </Badge>
          )}
        </div>
      </div>

      {/* Visual Proportion Bar */}
      {totalAmountPaise > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden flex">
            {cashPct > 0 && (
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${cashPct}%` }}
                title={`Cash: ${cashPct}%`}
              />
            )}
            {shareMarketPct > 0 && (
              <div
                className="bg-cyan-500 h-full transition-all duration-300"
                style={{ width: `${shareMarketPct}%` }}
                title={`Share Market: ${shareMarketPct}%`}
              />
            )}
            {savedPct > 0 && (
              <div
                className="bg-amber-500 h-full transition-all duration-300"
                style={{ width: `${savedPct}%` }}
                title={`Saved: ${savedPct}%`}
              />
            )}
          </div>
        </div>
      )}

      {/* 3 Detailed Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
        {/* 1. Cash Amount */}
        <div className="p-3 bg-secondary/40 rounded-xl border border-border/70 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-emerald-500" />
              Cash Amount
            </span>
            {totalAmountPaise > 0 && (
              <span className="text-[10px] text-emerald-500 font-bold">{cashPct}%</span>
            )}
          </div>
          <div className="text-base font-extrabold text-foreground">{formatINR(cashPaise)}</div>
          <span className="text-[10px] text-muted-foreground block">In hand / Wallet</span>
        </div>

        {/* 2. Share Market Amount */}
        <div className="p-3 bg-secondary/40 rounded-xl border border-border/70 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-500" />
              Share Market
            </span>
            {totalAmountPaise > 0 && (
              <span className="text-[10px] text-cyan-500 font-bold">{shareMarketPct}%</span>
            )}
          </div>
          <div className="text-base font-extrabold text-foreground">
            {formatINR(shareMarketPaise)}
          </div>
          <span className="text-[10px] text-muted-foreground block">Stocks & Investments</span>
        </div>

        {/* 3. Saved Amount */}
        <div className="p-3 bg-secondary/40 rounded-xl border border-border/70 space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5 text-amber-500" />
              Saved Amount
            </span>
            {totalAmountPaise > 0 && (
              <span className="text-[10px] text-amber-500 font-bold">{savedPct}%</span>
            )}
          </div>
          <div className="text-base font-extrabold text-foreground">{formatINR(savedPaise)}</div>
          <span className="text-[10px] text-muted-foreground block">Bank savings & reserves</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
        <span>
          {holdings?.updatedAt
            ? `Last updated: ${formatDisplayDate(holdings.updatedAt.split('T')[0])}`
            : 'Tap "Update" to enter current balances'}
        </span>
      </div>
    </Card>
  );
};
