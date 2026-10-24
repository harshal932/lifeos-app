import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import type { UserHoldings } from '../../types';
import { parseRupeesToPaise, paiseToRupees, formatINR } from '../../utils/currency';
import { Banknote, TrendingUp, PiggyBank, Coins } from 'lucide-react';

interface UpdateHoldingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  holdings?: UserHoldings;
  onSave: (holdings: UserHoldings) => Promise<void>;
}

export const UpdateHoldingsModal: React.FC<UpdateHoldingsModalProps> = ({
  isOpen,
  onClose,
  holdings,
  onSave,
}) => {
  const [cashInput, setCashInput] = useState('');
  const [shareMarketInput, setShareMarketInput] = useState('');
  const [savedInput, setSavedInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (holdings) {
      setCashInput(holdings.cashPaise > 0 ? paiseToRupees(holdings.cashPaise).toString() : '');
      setShareMarketInput(
        holdings.shareMarketPaise > 0 ? paiseToRupees(holdings.shareMarketPaise).toString() : ''
      );
      setSavedInput(holdings.savedPaise > 0 ? paiseToRupees(holdings.savedPaise).toString() : '');
    } else {
      setCashInput('');
      setShareMarketInput('');
      setSavedInput('');
    }
    setError('');
  }, [holdings, isOpen]);

  // Compute live total in paise
  const cashPaise = parseRupeesToPaise(cashInput);
  const shareMarketPaise = parseRupeesToPaise(shareMarketInput);
  const savedPaise = parseRupeesToPaise(savedInput);
  const totalHoldingsPaise = cashPaise + shareMarketPaise + savedPaise;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setError('');

      await onSave({
        cashPaise,
        shareMarketPaise,
        savedPaise,
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to update holdings');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Funds & Holdings"
      description="Track your real-world Cash, Share Market investments, and Saved Amount."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-destructive/15 text-destructive rounded-xl">
            {error}
          </div>
        )}

        {/* Live Total Preview Card */}
        <div className="p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-emerald-500/10 border border-primary/20 rounded-2xl text-center space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center justify-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-primary" />
            Total Funds & Holdings
          </span>
          <div className="text-2xl font-black text-foreground">
            {formatINR(totalHoldingsPaise)}
          </div>
          <span className="text-[10px] text-muted-foreground block">
            Sum of Cash + Share Market + Saved Amount
          </span>
        </div>

        {/* 1. Cash Amount */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <Banknote className="w-4 h-4 text-emerald-500" />
            Cash in Hand / Cash Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm font-bold text-muted-foreground">
              ₹
            </span>
            <input
              type="number"
              step="1"
              min="0"
              inputMode="decimal"
              value={cashInput}
              onChange={(e) => setCashInput(e.target.value)}
              placeholder="e.g. 15000"
              className="w-full pl-8 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">
            Physical currency or liquid cash on hand
          </span>
        </div>

        {/* 2. Share Market Amount */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-500" />
            Share Market / Investment Amount (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm font-bold text-muted-foreground">
              ₹
            </span>
            <input
              type="number"
              step="1"
              min="0"
              inputMode="decimal"
              value={shareMarketInput}
              onChange={(e) => setShareMarketInput(e.target.value)}
              placeholder="e.g. 75000"
              className="w-full pl-8 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">
            Total portfolio value in stocks, mutual funds & equities
          </span>
        </div>

        {/* 3. Saved Amount */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
            <PiggyBank className="w-4 h-4 text-amber-500" />
            Saved Amount / Bank Savings (₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm font-bold text-muted-foreground">
              ₹
            </span>
            <input
              type="number"
              step="1"
              min="0"
              inputMode="decimal"
              value={savedInput}
              onChange={(e) => setSavedInput(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full pl-8 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <span className="text-[10px] text-muted-foreground mt-1 block">
            Emergency funds, fixed deposits, or bank savings account balance
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Holdings'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
