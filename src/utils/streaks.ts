import type { Habit, HabitCompletion, HabitStreakStats } from '../types';
import {
  getLocalDateString,
  parseLocalDate,
  getDayOfWeek,
  getDateRangeList,
} from './date';
import { subDays } from 'date-fns';

/**
 * Checks if a habit was scheduled on a given local calendar date (YYYY-MM-DD).
 */
export function isHabitScheduledOn(habit: Habit, dateStr: string): boolean {
  const createdDate = habit.createdAt.split('T')[0];
  if (dateStr < createdDate) {
    return false;
  }

  const dayOfWeek = getDayOfWeek(dateStr); // 0 = Sun, 1 = Mon, ..., 6 = Sat

  if (habit.frequency === 'daily') {
    return true;
  }

  if (habit.frequency === 'weekdays') {
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  }

  if (habit.frequency === 'custom') {
    return Array.isArray(habit.selectedDays) && habit.selectedDays.includes(dayOfWeek);
  }

  return true;
}

/**
 * Calculates current streak, longest streak, and completion statistics for a habit.
 * Fully honors scheduled vs unscheduled days.
 */
export function calculateHabitStreakStats(
  habit: Habit,
  completions: HabitCompletion[],
  referenceDateStr: string = getLocalDateString()
): HabitStreakStats {
  const completionDates = new Set(
    completions
      .filter((c) => c.habitId === habit.id && c.date <= referenceDateStr)
      .map((c) => c.date)
  );

  const totalCompletions = completionDates.size;

  // 1. Calculate CURRENT STREAK
  let currentStreak = 0;
  let cursorDate = parseLocalDate(referenceDateStr);

  // Check today's state
  const isTodayScheduled = isHabitScheduledOn(habit, referenceDateStr);
  const isTodayCompleted = completionDates.has(referenceDateStr);

  if (isTodayScheduled && isTodayCompleted) {
    currentStreak++;
    // Move to yesterday to continue checking backwards
    cursorDate = subDays(cursorDate, 1);
  } else if (isTodayScheduled && !isTodayCompleted) {
    // Today is scheduled but not yet completed. The current active streak depends on
    // whether the last scheduled day prior to today was completed.
    cursorDate = subDays(cursorDate, 1);
  } else {
    // Today is not scheduled. Unscheduled days don't break streak; move to yesterday.
    cursorDate = subDays(cursorDate, 1);
  }

  // Walk backwards day by day to count consecutive completed scheduled days
  const createdDateStr = habit.createdAt.split('T')[0];
  let safetyCounter = 0;
  const maxLookbackDays = 1000;

  while (safetyCounter++ < maxLookbackDays) {
    const curDateStr = getLocalDateString(cursorDate);
    if (curDateStr < createdDateStr) {
      break;
    }

    const isScheduled = isHabitScheduledOn(habit, curDateStr);
    if (isScheduled) {
      if (completionDates.has(curDateStr)) {
        currentStreak++;
        cursorDate = subDays(cursorDate, 1);
      } else {
        // Missed scheduled day breaks the streak
        break;
      }
    } else {
      // Unscheduled day: does not break streak, step backwards
      cursorDate = subDays(cursorDate, 1);
    }
  }

  // 2. Calculate LONGEST STREAK
  // Walk forward from creation date up to reference date
  let longestStreak = 0;
  let runningStreak = 0;

  const allDays = getDateRangeList(createdDateStr, referenceDateStr);

  for (const dateStr of allDays) {
    const isScheduled = isHabitScheduledOn(habit, dateStr);
    if (!isScheduled) {
      // Unscheduled days do not break running streak
      continue;
    }

    if (completionDates.has(dateStr)) {
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      // Scheduled day missed: break running streak
      // If date is today, and today isn't completed yet, do not reset runningStreak for longest record
      if (dateStr === referenceDateStr) {
        // Today is not over yet
      } else {
        runningStreak = 0;
      }
    }
  }

  if (runningStreak > longestStreak) {
    longestStreak = runningStreak;
  }
  if (currentStreak > longestStreak) {
    longestStreak = currentStreak;
  }

  // 3. Calculate Completion Rates
  // Last 7 days rate
  const last7Days = Array.from({ length: 7 }, (_, i) =>
    getLocalDateString(subDays(parseLocalDate(referenceDateStr), i))
  ).reverse();

  let weeklyScheduled = 0;
  let weeklyCompleted = 0;
  for (const d of last7Days) {
    if (isHabitScheduledOn(habit, d)) {
      weeklyScheduled++;
      if (completionDates.has(d)) {
        weeklyCompleted++;
      }
    }
  }
  const weeklyCompletionRate =
    weeklyScheduled > 0 ? Math.round((weeklyCompleted / weeklyScheduled) * 100) : 100;

  // Last 30 days rate
  const last30Days = Array.from({ length: 30 }, (_, i) =>
    getLocalDateString(subDays(parseLocalDate(referenceDateStr), i))
  ).reverse();

  let monthlyScheduled = 0;
  let monthlyCompleted = 0;
  for (const d of last30Days) {
    if (isHabitScheduledOn(habit, d)) {
      monthlyScheduled++;
      if (completionDates.has(d)) {
        monthlyCompleted++;
      }
    }
  }
  const monthlyCompletionRate =
    monthlyScheduled > 0 ? Math.round((monthlyCompleted / monthlyScheduled) * 100) : 100;

  // Overall consistency since creation
  let totalScheduled = 0;
  let totalDoneOnScheduled = 0;
  for (const d of allDays) {
    if (isHabitScheduledOn(habit, d)) {
      totalScheduled++;
      if (completionDates.has(d)) {
        totalDoneOnScheduled++;
      }
    }
  }
  const overallConsistency =
    totalScheduled > 0 ? Math.round((totalDoneOnScheduled / totalScheduled) * 100) : 100;

  return {
    currentStreak,
    longestStreak,
    totalCompletions,
    weeklyCompletionRate,
    monthlyCompletionRate,
    overallConsistency,
  };
}
