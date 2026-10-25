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
      className={`group relative overflow-hidden transition-all duration-150 cursor-pointer p-3.5 sm:p-4 ${
        isCompletedToday
          ? 'bg-emerald-500/[0.04] border-emerald-500/30'
          : 'hover:border-border'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Category Icon, Name, Category & Streak */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Category Accent Indicator */}
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-sm shadow-subtle"
            style={{ backgroundColor: habit.color || '#6366f1' }}
          >
            {habit.name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4
                className={`text-sm font-semibold truncate transition-colors ${
                  isCompletedToday
                    ? 'line-through text-muted-foreground'
                    : 'text-foreground group-hover:text-primary'
                }`}
              >
                {habit.name}
              </h4>
              {habit.isArchived && (
                <Badge variant="outline" className="text-[10px] py-0 px-1">
                  Archived
                </Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="font-medium text-foreground/80">{habit.category}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 font-medium text-amber-500">
                <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
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
            <div className="flex items-center gap-1.5 mt-1.5">
              {last5Days.map((dot, i) => (
                <div
                  key={i}
                  title={`${dot.dateStr}: ${dot.isDone ? 'Completed' : 'Missed'}`}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    dot.isDone
                      ? 'bg-emerald-500'
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
        <div className="shrink-0 flex items-center pl-1">
          {isScheduledToday ? (
            <button
              onClick={handleCheckboxClick}
              aria-label={`Mark ${habit.name} ${isCompletedToday ? 'incomplete' : 'complete'}`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-120 active:scale-95 ${
                isCompletedToday
                  ? 'bg-emerald-500 text-white shadow-subtle'
                  : 'border border-border/80 hover:border-emerald-500/60 text-transparent hover:text-emerald-500/40 bg-secondary/30'
              }`}
            >
              <Check className={`w-4 h-4 stroke-[2.5] ${isCompletedToday ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ) : (
            <span className="text-[10px] text-muted-foreground font-medium px-2 py-0.5 rounded bg-secondary/50">
              Rest Day
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
