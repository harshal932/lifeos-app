import { db } from '../db';
import type { JournalEntry } from '../types';
import { getLocalDateString } from '../utils/date';

export async function getAllJournalEntries(): Promise<JournalEntry[]> {
  return db.journalEntries.reverse().sortBy('date');
}

export async function getJournalEntryForDate(dateStr: string = getLocalDateString()): Promise<JournalEntry | undefined> {
  return db.journalEntries.where('date').equals(dateStr).first();
}

export async function saveJournalEntry(
  entryData: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
): Promise<JournalEntry> {
  const now = new Date().toISOString();

  if (entryData.id) {
    const existing = await db.journalEntries.get(entryData.id);
    if (existing) {
      const updated: JournalEntry = {
        ...existing,
        ...entryData,
        id: entryData.id,
        updatedAt: now,
      };
      await db.journalEntries.put(updated);
      return updated;
    }
  }

  // Check if one already exists for this date
  const existingForDate = await db.journalEntries.where('date').equals(entryData.date).first();
  if (existingForDate) {
    const updated: JournalEntry = {
      ...existingForDate,
      ...entryData,
      id: existingForDate.id,
      updatedAt: now,
    };
    await db.journalEntries.put(updated);
    return updated;
  }

  const newEntry: JournalEntry = {
    ...entryData,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  await db.journalEntries.add(newEntry);
  return newEntry;
}

export async function deleteJournalEntry(id: string): Promise<void> {
  await db.journalEntries.delete(id);
}
