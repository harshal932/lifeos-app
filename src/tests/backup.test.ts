import { describe, it, expect } from 'vitest';
import { validateBackupData } from '../services/backupService';

describe('Backup Validation', () => {
  it('validates a clean, correct backup payload', () => {
    const validPayload = {
      version: 1,
      exportedAt: '2026-10-24T12:00:00.000Z',
      habits: [
        {
          id: 'h1',
          name: 'Exercise',
          category: 'Fitness',
          icon: 'dumbbell',
          color: '#10b981',
          frequency: 'daily',
          selectedDays: [0, 1, 2, 3, 4, 5, 6],
          createdAt: '2026-10-01T00:00:00Z',
          isArchived: false,
        },
      ],
      habitCompletions: [
        {
          id: 'c1',
          habitId: 'h1',
          date: '2026-10-24',
          completedAt: '2026-10-24T08:00:00Z',
        },
      ],
      transactions: [
        {
          id: 't1',
          type: 'expense',
          amountPaise: 45000,
          category: 'Food',
          date: '2026-10-24',
          paymentMethod: 'UPI',
          description: 'Lunch',
          createdAt: '2026-10-24T12:00:00Z',
          updatedAt: '2026-10-24T12:00:00Z',
        },
      ],
      budgets: [],
      studySessions: [],
      journalEntries: [],
      settings: { id: 'current' },
    };

    const result = validateBackupData(validPayload);
    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
    expect(result.summary.habitsCount).toBe(1);
    expect(result.summary.transactionsCount).toBe(1);
  });

  it('rejects backup with invalid transaction amounts or malformed dates', () => {
    const invalidPayload = {
      version: 1,
      habits: [],
      habitCompletions: [],
      transactions: [
        {
          id: 't1',
          type: 'expense',
          amountPaise: -500, // Invalid negative amount
          category: 'Food',
          date: 'not-a-date', // Invalid date
        },
      ],
    };

    const result = validateBackupData(invalidPayload);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('rejects non-object or missing schema payloads', () => {
    expect(validateBackupData(null).isValid).toBe(false);
    expect(validateBackupData('hello world').isValid).toBe(false);
    expect(validateBackupData({}).isValid).toBe(false);
  });
});
