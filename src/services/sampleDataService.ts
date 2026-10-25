import { db } from '../db';
import type { Habit, TaskItem, Transaction, Budget } from '../types';
import { getLocalDateString, getCurrentMonthString } from '../utils/date';

export async function loadStarterTemplates(): Promise<void> {
  const starterHabits: Array<Omit<Habit, 'id' | 'createdAt' | 'isArchived'>> = [
    {
      name: 'Attend College Lectures on Time',
      description: 'Maintain 75%+ attendance in all course subjects.',
      category: 'College & Routine',
      icon: 'graduation-cap',
      color: '#6366f1',
      frequency: 'weekdays',
      selectedDays: [1, 2, 3, 4, 5],
      target: 1,
      targetUnit: 'session',
      reminderTime: '08:30',
    },
    {
      name: 'Self Study & Practice (2 Hours)',
      description: 'Revise lecture notes, solve problem sets, and code.',
      category: 'Study & Revision',
      icon: 'book-open',
      color: '#06b6d4',
      frequency: 'daily',
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      target: 120,
      targetUnit: 'minutes',
      reminderTime: '18:00',
    },
    {
      name: 'English-Marathi Vocabulary Practice',
      description: 'Learn and quiz 5 daily words for competitive exams and interviews.',
      category: 'Vocab & Reading',
      icon: 'sparkles',
      color: '#10b981',
      frequency: 'daily',
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      target: 15,
      targetUnit: 'minutes',
      reminderTime: '21:00',
    },
    {
      name: 'Log Day-to-Day Expenses & Pocket Money',
      description: 'Keep track of canteen, chai, travel, and xerox spending.',
      category: 'Daily Finance',
      icon: 'wallet',
      color: '#f59e0b',
      frequency: 'daily',
      selectedDays: [0, 1, 2, 3, 4, 5, 6],
      target: 5,
      targetUnit: 'minutes',
      reminderTime: '21:30',
    },
  ];

  const todayStr = getLocalDateString();
  const starterTasks: Array<Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      title: 'Submit Lab Journal & Assignment',
      description: 'Get practical experiments verified and signed by professor.',
      dueDate: todayStr,
      dueTime: '14:00',
      priority: 'urgent',
      category: 'Assignments',
      completed: false,
    },
    {
      title: 'Get Lecture Slides Printed & Xeroxed',
      description: 'Print module 3 syllabus and question bank from college reprography.',
      dueDate: todayStr,
      dueTime: '16:30',
      priority: 'high',
      category: 'Lab & Projects',
      completed: false,
    },
    {
      title: 'Revise Unit 2 for Upcoming Mid-term Exam',
      description: 'Review important formulas and previous year questions.',
      dueDate: todayStr,
      dueTime: '19:30',
      priority: 'medium',
      category: 'Exams & Quizzes',
      completed: false,
    },
    {
      title: 'Review Today’s Day-to-Day Expenses',
      description: 'Log UPI transactions and cash spend for canteen and commute.',
      dueDate: todayStr,
      dueTime: '22:00',
      priority: 'low',
      category: 'General',
      completed: false,
    },
  ];

  const starterTransactions: Array<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>> = [
    {
      type: 'expense',
      amountPaise: 1500, // ₹15.00
      category: 'Chai & Snacks',
      date: todayStr,
      time: '09:15',
      paymentMethod: 'UPI',
      description: 'Morning Chai at College Gate',
      notes: 'Quick tea with friends before lecture',
    },
    {
      type: 'expense',
      amountPaise: 6000, // ₹60.00
      category: 'Canteen & Food',
      date: todayStr,
      time: '13:00',
      paymentMethod: 'UPI',
      description: 'College Canteen Lunch',
      notes: 'Thali / Veg meal',
    },
    {
      type: 'expense',
      amountPaise: 2500, // ₹25.00
      category: 'Xerox & Printout',
      date: todayStr,
      time: '15:20',
      paymentMethod: 'Cash',
      description: 'Lab Manual Xerox & Binding',
      notes: 'Unit 3 printouts',
    },
  ];

  const currentMonthStr = getCurrentMonthString();
  const starterBudget: Budget = {
    id: currentMonthStr,
    month: currentMonthStr,
    overallBudgetPaise: 350000, // ₹3,500.00 monthly pocket money / budget
    categoryBudgets: {
      'Canteen & Food': 150000,
      'Chai & Snacks': 40000,
      'Auto & Bus / Metro': 50000,
      'Xerox & Printout': 30000,
      'Books & Stationery': 30000,
      'Recharge & Data': 30000,
      'Hangouts & Fun': 20000,
    },
    warningThresholds: [50, 75, 90, 100],
    updatedAt: new Date().toISOString(),
  };

  const now = new Date().toISOString();
  for (const h of starterHabits) {
    await db.habits.add({
      ...h,
      id: crypto.randomUUID(),
      createdAt: now,
      isArchived: false,
    });
  }

  for (const t of starterTasks) {
    await db.tasks.add({
      ...t,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const tx of starterTransactions) {
    await db.transactions.add({
      ...tx,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    });
  }

  await db.budgets.put(starterBudget);
}

