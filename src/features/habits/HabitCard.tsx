import React from 'react';
import { Check, Flame, Calendar, Award } from 'lucide-react';
import type { Habit, HabitCompletion } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { calculateHabitStreakStats, isHabitScheduledOn } from '../../utils/streaks';
import { getLocalDateString } from '../../utils/date';

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
  const todayStr = getLocalDateString();
  const isScheduledToday = isHabitScheduledOn(habit, todayStr);
  const isCompletedToday = completions.some(
    (c) => c.habitId === habit.id && c.date === todayStr
  );

  const streakStats = calculateHabitStreakStats(habit, completions, todayStr);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(habit.id, !isCompletedToday);
  };

  return (
    <Card
      onClick={() => onOpenDetails(habit)}
      className={`relative overflow-hidden transition-all duration-200 ${
        isCompletedToday
          ? 'bg-primary/5 dark:bg-primary/[0.04] border-primary/30'
          : 'hover:border-border'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Left: Icon, Name, Category & Streak */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1">
          {/* Category Accent Indicator */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
            style={{ backgroundColor: habit.color || '#6366f1' }}
          >
            <span className="text-base font-bold uppercase">
              {habit.name.charAt(0)}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className={`text-base font-semibold truncate ${
                isCompletedToday ? 'line-through text-muted-foreground' : 'text-foreground'
              }`}>
                {habit.name}
              </h4>
              {habit.isArchived && (
                <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                  Archived
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{habit.category}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 font-medium text-amber-500">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {streakStats.currentStreak} streak
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
          </div>
        </div>

        {/* Right: One-tap Completion Circle Checkbox */}
        <div className="shrink-0 flex items-center">
          {isScheduledToday ? (
            <button
              onClick={handleCheckboxClick}
              aria-label={`Mark ${habit.name} ${isCompletedToday ? 'incomplete' : 'complete'}`}
              className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-90 ${
                isCompletedToday
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 scale-105'
                  : 'border-2 border-border/80 hover:border-primary/50 text-transparent hover:text-muted-foreground/30 bg-secondary/40'
              }`}
            >
              <Check className={`w-5 h-5 stroke-[2.5] ${isCompletedToday ? 'opacity-100' : 'opacity-0'}`} />
            </button>
          ) : (
            <span className="text-[11px] text-muted-foreground font-medium px-2 py-1 rounded-lg bg-secondary/50">
              Not today
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
