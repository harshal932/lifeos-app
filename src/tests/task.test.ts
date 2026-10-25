import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../db';
import {
  createTask,
  getAllTasks,
  getTasksForDate,
  toggleTask,
  updateTask,
  deleteTask,
} from '../services/taskService';

describe('Task Service', () => {
  beforeEach(async () => {
    await db.tasks.clear();
  });

  it('creates and retrieves a new task', async () => {
    const task = await createTask({
      title: 'Complete project report',
      description: 'Prepare finance summary and milestones',
      dueDate: '2026-10-25',
      priority: 'high',
      category: 'Work',
    });

    expect(task.id).toBeDefined();
    expect(task.title).toBe('Complete project report');
    expect(task.priority).toBe('high');
    expect(task.completed).toBe(false);

    const all = await getAllTasks();
    expect(all.length).toBe(1);
    expect(all[0].id).toBe(task.id);
  });

  it('throws error when creating task without title', async () => {
    await expect(
      createTask({
        title: '   ',
        dueDate: '2026-10-25',
        priority: 'medium',
        category: 'General',
      })
    ).rejects.toThrow('Task title is required.');
  });

  it('filters tasks by due date', async () => {
    await createTask({
      title: 'Task for 25th',
      dueDate: '2026-10-25',
      priority: 'medium',
      category: 'Work',
    });
    await createTask({
      title: 'Task for 26th',
      dueDate: '2026-10-26',
      priority: 'low',
      category: 'Personal',
    });

    const for25 = await getTasksForDate('2026-10-25');
    expect(for25.length).toBe(1);
    expect(for25[0].title).toBe('Task for 25th');
  });

  it('toggles task completion and updates timestamps', async () => {
    const task = await createTask({
      title: 'Buy groceries',
      dueDate: '2026-10-25',
      priority: 'urgent',
      category: 'Errands',
    });

    await toggleTask(task.id, true);
    const updated = await db.tasks.get(task.id);
    expect(updated?.completed).toBe(true);
    expect(updated?.completedAt).toBeDefined();

    await toggleTask(task.id, false);
    const uncompleted = await db.tasks.get(task.id);
    expect(uncompleted?.completed).toBe(false);
    expect(uncompleted?.completedAt).toBeUndefined();
  });

  it('updates task fields and deletes task', async () => {
    const task = await createTask({
      title: 'Workout session',
      dueDate: '2026-10-25',
      priority: 'medium',
      category: 'Health',
    });

    await updateTask(task.id, { title: 'Intense Workout session', priority: 'high' });
    let current = await db.tasks.get(task.id);
    expect(current?.title).toBe('Intense Workout session');
    expect(current?.priority).toBe('high');

    await deleteTask(task.id);
    current = await db.tasks.get(task.id);
    expect(current).toBeUndefined();
  });
});
