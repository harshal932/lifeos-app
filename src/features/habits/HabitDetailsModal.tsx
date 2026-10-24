import React, { useState } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Flame, Award, Calendar, Archive, Trash2, Edit3, CheckCircle2, XCircle } from 'lucide-react';
import type { Habit, HabitCompletion } from '../../types';
import { calculateHabitStreakStats, isHabitScheduledOn } from '../../utils/streaks';
import { getLocalDateString, parseLocalDate, formatDisplayDate } from '../../utils/date';
import { subDays } from 'date-fns';

interface HabitDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  completions: HabitCompletion[];
  onToggleCompleteOnDate: (habitId: string, dateStr: string, isCompleted: boolean) => Promise<void>;
  onEdit: (habit: Habit) => void;
  onArchive: (habitId: string, isArchived: boolean) => Promise<void>;
  onDelete: (habitId: string, deleteHistory: boolean) => Promise<void>;
}

export const HabitDetailsModal: React.FC<HabitDetailsModalProps> = ({
  isOpen,
  onClose,
  habit,
  completions,
  onToggleCompleteOnDate,
  onEdit,
  onArchive,
  onDelete,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteHistory, setDeleteHistory] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!habit) return null;

  const todayStr = getLocalDateString();
  const stats = calculateHabitStreakStats(habit, completions, todayStr);

  // Generate calendar days for last 35 days (5 weeks)
  const calendarDays = Array.from({ length: 35 }, (_, i) => {
    const d = subDays(parseLocalDate(todayStr), 34 - i);
    const dateStr = getLocalDateString(d);
    const isScheduled = isHabitScheduledOn(habit, dateStr);
    const isCompleted = completions.some((c) => c.habitId === habit.id && c.date === dateStr);
    return {
      dateStr,
      dayNumber: d.getDate(),
      month: d.getMonth(),
      isScheduled,
      isCompleted,
      isToday: dateStr === todayStr,
    };
  });

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(habit.id, deleteHistory);
      setShowDeleteConfirm(false);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setShowDeleteConfirm(false);
        onClose();
      }}
      title={habit.name}
      description={`Created on ${formatDisplayDate(habit.createdAt.split('T')[0])}`}
    >
      <div className="space-y-5">
        {/* Streak & Consistency Metric Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-3 bg-secondary/40 border border-border/80 rounded-2xl">
            <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
              <Flame className="w-4 h-4 fill-amber-500" />
              <span className="text-xl font-extrabold">{stats.currentStreak}</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Current Streak</span>
          </div>

          <div className="p-3 bg-secondary/40 border border-border/80 rounded-2xl">
            <div className="flex items-center justify-center gap-1 text-primary mb-1">
              <Award className="w-4 h-4" />
              <span className="text-xl font-extrabold">{stats.longestStreak}</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Best Streak</span>
          </div>

          <div className="p-3 bg-secondary/40 border border-border/80 rounded-2xl">
            <div className="flex items-center justify-center gap-1 text-emerald-500 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xl font-extrabold">{stats.totalCompletions}</span>
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">Completions</span>
          </div>
        </div>

        {/* Consistency Rates */}
        <div className="p-3.5 bg-secondary/30 rounded-2xl border border-border/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Weekly Completion Rate</span>
            <span className="font-bold text-foreground">{stats.weeklyCompletionRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${stats.weeklyCompletionRate}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-muted-foreground">Monthly Completion Rate</span>
            <span className="font-bold text-foreground">{stats.monthlyCompletionRate}%</span>
          </div>
          <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${stats.monthlyCompletionRate}%` }}
            />
          </div>
        </div>

        {/* Habit History Heatmap */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-foreground">35-Day Consistency Heatmap</span>
            <span className="text-[10px] text-muted-foreground">Tap day to toggle</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 p-3 bg-secondary/20 rounded-2xl border border-border/50">
            {calendarDays.map((day) => {
              let bgClass = 'bg-secondary/40 text-muted-foreground/60 border-transparent';
              if (day.isScheduled) {
                if (day.isCompleted) {
                  bgClass = 'bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-500/20';
                } else {
                  bgClass = day.dateStr <= todayStr ? 'bg-destructive/15 text-destructive border border-destructive/20' : 'bg-secondary/40 text-muted-foreground';
                }
              }

              return (
                <button
                  key={day.dateStr}
                  onClick={() => onToggleCompleteOnDate(habit.id, day.dateStr, !day.isCompleted)}
                  className={`h-9 rounded-xl flex flex-col items-center justify-center text-[10px] transition-transform active:scale-95 ${bgClass} ${
                    day.isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : ''
                  }`}
                  title={`${day.dateStr}: ${
                    day.isCompleted ? 'Completed' : day.isScheduled ? 'Missed' : 'Unscheduled'
                  }`}
                >
                  <span className="font-semibold">{day.dayNumber}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2 px-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-emerald-500" /> Done
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-destructive/20 border border-destructive/30" /> Missed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-md bg-secondary/60" /> Unscheduled
            </span>
          </div>
        </div>

        {/* Description or Notes */}
        {habit.description && (
          <div className="p-3 bg-secondary/30 rounded-xl text-xs text-muted-foreground">
            <span className="font-semibold block text-foreground mb-0.5">Notes:</span>
            {habit.description}
          </div>
        )}

        {/* Delete Confirmation Step */}
        {showDeleteConfirm ? (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-destructive block">
              Are you sure you want to delete this habit?
            </span>
            <p className="text-xs text-muted-foreground">
              This action cannot be undone. Choose whether to remove all completion logs:
            </p>
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
              <input
                type="checkbox"
                checked={deleteHistory}
                onChange={(e) => setDeleteHistory(e.target.checked)}
                className="rounded text-primary focus:ring-primary"
              />
              Also delete all completion history records
            </label>
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </Button>
            </div>
          </div>
        ) : (
          /* Habit Management Actions */
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onEdit(habit);
                onClose();
              }}
              className="flex-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await onArchive(habit.id, !habit.isArchived);
                onClose();
              }}
              className="flex-1"
            >
              <Archive className="w-3.5 h-3.5" />
              {habit.isArchived ? 'Restore' : 'Archive'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
