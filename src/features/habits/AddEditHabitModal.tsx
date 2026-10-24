import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import type { Habit } from '../../types';

interface AddEditHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt' | 'isArchived'>) => Promise<void>;
  habitToEdit?: Habit | null;
  categories: string[];
}

const PRESET_COLORS = [
  '#6366f1', // Indigo
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#3b82f6', // Blue
  '#ef4444', // Red
];

const DAYS_OF_WEEK = [
  { day: 0, label: 'S' },
  { day: 1, label: 'M' },
  { day: 2, label: 'T' },
  { day: 3, label: 'W' },
  { day: 4, label: 'T' },
  { day: 5, label: 'F' },
  { day: 6, label: 'S' },
];

export const AddEditHabitModal: React.FC<AddEditHabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  habitToEdit,
  categories,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0] || 'Study');
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [frequency, setFrequency] = useState<'daily' | 'weekdays' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);
  const [target, setTarget] = useState<string>('');
  const [targetUnit, setTargetUnit] = useState('minutes');
  const [reminderTime, setReminderTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (habitToEdit) {
      setName(habitToEdit.name);
      setDescription(habitToEdit.description || '');
      setCategory(habitToEdit.category);
      setColor(habitToEdit.color || PRESET_COLORS[0]);
      setFrequency(habitToEdit.frequency);
      setSelectedDays(habitToEdit.selectedDays || [0, 1, 2, 3, 4, 5, 6]);
      setTarget(habitToEdit.target ? habitToEdit.target.toString() : '');
      setTargetUnit(habitToEdit.targetUnit || 'minutes');
      setReminderTime(habitToEdit.reminderTime || '');
      setNotes(habitToEdit.notes || '');
    } else {
      setName('');
      setDescription('');
      setCategory(categories[0] || 'Study');
      setColor(PRESET_COLORS[0]);
      setFrequency('daily');
      setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
      setTarget('');
      setTargetUnit('minutes');
      setReminderTime('');
      setNotes('');
    }
    setError('');
  }, [habitToEdit, isOpen, categories]);

  const toggleDay = (day: number) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length === 1) return; // Must have at least 1 day
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a habit name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        name: name.trim(),
        description: description.trim() || undefined,
        category,
        icon: 'check',
        color,
        frequency,
        selectedDays: frequency === 'daily' ? [0, 1, 2, 3, 4, 5, 6] : frequency === 'weekdays' ? [1, 2, 3, 4, 5] : selectedDays,
        target: target ? parseFloat(target) : undefined,
        targetUnit: target ? targetUnit.trim() : undefined,
        reminderTime: reminderTime || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save habit');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={habitToEdit ? 'Edit Habit' : 'Create New Habit'}
      description="Track and build consistency for your personal goals."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-destructive/15 text-destructive border border-destructive/20 rounded-xl">
            {error}
          </div>
        )}

        {/* Habit Name */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Habit Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Study DSA for 60 minutes"
            className="w-full px-3.5 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            required
            autoFocus
          />
        </div>

        {/* Category & Color */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Color Theme
            </label>
            <div className="flex items-center gap-1.5 pt-1">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    color === c ? 'scale-125 ring-2 ring-primary ring-offset-2 ring-offset-card' : 'opacity-80'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Schedule Frequency
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['daily', 'weekdays', 'custom'] as const).map((freq) => (
              <button
                key={freq}
                type="button"
                onClick={() => setFrequency(freq)}
                className={`py-2 text-xs font-medium rounded-xl border transition-all ${
                  frequency === freq
                    ? 'bg-primary text-primary-foreground border-primary font-semibold'
                    : 'bg-secondary/40 text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                {freq === 'daily' ? 'Every Day' : freq === 'weekdays' ? 'Weekdays (M-F)' : 'Custom'}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Days (if custom) */}
        {frequency === 'custom' && (
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Select Scheduled Days
            </label>
            <div className="flex items-center justify-between gap-1">
              {DAYS_OF_WEEK.map((d) => {
                const isSelected = selectedDays.includes(d.day);
                return (
                  <button
                    key={d.day}
                    type="button"
                    onClick={() => toggleDay(d.day)}
                    className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-secondary/40 text-muted-foreground border border-border'
                    }`}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Optional Target */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Target Amount (Optional)
            </label>
            <input
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g. 45"
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1.5">
              Target Unit
            </label>
            <input
              type="text"
              value={targetUnit}
              onChange={(e) => setTargetUnit(e.target.value)}
              placeholder="e.g. minutes, pages, reps"
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
            />
          </div>
        </div>

        {/* Description & Reminder */}
        <div>
          <label className="block text-xs font-semibold text-foreground mb-1.5">
            Description or Notes
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Why is this habit important to you?"
            className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : habitToEdit ? 'Save Changes' : 'Create Habit'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
