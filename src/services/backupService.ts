import { db } from '../db';
import type { BackupData, Habit, HabitCompletion, Transaction, Budget, StudySession, JournalEntry, AppSettings } from '../types';

export const BACKUP_SCHEMA_VERSION = 1;

/**
 * Generates a full JSON backup of the user's LifeOS data.
 */
export async function exportBackup(): Promise<{ filename: string; jsonString: string }> {
  const [
    habits,
    habitCompletions,
    transactions,
    budgets,
    tasks,
    studySessions,
    journalEntries,
    settings,
    vocabProgress,
    vocabQuizHistory,
  ] = await Promise.all([
    db.habits.toArray(),
    db.habitCompletions.toArray(),
    db.transactions.toArray(),
    db.budgets.toArray(),
    db.tasks.toArray(),
    db.studySessions.toArray(),
    db.journalEntries.toArray(),
    db.settings.get('current'),
    db.vocabProgress.toArray(),
    db.vocabQuizHistory.toArray(),
  ]);

  const backupData: BackupData = {
    version: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    habits,
    habitCompletions,
    transactions,
    budgets,
    tasks,
    studySessions,
    journalEntries,
    settings: settings || ({} as AppSettings),
    vocabProgress,
    vocabQuizHistory,
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `lifeos-backup-${dateStr}.json`;

  return { filename, jsonString };
}

export function triggerDownload(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  summary: {
    habitsCount: number;
    completionsCount: number;
    transactionsCount: number;
    budgetsCount: number;
    studySessionsCount: number;
    journalEntriesCount: number;
  };
  data?: BackupData;
}

/**
 * Validates a parsed JSON backup object before any database write.
 */
export function validateBackupData(raw: unknown): ValidationResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid backup file: not a JSON object.'],
      summary: { habitsCount: 0, completionsCount: 0, transactionsCount: 0, budgetsCount: 0, studySessionsCount: 0, journalEntriesCount: 0 },
    };
  }

  const obj = raw as Partial<BackupData>;

  if (typeof obj.version !== 'number') {
    errors.push('Missing or invalid schema version.');
  }

  if (!Array.isArray(obj.habits)) {
    errors.push('Missing or invalid habits array.');
  }
  if (!Array.isArray(obj.habitCompletions)) {
    errors.push('Missing or invalid habitCompletions array.');
  }
  if (!Array.isArray(obj.transactions)) {
    errors.push('Missing or invalid transactions array.');
  }

  // Validate transaction records
  if (Array.isArray(obj.transactions)) {
    for (let i = 0; i < obj.transactions.length; i++) {
      const tx = obj.transactions[i];
      if (!tx.id || typeof tx.id !== 'string') {
        errors.push(`Transaction at index ${i} has invalid ID.`);
      }
      if (typeof tx.amountPaise !== 'number' || tx.amountPaise <= 0) {
        errors.push(`Transaction ${tx.id || i} has invalid amount: must be positive integer paise.`);
      }
      if (!tx.date || !/^\d{4}-\d{2}-\d{2}$/.test(tx.date)) {
        errors.push(`Transaction ${tx.id || i} has invalid date format.`);
      }
    }
  }

  // Validate habit records
  if (Array.isArray(obj.habits)) {
    for (let i = 0; i < obj.habits.length; i++) {
      const h = obj.habits[i];
      if (!h.id || !h.name || !h.category) {
        errors.push(`Habit at index ${i} is missing required fields (id, name, or category).`);
      }
    }
  }

  const isValid = errors.length === 0;

  return {
    isValid,
    errors,
    summary: {
      habitsCount: obj.habits?.length || 0,
      completionsCount: obj.habitCompletions?.length || 0,
      transactionsCount: obj.transactions?.length || 0,
      budgetsCount: obj.budgets?.length || 0,
      studySessionsCount: obj.studySessions?.length || 0,
      journalEntriesCount: obj.journalEntries?.length || 0,
    },
    data: isValid ? (obj as BackupData) : undefined,
  };
}

/**
 * Restores or merges backup data transactionally into the database.
 */
export async function restoreBackup(
  backup: BackupData,
  mode: 'replace' | 'merge'
): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.habits,
      db.habitCompletions,
      db.transactions,
      db.budgets,
      db.tasks,
      db.studySessions,
      db.journalEntries,
      db.settings,
      db.vocabProgress,
      db.vocabQuizHistory,
    ],
    async () => {
      if (mode === 'replace') {
        await Promise.all([
          db.habits.clear(),
          db.habitCompletions.clear(),
          db.transactions.clear(),
          db.budgets.clear(),
          db.tasks.clear(),
          db.studySessions.clear(),
          db.journalEntries.clear(),
          db.vocabProgress.clear(),
          db.vocabQuizHistory.clear(),
        ]);
      }

      // Add or put habits
      if (backup.habits?.length) {
        await db.habits.bulkPut(backup.habits);
      }

      // Add or put completions
      if (backup.habitCompletions?.length) {
        await db.habitCompletions.bulkPut(backup.habitCompletions);
      }

      // Add or put transactions
      if (backup.transactions?.length) {
        await db.transactions.bulkPut(backup.transactions);
      }

      // Add or put budgets
      if (backup.budgets?.length) {
        await db.budgets.bulkPut(backup.budgets);
      }

      // Add or put tasks
      if (backup.tasks?.length) {
        await db.tasks.bulkPut(backup.tasks);
      }

      // Add or put study sessions
      if (backup.studySessions?.length) {
        await db.studySessions.bulkPut(backup.studySessions);
      }

      // Add or put journal entries
      if (backup.journalEntries?.length) {
        await db.journalEntries.bulkPut(backup.journalEntries);
      }

      // Add or put vocabulary progress
      if (backup.vocabProgress?.length) {
        await db.vocabProgress.bulkPut(backup.vocabProgress);
      }

      // Add or put vocabulary quiz history
      if (backup.vocabQuizHistory?.length) {
        await db.vocabQuizHistory.bulkPut(backup.vocabQuizHistory);
      }

      // Settings
      if (backup.settings && backup.settings.id) {
        await db.settings.put(backup.settings);
      }
    }
  );
}

/**
 * Resets all user data after confirmation.
 */
export async function resetAllData(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.habits,
      db.habitCompletions,
      db.transactions,
      db.budgets,
      db.tasks,
      db.studySessions,
      db.journalEntries,
      db.vocabProgress,
      db.vocabQuizHistory,
    ],
    async () => {
      await Promise.all([
        db.habits.clear(),
        db.habitCompletions.clear(),
        db.transactions.clear(),
        db.budgets.clear(),
        db.tasks.clear(),
        db.studySessions.clear(),
        db.journalEntries.clear(),
        db.vocabProgress.clear(),
        db.vocabQuizHistory.clear(),
      ]);
    }
  );
}
