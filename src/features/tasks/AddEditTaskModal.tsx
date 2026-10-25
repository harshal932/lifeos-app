import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';
import type { TaskItem, TaskPriority } from '../../types';
import { getLocalDateString } from '../../utils/date';
import { Flag, AlertCircle, Calendar, Clock, Tag } from 'lucide-react';

interface AddEditTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  taskToEdit?: TaskItem | null;
  categories: string[];
  defaultDate?: string;
}

export const AddEditTaskModal: React.FC<AddEditTaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  categories,
  defaultDate,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(defaultDate || getLocalDateString());
  const [dueTime, setDueTime] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState(categories[0] || 'General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setDueDate(taskToEdit.dueDate || getLocalDateString());
      setDueTime(taskToEdit.dueTime || '');
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category || categories[0] || 'General');
    } else {
      setTitle('');
      setDescription('');
      setDueDate(defaultDate || getLocalDateString());
      setDueTime('');
      setPriority('medium');
      setCategory(categories[0] || 'General');
    }
    setError('');
  }, [taskToEdit, isOpen, defaultDate, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError('');
      await onSave({
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDate || getLocalDateString(),
        dueTime: dueTime || undefined,
        priority,
        category: category || 'General',
        completed: taskToEdit ? taskToEdit.completed : false,
        completedAt: taskToEdit ? taskToEdit.completedAt : undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const priorityOptions: Array<{ id: TaskPriority; label: string; color: string }> = [
    { id: 'low', label: 'Low', color: 'border-slate-500/30 text-slate-400' },
    { id: 'medium', label: 'Medium', color: 'border-blue-500/40 text-blue-400' },
    { id: 'high', label: 'High', color: 'border-amber-500/50 text-amber-400' },
    { id: 'urgent', label: 'Urgent', color: 'border-rose-500/60 text-rose-400' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit To-Do' : 'Add New To-Do'}
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1">
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-xl text-destructive text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            To-Do Title *
          </label>
          <input
            type="text"
            required
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Submit DBMS Assignment, print lab report..."
            className="w-full bg-secondary/60 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Flag className="w-3.5 h-3.5" />
            Priority Level
          </label>
          <div className="grid grid-cols-4 gap-2">
            {priorityOptions.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setPriority(opt.id)}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                  priority === opt.id
                    ? 'bg-primary/20 border-primary text-primary shadow-sm font-bold scale-[1.02]'
                    : `bg-secondary/40 border-border/60 hover:bg-secondary/80 ${opt.color}`
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date & Time */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Due Date
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Due Time (Optional)
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5" />
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-secondary/60 border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-popover text-popover-foreground">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Description / Notes */}
        <div>
          <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            Notes / Details (Optional)
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any extra links, checklists, or steps..."
            className="w-full bg-secondary/60 border border-border rounded-xl px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all placeholder:text-muted-foreground/60 resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : taskToEdit ? 'Save Changes' : 'Create To-Do'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
