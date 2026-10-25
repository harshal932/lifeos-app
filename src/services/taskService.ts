import { db } from '../db';
import type { TaskItem, TaskPriority } from '../types';
import { getLocalDateString } from '../utils/date';

export async function getAllTasks(): Promise<TaskItem[]> {
  const tasks = await db.tasks.toArray();
  // Sort: pending first, then by priority (urgent > high > medium > low), then dueDate, then createdAt
  const priorityOrder: Record<TaskPriority, number> = {
    urgent: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return tasks.sort((a, b) => {
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    const priDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    if (priDiff !== 0) return priDiff;
    if (a.dueDate !== b.dueDate) {
      return a.dueDate.localeCompare(b.dueDate);
    }
    return b.createdAt.localeCompare(a.createdAt);
  });
}

export async function getTasksForDate(dateStr: string): Promise<TaskItem[]> {
  const all = await getAllTasks();
  return all.filter((t) => t.dueDate === dateStr);
}

export async function createTask(
  data: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt' | 'completed' | 'completedAt'> & {
    completed?: boolean;
  }
): Promise<TaskItem> {
  if (!data.title || !data.title.trim()) {
    throw new Error('Task title is required.');
  }
  const dueDate = data.dueDate && /^\d{4}-\d{2}-\d{2}$/.test(data.dueDate)
    ? data.dueDate
    : getLocalDateString();

  const now = new Date().toISOString();
  const newTask: TaskItem = {
    id: crypto.randomUUID(),
    title: data.title.trim(),
    description: data.description?.trim() || undefined,
    dueDate,
    dueTime: data.dueTime || undefined,
    priority: data.priority || 'medium',
    category: data.category?.trim() || 'General',
    completed: data.completed || false,
    completedAt: data.completed ? now : undefined,
    createdAt: now,
    updatedAt: now,
  };

  await db.tasks.add(newTask);
  return newTask;
}

export async function updateTask(
  id: string,
  updates: Partial<Omit<TaskItem, 'id' | 'createdAt'>>
): Promise<void> {
  const existing = await db.tasks.get(id);
  if (!existing) {
    throw new Error(`Task with id ${id} not found.`);
  }

  const now = new Date().toISOString();
  const payload: Partial<TaskItem> = {
    ...updates,
    updatedAt: now,
  };

  if (updates.completed !== undefined) {
    payload.completedAt = updates.completed ? now : undefined;
  }

  await db.tasks.update(id, payload);
}

export async function toggleTask(id: string, completed: boolean): Promise<void> {
  const now = new Date().toISOString();
  await db.tasks.update(id, {
    completed,
    completedAt: completed ? now : undefined,
    updatedAt: now,
  });
}

export async function deleteTask(id: string): Promise<void> {
  await db.tasks.delete(id);
}

export async function clearCompletedTasks(): Promise<void> {
  const completedTasks = await db.tasks.filter((t) => t.completed).toArray();
  const ids = completedTasks.map((t) => t.id);
  await db.tasks.bulkDelete(ids);
}
