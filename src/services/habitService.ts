import { db } from '../db';
import type { Habit, HabitCompletion } from '../types';
import { getLocalDateString } from '../utils/date';

export async function getAllHabits(includeArchived = false): Promise<Habit[]> {
  if (includeArchived) {
    return db.habits.toArray();
  }
  return db.habits.filter((h) => !h.isArchived).toArray();
}

export async function createHabit(habitData: Omit<Habit, 'id' | 'createdAt' | 'isArchived'>): Promise<Habit> {
  const newHabit: Habit = {
    ...habitData,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    isArchived: false,
  };
  await db.habits.add(newHabit);
  return newHabit;
}

export async function updateHabit(id: string, updates: Partial<Habit>): Promise<void> {
  await db.habits.update(id, updates);
}

export async function toggleArchiveHabit(id: string, isArchived: boolean): Promise<void> {
  await db.habits.update(id, { isArchived });
}

export async function deleteHabit(id: string, deleteHistory = true): Promise<void> {
  await db.transaction('rw', db.habits, db.habitCompletions, async () => {
    await db.habits.delete(id);
    if (deleteHistory) {
      await db.habitCompletions.where('habitId').equals(id).delete();
    }
  });
}

/**
 * Marks a habit complete for a given calendar date (defaults to today).
 * Prevents accidental duplicate completion on the same calendar day.
 */
export async function completeHabit(
  habitId: string,
  dateStr: string = getLocalDateString(),
  value?: number,
  notes?: string
): Promise<HabitCompletion> {
  return await db.transaction('rw', db.habitCompletions, async () => {
    // Check if completion record already exists for this date
    const existing = await db.habitCompletions
      .where('[habitId+date]')
      .equals([habitId, dateStr])
      .first();

    if (existing) {
      // Update existing if value or notes changed
      const updated = {
        ...existing,
        value: value !== undefined ? value : existing.value,
        notes: notes !== undefined ? notes : existing.notes,
        completedAt: new Date().toISOString(),
      };
      await db.habitCompletions.put(updated);
      return updated;
    }

    const completion: HabitCompletion = {
      id: crypto.randomUUID(),
      habitId,
      date: dateStr,
      completedAt: new Date().toISOString(),
      value,
      notes,
    };

    await db.habitCompletions.add(completion);
    return completion;
  });
}

/**
 * Undoes completion for a habit on a given calendar date.
 */
export async function undoHabitCompletion(
  habitId: string,
  dateStr: string = getLocalDateString()
): Promise<void> {
  await db.habitCompletions
    .where('[habitId+date]')
    .equals([habitId, dateStr])
    .delete();
}

/**
 * Gets completions for a specific date across all habits.
 */
export async function getCompletionsForDate(dateStr: string): Promise<HabitCompletion[]> {
  return db.habitCompletions.where('date').equals(dateStr).toArray();
}

/**
 * Gets all completions for a specific habit.
 */
export async function getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
  return db.habitCompletions.where('habitId').equals(habitId).toArray();
}
