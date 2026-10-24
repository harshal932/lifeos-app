import React, { useState } from 'react';
import { BookMarked, Plus, Trash2, Edit3, Smile, Calendar } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import type { JournalEntry } from '../../types';
import { saveJournalEntry, deleteJournalEntry } from '../../services/journalService';
import { getLocalDateString, formatDisplayDate } from '../../utils/date';

interface JournalViewProps {
  entries: JournalEntry[];
  onRefresh: () => Promise<void>;
}

const MOODS = [
  { value: 1, label: 'Low', emoji: '😞' },
  { value: 2, label: 'Okay', emoji: '😐' },
  { value: 3, label: 'Good', emoji: '🙂' },
  { value: 4, label: 'Great', emoji: '😄' },
  { value: 5, label: 'Super', emoji: '🚀' },
];

export const JournalView: React.FC<JournalViewProps> = ({ entries, onRefresh }) => {
  const todayStr = getLocalDateString();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>(undefined);

  // Form states
  const [date, setDate] = useState(todayStr);
  const [title, setTitle] = useState('');
  const [reflections, setReflections] = useState('');
  const [goals, setGoals] = useState('');
  const [achievements, setAchievements] = useState('');
  const [lessonsLearned, setLessonsLearned] = useState('');
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleOpenNew = () => {
    setEditingId(undefined);
    setDate(todayStr);
    setTitle('');
    setReflections('');
    setGoals('');
    setAchievements('');
    setLessonsLearned('');
    setMood(3);
    setError('');
    setIsFormOpen(true);
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setDate(entry.date);
    setTitle(entry.title || '');
    setReflections(entry.reflections);
    setGoals(entry.goals || '');
    setAchievements(entry.achievements || '');
    setLessonsLearned(entry.lessonsLearned || '');
    setMood(entry.mood || 3);
    setError('');
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reflections.trim()) {
      setError('Please write at least a brief reflection.');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      await saveJournalEntry({
        id: editingId,
        date,
        title: title.trim() || undefined,
        reflections: reflections.trim(),
        goals: goals.trim() || undefined,
        achievements: achievements.trim() || undefined,
        lessonsLearned: lessonsLearned.trim() || undefined,
        mood,
      });
      setIsFormOpen(false);
      await onRefresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to save journal entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteJournalEntry(id);
    await onRefresh();
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
            <BookMarked className="w-4 h-4 text-primary" />
            Personal Daily Journal
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Reflect on achievements, lessons, and your daily mindset.
          </p>
        </div>

        {!isFormOpen && (
          <Button size="sm" onClick={handleOpenNew}>
            <Plus className="w-4 h-4" />
            Write Entry
          </Button>
        )}
      </div>

      {/* Write / Edit Entry Card */}
      {isFormOpen && (
        <Card className="p-5 border-primary/30 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <h4 className="text-sm font-bold text-foreground">
              {editingId ? 'Edit Journal Entry' : "Today's Reflection"}
            </h4>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="px-2.5 py-1 bg-secondary/60 border border-border rounded-xl text-xs font-semibold text-foreground"
            />
          </div>

          <form onSubmit={handleSave} className="space-y-3.5">
            {error && (
              <div className="p-2.5 text-xs bg-destructive/15 text-destructive rounded-xl">
                {error}
              </div>
            )}

            {/* Mood Selector */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                How are you feeling today?
              </label>
              <div className="flex items-center justify-between gap-1 max-w-sm">
                {MOODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMood(m.value as any)}
                    className={`flex-1 py-2 px-1 rounded-xl text-center border transition-all ${
                      mood === m.value
                        ? 'bg-primary/15 border-primary text-primary font-bold shadow-xs'
                        : 'bg-secondary/40 border-border text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span className="text-xl block">{m.emoji}</span>
                    <span className="text-[10px] mt-0.5 block">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Headline / Title (Optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. A productive study day"
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              />
            </div>

            {/* Reflections */}
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Daily Reflections & Thoughts *
              </label>
              <textarea
                value={reflections}
                onChange={(e) => setReflections(e.target.value)}
                rows={3}
                placeholder="What happened today? How did you spend your time?"
                className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                required
              />
            </div>

            {/* Achievements & Lessons Learned Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Achievements Today
                </label>
                <textarea
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  rows={2}
                  placeholder="What went well?"
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Key Lessons Learned
                </label>
                <textarea
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  rows={2}
                  placeholder="What can be improved?"
                  className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Journal Entry'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Past Entries Timeline */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block px-1">
          Journal History ({entries.length})
        </span>

        {entries.length > 0 ? (
          entries.map((entry) => {
            const moodObj = MOODS.find((m) => m.value === entry.mood);
            return (
              <Card key={entry.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {moodObj && <span className="text-xl">{moodObj.emoji}</span>}
                    <div>
                      <h4 className="text-sm font-bold text-foreground">
                        {entry.title || 'Daily Entry'}
                      </h4>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDisplayDate(entry.date)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(entry)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
                      title="Edit entry"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Delete entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-foreground whitespace-pre-wrap leading-relaxed">
                  {entry.reflections}
                </p>

                {(entry.achievements || entry.lessonsLearned) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-border/40 text-[11px]">
                    {entry.achievements && (
                      <div className="p-2 bg-emerald-500/[0.06] rounded-xl border border-emerald-500/10">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                          Achievements:
                        </span>
                        <p className="text-muted-foreground mt-0.5">{entry.achievements}</p>
                      </div>
                    )}
                    {entry.lessonsLearned && (
                      <div className="p-2 bg-primary/[0.06] rounded-xl border border-primary/10">
                        <span className="font-bold text-primary block">Lessons:</span>
                        <p className="text-muted-foreground mt-0.5">{entry.lessonsLearned}</p>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border/80">
            <BookMarked className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-foreground">No journal reflections yet</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              Writing a short daily reflection clears your mind and helps track personal growth.
            </p>
            <Button size="sm" onClick={handleOpenNew}>
              <Plus className="w-4 h-4" />
              Write First Reflection
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
