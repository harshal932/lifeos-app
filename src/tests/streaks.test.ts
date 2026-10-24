import { describe, it, expect } from 'vitest';
import { calculateHabitStreakStats, isHabitScheduledOn } from '../utils/streaks';
import type { Habit, HabitCompletion } from '../types';

describe('Habit Streaks and Schedules', () => {
  const baseHabit: Habit = {
    id: 'habit-1',
    name: 'Study Algorithms',
    category: 'Study',
    icon: 'book-open',
    color: '#6366f1',
    frequency: 'daily',
    selectedDays: [0, 1, 2, 3, 4, 5, 6],
    createdAt: '2026-10-01T00:00:00.000Z',
    isArchived: false,
  };

  it('correctly calculates streaks for daily habits with no missed days', () => {
    // 5 consecutive days: 2026-10-01 to 2026-10-05
    const completions: HabitCompletion[] = [
      { id: '1', habitId: 'habit-1', date: '2026-10-01', completedAt: '2026-10-01T10:00:00Z' },
      { id: '2', habitId: 'habit-1', date: '2026-10-02', completedAt: '2026-10-02T10:00:00Z' },
      { id: '3', habitId: 'habit-1', date: '2026-10-03', completedAt: '2026-10-03T10:00:00Z' },
      { id: '4', habitId: 'habit-1', date: '2026-10-04', completedAt: '2026-10-04T10:00:00Z' },
      { id: '5', habitId: 'habit-1', date: '2026-10-05', completedAt: '2026-10-05T10:00:00Z' },
    ];

    const stats = calculateHabitStreakStats(baseHabit, completions, '2026-10-05');
    expect(stats.currentStreak).toBe(5);
    expect(stats.longestStreak).toBe(5);
    expect(stats.totalCompletions).toBe(5);
  });

  it('resets current streak when a scheduled day was missed yesterday', () => {
    // Completed 10-01, 10-02, missed 10-03, 10-04
    const completions: HabitCompletion[] = [
      { id: '1', habitId: 'habit-1', date: '2026-10-01', completedAt: '2026-10-01T10:00:00Z' },
      { id: '2', habitId: 'habit-1', date: '2026-10-02', completedAt: '2026-10-02T10:00:00Z' },
    ];

    const stats = calculateHabitStreakStats(baseHabit, completions, '2026-10-05');
    // Today is 10-05 (not completed), yesterday 10-04 missed, so current streak = 0
    expect(stats.currentStreak).toBe(0);
    expect(stats.longestStreak).toBe(2);
    expect(stats.totalCompletions).toBe(2);
  });

  it('does NOT break streak on unscheduled days for weekday habits', () => {
    // Habit scheduled on Weekdays only (Mon-Fri)
    // 2026-10-02 is Friday (day 5), 2026-10-03 is Saturday (day 6), 2026-10-04 is Sunday (day 0), 2026-10-05 is Monday (day 1)
    const weekdayHabit: Habit = {
      ...baseHabit,
      frequency: 'weekdays',
    };

    expect(isHabitScheduledOn(weekdayHabit, '2026-10-02')).toBe(true); // Friday
    expect(isHabitScheduledOn(weekdayHabit, '2026-10-03')).toBe(false); // Saturday - unscheduled
    expect(isHabitScheduledOn(weekdayHabit, '2026-10-04')).toBe(false); // Sunday - unscheduled
    expect(isHabitScheduledOn(weekdayHabit, '2026-10-05')).toBe(true); // Monday

    const completions: HabitCompletion[] = [
      { id: '1', habitId: 'habit-1', date: '2026-10-02', completedAt: '2026-10-02T10:00:00Z' }, // Friday
      { id: '2', habitId: 'habit-1', date: '2026-10-05', completedAt: '2026-10-05T10:00:00Z' }, // Monday
    ];

    // Even though Sat and Sun had no completions, streak shouldn't break because they were unscheduled!
    const stats = calculateHabitStreakStats(weekdayHabit, completions, '2026-10-05');
    expect(stats.currentStreak).toBe(2);
    expect(stats.longestStreak).toBe(2);
  });

  it('keeps streak alive when today is scheduled and not yet completed if yesterday was completed', () => {
    // 2026-10-01 and 10-02 completed, today is 10-03 (still morning/not completed yet)
    const completions: HabitCompletion[] = [
      { id: '1', habitId: 'habit-1', date: '2026-10-01', completedAt: '2026-10-01T10:00:00Z' },
      { id: '2', habitId: 'habit-1', date: '2026-10-02', completedAt: '2026-10-02T10:00:00Z' },
    ];

    const stats = calculateHabitStreakStats(baseHabit, completions, '2026-10-03');
    // Active streak from yesterday is 2
    expect(stats.currentStreak).toBe(2);
  });
});
