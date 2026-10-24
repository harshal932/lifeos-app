import React from 'react';
import { Check, Flame } from 'lucide-react';
import type { Habit, HabitCompletion } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { calculateHabitStreakStats, isHabitScheduledOn } from '../../utils/streaks';
import { getLocalDateString } from '../../utils/date';
import { subDays } from 'date-fns';

interface HabitCardProps {
  habit: Habit;
  completions: HabitCompletion[];
  onToggleComplete: (habitId: string, isCompleted: boolean) => void;
  onOpenDetails: (habit: Habit) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  completions,
  onToggleComplete,
  onOpenDetails,
}) => {
  const today = new Date();
  const todayStr = getLocalDateString(today);
  const isScheduledToday = isHabitScheduledOn(habit, todayStr);
  const isCompletedToday = completions.some(
    (c) => c.habitId === habit.id && c.date === todayStr
  );

  const streakStats = calculateHabitStreakStats(habit, completions, todayStr);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(habit.id, !isCompletedToday);
  };

  // Last 5 days completion mini dots
  const last5Days = Array.from({ length: 5 }, (_, i) => {
    const d = subDays(today, 4 - i);
    const dateStr = getLocalDateString(d);
    const isDone = completions.some((c) => c.habitId === habit.id && c.date === dateStr);
    const isTodayDot = dateStr === todayStr;
    return { dateStr, isDone, isTodayDot };
  });

  return (
    <Card
      onClick={() => onOpenDetails(habit)}
      className={`group relative overflow-hidden transition-all duration-200 cursor-pointer p-4 sm:p-5 ${
        isCompletedToday
          ? 'bg-emerald-500/5 dark:bg-emerald-500/[0.04] border-emerald-500/30'
          : 'hover:border-primary/40'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Category Icon, Name, Category & Streak */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Category Accent Indicator */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-sm font-bold text-base transition-transform group-hover:scale-105"
            style={{ backgroundColor: habit.color || '#6366f1' }}
          >
            {habit.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4
                className={`text-base font-bold truncate transition-colors ${
                  isCompletedToday
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground group-hover:text-primary'
                }`}
              >
                {habit.name}
              </h4>
              {habit.isArchived && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  Archived
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-medium text-foreground/80">{habit.category}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 font-bold text-amber-500">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {streakStats.currentStreak} day streak
              </span>
              {habit.target && (
                <>
                  <span>•</span>
                  <span>
                    {habit.target} {habit.targetUnit || 'mins'}
                  </span>
                </>
              )}
            </div>

            {/* Mini 5-day consistency dots */}
            <div className="flex items-center gap-1.5 mt-2">
              {last5Days.map((dot, i) => (
                <div
                  key={i}
                  title={`${dot.dateStr}: ${dot.isDone ? 'Completed' : 'Missed'}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    dot.isDone
                      ? 'bg-emerald-500 shadow-xs'
                      : dot.isTodayDot
                      ? 'border border-primary/60 bg-transparent'
                      : 'bg-muted'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right: One-tap Completion Button */}
        <div className="shrink-0 flex items-center pl-2">
          {isScheduledToday ? (
            <button
              onClick={handleCheckboxClick}
              aria-label={`Mark ${habit.name} ${isCompletedToday ? 'incomplete' : 'complete'}`}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                isCompletedToday
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'border-2 border-border/80 hover:border-emerald-500/60 text-transparent hover:text-emerald-500/40 bg-secondary/40'
              }`}
            >
              <Check className={`w-6 h-6 stroke-[3] ${isCompletedToday ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ) : (
            <span className="text-[11px] text-muted-foreground font-semibold px-2.5 py-1 rounded-xl bg-secondary/50">
              Rest Day
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
