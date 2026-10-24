import { db } from '../db';
import type { Habit } from '../types';

export async function loadStarterTemplates(): Promise<void> {
  const starterHabits: Array<Omit<Habit, 'id' | 'createdAt' | 'isArchived'>> = [
    {
      name: 'Study DSA & System Design',
      description: 'Practice algorithms and computer science problem solving.',
      category: 'Study',
      icon: 'book-open',
      color: '#6366f1',
      frequency: 'daily',
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      target: 60,
      targetUnit: 'minutes',
      reminderTime: '19:00',
    },
    {
      name: 'Learn AI / Machine Learning',
      description: 'Study modern deep learning concepts, papers, and implementations.',
      category: 'Study',
      icon: 'sparkles',
      color: '#06b6d4',
      frequency: 'weekdays',
      selectedDays: [1, 2, 3, 4, 5],
      target: 45,
      targetUnit: 'minutes',
      reminderTime: '20:30',
    },
    {
      name: 'Daily Workout or Jogging',
      description: 'Cardio, strength training, or stretching to stay energetic.',
      category: 'Fitness',
      icon: 'dumbbell',
      color: '#10b981',
      frequency: 'daily',
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      target: 30,
      targetUnit: 'minutes',
      reminderTime: '07:00',
    },
    {
      name: 'Review Daily Expenses & Budget',
      description: 'Log all expenses, receipts, and track remaining monthly budget.',
      category: 'Finance',
      icon: 'wallet',
      color: '#f59e0b',
      frequency: 'daily',
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      target: 5,
      targetUnit: 'minutes',
      reminderTime: '21:30',
    },
  ];

  const now = new Date().toISOString();
  for (const h of starterHabits) {
    await db.habits.add({
      ...h,
      id: crypto.randomUUID(),
      createdAt: now,
      isArchived: false,
    });
  }
}
