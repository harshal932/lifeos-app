import { db } from '../db';
import type { StudySession } from '../types';
import { getLocalDateString } from '../utils/date';

export async function getAllStudySessions(): Promise<StudySession[]> {
  return db.studySessions.reverse().sortBy('date');
}

export async function getStudySessionsForDate(dateStr: string): Promise<StudySession[]> {
  return db.studySessions.where('date').equals(dateStr).toArray();
}

export async function saveStudySession(session: Omit<StudySession, 'id'>): Promise<StudySession> {
  const newSession: StudySession = {
    ...session,
    id: crypto.randomUUID(),
  };
  await db.studySessions.add(newSession);
  return newSession;
}

export async function deleteStudySession(id: string): Promise<void> {
  await db.studySessions.delete(id);
}

export interface StudySummary {
  todaySeconds: number;
  thisWeekSeconds: number;
  thisMonthSeconds: number;
  subjectBreakdown: Record<string, number>; // subject -> seconds
}

export async function getStudyStats(referenceDateStr: string = getLocalDateString()): Promise<StudySummary> {
  const allSessions = await db.studySessions.where('completed').equals(1).toArray();
  // Also handle boolean in memory just in case indexedDB stores boolean
  const completedSessions = (await db.studySessions.toArray()).filter((s) => s.completed);

  const monthPrefix = referenceDateStr.substring(0, 7); // YYYY-MM

  let todaySeconds = 0;
  let thisMonthSeconds = 0;
  const subjectBreakdown: Record<string, number> = {};

  for (const s of completedSessions) {
    if (s.date === referenceDateStr) {
      todaySeconds += s.durationSeconds;
    }
    if (s.date.startsWith(monthPrefix)) {
      thisMonthSeconds += s.durationSeconds;
      subjectBreakdown[s.subject] = (subjectBreakdown[s.subject] || 0) + s.durationSeconds;
    }
  }

  // Last 7 days
  const last7DaysPrefix = new Date(new Date().setDate(new Date().getDate() - 7))
    .toISOString()
    .split('T')[0];
  let thisWeekSeconds = 0;
  for (const s of completedSessions) {
    if (s.date >= last7DaysPrefix && s.date <= referenceDateStr) {
      thisWeekSeconds += s.durationSeconds;
    }
  }

  return {
    todaySeconds,
    thisWeekSeconds,
    thisMonthSeconds,
    subjectBreakdown,
  };
}
