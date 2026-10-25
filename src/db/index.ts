import Dexie, { type Table } from 'dexie';
import type {
  Habit,
  HabitCompletion,
  Transaction,
  Budget,
  StudySession,
  JournalEntry,
  AppSettings,
  TaskItem,
} from '../types';

export const DEFAULT_HABIT_CATEGORIES = [
  'Study & Revision',
  'College & Routine',
  'Fitness & Health',
  'Vocab & Reading',
  'Daily Finance',
  'Personal',
  'Other',
];

export const DEFAULT_TASK_CATEGORIES = [
  'Assignments',
  'Exams & Quizzes',
  'Lectures & College',
  'Self Study',
  'Lab & Projects',
  'Daily Chores',
  'General',
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Chai & Snacks',
  'Canteen & Food',
  'Auto & Bus / Metro',
  'Books & Stationery',
  'Xerox & Printout',
  'Hostel & Mess',
  'Recharge & Data',
  'Hangouts & Fun',
  'College & Exam Fees',
  'Courses & Tools',
  'Personal & Health',
  'Other',
];

export const DEFAULT_INCOME_CATEGORIES = [
  'Pocket Money',
  'From Family',
  'Part-Time / Tutoring',
  'Scholarship',
  'Friend Repayment',
  'Gifts',
  'Other',
];

export const DEFAULT_PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Bank Transfer',
  'Other',
];

export const DEFAULT_STUDY_SUBJECTS = [
  'DSA',
  'AI/ML',
  'Computer Networks',
  'DBMS',
  'Operating Systems',
  'Development',
  'Other',
];

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'current',
  theme: 'dark',
  currency: 'INR',
  currencySymbol: '₹',
  weekStartDay: 1, // Monday
  dateFormat: 'dd MMM yyyy',
  savingsGoalPaise: 5000000, // ₹50,000.00
  studySubjects: DEFAULT_STUDY_SUBJECTS,
  habitCategories: DEFAULT_HABIT_CATEGORIES,
  taskCategories: DEFAULT_TASK_CATEGORIES,
  expenseCategories: DEFAULT_EXPENSE_CATEGORIES,
  incomeCategories: DEFAULT_INCOME_CATEGORIES,
  paymentMethods: DEFAULT_PAYMENT_METHODS,
  budgetWarningThresholds: [50, 75, 90, 100],
  holdings: {
    cashPaise: 0,
    shareMarketPaise: 0,
    savedPaise: 0,
    updatedAt: new Date().toISOString(),
  },
  dailyVocabGoal: 5,
};

export class LifeOSDatabase extends Dexie {
  habits!: Table<Habit, string>;
  habitCompletions!: Table<HabitCompletion, string>;
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  tasks!: Table<TaskItem, string>;
  studySessions!: Table<StudySession, string>;
  journalEntries!: Table<JournalEntry, string>;
  settings!: Table<AppSettings, string>;
  vocabProgress!: Table<import('../types').VocabProgress, string>;
  vocabQuizHistory!: Table<import('../types').VocabQuizResult, string>;

  constructor() {
    super('LifeOSDB');

    this.version(1).stores({
      habits: 'id, category, frequency, isArchived, createdAt',
      habitCompletions: 'id, habitId, date, [habitId+date]',
      transactions: 'id, type, category, date, paymentMethod, createdAt',
      budgets: 'id, month',
      studySessions: 'id, subject, date, completed',
      journalEntries: 'id, date',
      settings: 'id',
    });

    this.version(2).stores({
      vocabProgress: 'wordId, status, isBookmarked, introducedDate, nextReviewDate',
      vocabQuizHistory: 'id, date, category, completedAt',
    });

    this.version(3).stores({
      tasks: 'id, dueDate, priority, category, completed, createdAt',
    });

    this.on('populate', async () => {
      await this.settings.put(DEFAULT_SETTINGS);
    });
  }
}

export const db = new LifeOSDatabase();

// Ensure settings exist and include student defaults
export async function initializeDatabase(): Promise<AppSettings> {
  const existing = await db.settings.get('current');
  if (!existing) {
    await db.settings.put(DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  }
  // Ensure student categories are merged
  let needsUpdate = false;
  const updated = { ...existing };

  if (!updated.taskCategories || updated.taskCategories.length === 0 || !updated.taskCategories.includes('Assignments')) {
    updated.taskCategories = Array.from(new Set([...DEFAULT_TASK_CATEGORIES, ...(updated.taskCategories || [])]));
    needsUpdate = true;
  }
  if (!updated.expenseCategories.includes('Chai & Snacks') || !updated.expenseCategories.includes('Canteen & Food')) {
    updated.expenseCategories = Array.from(new Set([...DEFAULT_EXPENSE_CATEGORIES, ...updated.expenseCategories]));
    needsUpdate = true;
  }
  if (!updated.incomeCategories.includes('Pocket Money')) {
    updated.incomeCategories = Array.from(new Set([...DEFAULT_INCOME_CATEGORIES, ...updated.incomeCategories]));
    needsUpdate = true;
  }

  if (needsUpdate) {
    await db.settings.put(updated);
    return updated;
  }
  return existing;
}
