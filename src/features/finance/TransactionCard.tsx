import React from 'react';
import { ArrowUpRight, ArrowDownLeft, RefreshCw, ArrowLeftRight, Trash2, Edit3, Tag } from 'lucide-react';
import type { Transaction } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { formatINR } from '../../utils/currency';
import { formatDisplayDate } from '../../utils/date';

interface TransactionCardProps {
  transaction: Transaction;
  onEdit: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
}

export const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  onEdit,
  onDelete,
}) => {
  const isIncome = transaction.type === 'income';
  const isRefund = transaction.type === 'refund';
  const isTransfer = transaction.type === 'transfer';

  // Visual cues based on type
  const typeConfig = {
    expense: {
      color: 'text-destructive',
      bg: 'bg-destructive/10 text-destructive',
      icon: ArrowUpRight,
      prefix: '-',
    },
    income: {
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10 text-emerald-500',
      icon: ArrowDownLeft,
      prefix: '+',
    },
    refund: {
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10 text-cyan-500',
      icon: RefreshCw,
      prefix: '+',
    },
    transfer: {
      color: 'text-blue-500',
      bg: 'bg-blue-500/10 text-blue-500',
      icon: ArrowLeftRight,
      prefix: '',
    },
  }[transaction.type];

  const Icon = typeConfig.icon;

  return (
    <Card className="hover:border-border/80 p-3.5 transition-all">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Type Icon & Details */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeConfig.bg}`}>
            <Icon className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-foreground truncate">
                {transaction.description || transaction.category}
              </h4>
              <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0">
                {transaction.category}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{formatDisplayDate(transaction.date)}</span>
              {transaction.time && <span>• {transaction.time}</span>}
              <span>•</span>
              <span className="font-medium text-foreground/80">{transaction.paymentMethod}</span>
            </div>
          </div>
        </div>

        {/* Right: Amount & Actions */}
        <div className="text-right shrink-0 flex items-center gap-3">
          <div>
            <div className={`text-base font-extrabold ${typeConfig.color}`}>
              {typeConfig.prefix}
              {formatINR(transaction.amountPaise)}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
              {transaction.type}
            </span>
          </div>

          <div className="flex items-center gap-1 border-l border-border/60 pl-2">
            <button
              onClick={() => onEdit(transaction)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              title="Edit transaction"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            {onDelete && (
              <button
                onClick={() => onDelete(transaction.id)}
                className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete transaction"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Notes or Tags preview if present */}
      {(transaction.notes || (transaction.tags && transaction.tags.length > 0)) && (
        <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          {transaction.notes && <p className="truncate max-w-xs italic">"{transaction.notes}"</p>}
          {transaction.tags && transaction.tags.length > 0 && (
            <div className="flex items-center gap-1 ml-auto">
              <Tag className="w-3 h-3 text-muted-foreground/60" />
              {transaction.tags.map((t) => (
                <span key={t} className="text-[10px] bg-secondary px-1.5 py-0.5 rounded-md">
                  {t}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};
