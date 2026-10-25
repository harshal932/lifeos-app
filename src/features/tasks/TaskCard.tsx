import React from 'react';
import {
  Check,
  Calendar,
  AlertCircle,
  Pencil,
  Trash2,
  Flame,
  Tag,
} from 'lucide-react';
import type { TaskItem, TaskPriority } from '../../types';
import { formatDisplayDate, getLocalDateString } from '../../utils/date';

interface TaskCardProps {
  task: TaskItem;
  onToggle: (taskId: string, completed: boolean) => void;
  onEdit: (task: TaskItem) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onToggle,
  onEdit,
  onDelete,
}) => {
  const todayStr = getLocalDateString();
  const isOverdue = !task.completed && task.dueDate < todayStr;
  const isToday = task.dueDate === todayStr;

  // Priority metadata with restrained styling
  const priorityConfig: Record<
    TaskPriority,
    { label: string; bg: string; text: string; border: string; icon?: React.ReactNode }
  > = {
    urgent: {
      label: 'Urgent',
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/25',
      icon: <Flame className="w-3 h-3 text-rose-400 inline mr-0.5" />,
    },
    high: {
      label: 'High',
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/25',
    },
    medium: {
      label: 'Medium',
      bg: 'bg-secondary',
      text: 'text-muted-foreground',
      border: 'border-border/60',
    },
    low: {
      label: 'Low',
      bg: 'bg-secondary/40',
      text: 'text-muted-foreground/80',
      border: 'border-border/40',
    },
  };

  const prio = priorityConfig[task.priority] || priorityConfig.medium;

  const formatDueDateLabel = () => {
    if (isToday) return 'Today';
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (task.dueDate === getLocalDateString(tomorrow)) return 'Tomorrow';
    return formatDisplayDate(task.dueDate, 'dd MMM');
  };

  return (
    <div
      className={`group relative rounded-xl border transition-all duration-150 p-3 sm:p-3.5 flex items-start gap-3 ${
        task.completed
          ? 'bg-secondary/20 border-border/40 opacity-70'
          : isOverdue
          ? 'bg-rose-500/[0.02] border-rose-500/30 hover:border-rose-500/50 shadow-subtle'
          : 'bg-card border-border/70 hover:border-border shadow-subtle'
      }`}
    >
      {/* Checkbox Button */}
      <button
        type="button"
        onClick={() => onToggle(task.id, !task.completed)}
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border flex items-center justify-center transition-colors active:scale-95 ${
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-subtle'
            : isOverdue
            ? 'border-rose-500/60 hover:bg-rose-500/10'
            : 'border-muted-foreground/40 hover:border-primary hover:bg-primary/5'
        }`}
        aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
      >
        {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-xs sm:text-sm font-semibold leading-snug break-words transition-colors ${
              task.completed
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
            }`}
          >
            {task.title}
          </h4>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Edit Task"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Task description */}
        {task.description && (
          <p
            className={`text-xs mt-1 leading-relaxed line-clamp-2 ${
              task.completed ? 'text-muted-foreground/60' : 'text-muted-foreground'
            }`}
          >
            {task.description}
          </p>
        )}

        {/* Metadata badges row */}
        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[10.5px] font-medium">
          {/* Priority Badge */}
          <span
            className={`inline-flex items-center px-1.5 py-0.2 rounded border text-[10px] font-semibold ${prio.bg} ${prio.text} ${prio.border}`}
          >
            {prio.icon}
            {prio.label}
          </span>

          {/* Category Badge */}
          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-secondary border border-border/50 text-muted-foreground text-[10px]">
            <Tag className="w-2.5 h-2.5 opacity-70" />
            {task.category}
          </span>

          {/* Due date Badge */}
          <span
            className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded border text-[10px] font-medium ${
              isOverdue
                ? 'bg-rose-500/10 border-rose-500/25 text-rose-400 font-semibold'
                : isToday
                ? 'bg-primary/10 border-primary/20 text-primary'
                : 'bg-secondary border-border/50 text-muted-foreground'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-2.5 h-2.5 text-rose-400" />
            ) : (
              <Calendar className="w-2.5 h-2.5 opacity-70" />
            )}
            {formatDueDateLabel()}
            {task.dueTime && <span>• {task.dueTime}</span>}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>
      </div>
    </div>
  );
};
