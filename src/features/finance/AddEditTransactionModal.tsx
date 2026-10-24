import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import type { Transaction, TransactionType } from '../../types';
import { parseRupeesToPaise, paiseToRupees, formatINR } from '../../utils/currency';
import { getLocalDateString } from '../../utils/date';

interface AddEditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (txData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  transactionToEdit?: Transaction | null;
  expenseCategories: string[];
  incomeCategories: string[];
  paymentMethods: string[];
  defaultType?: TransactionType;
}

export const AddEditTransactionModal: React.FC<AddEditTransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
  expenseCategories,
  incomeCategories,
  paymentMethods,
  defaultType = 'expense',
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amountInput, setAmountInput] = useState('');
  const [category, setCategory] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0] || 'UPI');
  const [date, setDate] = useState(getLocalDateString());
  const [time, setTime] = useState('');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Active category list based on type
  const activeCategories = type === 'income' ? incomeCategories : expenseCategories;

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setAmountInput(paiseToRupees(transactionToEdit.amountPaise).toString());
      setCategory(transactionToEdit.category);
      setPaymentMethod(transactionToEdit.paymentMethod);
      setDate(transactionToEdit.date);
      setTime(transactionToEdit.time || '');
      setDescription(transactionToEdit.description);
      setNotes(transactionToEdit.notes || '');
      setTagsInput(transactionToEdit.tags ? transactionToEdit.tags.join(', ') : '');
    } else {
      setType(defaultType);
      setAmountInput('');
      const defaultCats = defaultType === 'income' ? incomeCategories : expenseCategories;
      setCategory(defaultCats[0] || 'Food');
      setPaymentMethod(paymentMethods[0] || 'UPI');
      setDate(getLocalDateString());
      const now = new Date();
      setTime(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
      setDescription('');
      setNotes('');
      setTagsInput('');
    }
    setError('');
  }, [transactionToEdit, isOpen, defaultType, expenseCategories, incomeCategories, paymentMethods]);

  // Handle type change
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    const newCats = newType === 'income' ? incomeCategories : expenseCategories;
    if (!newCats.includes(category)) {
      setCategory(newCats[0] || '');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const paise = parseRupeesToPaise(amountInput);
    if (!paise || paise <= 0) {
      setError('Please enter a valid amount greater than zero.');
      return;
    }
    if (!date) {
      setError('Please select a valid date.');
      return;
    }
    if (!category.trim()) {
      setError('Please select a category.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await onSave({
        type,
        amountPaise: paise,
        category: category.trim(),
        paymentMethod: paymentMethod.trim(),
        date,
        time: time || undefined,
        description: description.trim() || category.trim(),
        notes: notes.trim() || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save transaction');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parsedPaise = parseRupeesToPaise(amountInput);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={transactionToEdit ? 'Edit Transaction' : 'Record Transaction'}
      description="Track cashflow accurately with integer paise precision."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-destructive/15 text-destructive border border-destructive/20 rounded-xl">
            {error}
          </div>
        )}

        {/* Transaction Type Buttons */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Transaction Type
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {(['expense', 'income', 'refund', 'transfer'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => handleTypeChange(t)}
                className={`py-2 text-xs font-semibold rounded-xl capitalize transition-all ${
                  type === t
                    ? t === 'income'
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : t === 'refund'
                      ? 'bg-cyan-500 text-white shadow-sm'
                      : t === 'transfer'
                      ? 'bg-blue-500 text-white shadow-sm'
                      : 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-secondary/40 text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Amount (in ₹ Rupees) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-base font-bold text-muted-foreground">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              inputMode="decimal"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl text-base font-extrabold focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
              required
              autoFocus
            />
          </div>
          {parsedPaise > 0 && (
            <p className="text-[11px] text-muted-foreground mt-1">
              Formatted: <span className="font-semibold text-foreground">{formatINR(parsedPaise)}</span>
            </p>
          )}
        </div>

        {/* Category & Payment Method */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            >
              {activeCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            >
              {paymentMethods.map((pm) => (
                <option key={pm} value={pm}>
                  {pm}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Description / Merchant */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Merchant or Description
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Swiggy, Amazon, Metro, Salary"
            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Notes & Tags */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes"
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Tags (comma separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. essential, dinner"
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : transactionToEdit ? 'Save Changes' : 'Record Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
