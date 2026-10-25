import React from 'react';
import {
  Check,
  Clock,
  Calendar,
  AlertCircle,
  MoreVertical,
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

  // Priority metadata
  const priorityConfig: Record<
    TaskPriority,
    { label: string; bg: string; text: string; border: string; icon?: React.ReactNode }
  > = {
    urgent: {
      label: 'Urgent',
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
      icon: <Flame className="w-3 h-3 text-rose-400 inline mr-0.5" />,
    },
    high: {
      label: 'High',
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    },
    medium: {
      label: 'Medium',
      bg: 'bg-blue-500/15',
      text: 'text-blue-400',
      border: 'border-blue-500/30',
    },
    low: {
      label: 'Low',
      bg: 'bg-slate-500/15',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
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
      className={`group relative rounded-2xl border transition-all duration-200 p-3.5 sm:p-4 flex items-start gap-3 sm:gap-3.5 ${
        task.completed
          ? 'bg-secondary/25 border-border/40 opacity-75'
          : isOverdue
          ? 'bg-rose-500/[0.03] border-rose-500/30 hover:border-rose-500/50 shadow-subtle'
          : 'bg-card/70 hover:bg-card border-border/70 hover:border-border shadow-subtle hover:shadow-card'
      }`}
    >
      {/* Checkbox Button */}
      <button
        type="button"
        onClick={() => onToggle(task.id, !task.completed)}
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-200 active:scale-90 ${
          task.completed
            ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
            : isOverdue
            ? 'border-rose-500/60 hover:bg-rose-500/10'
            : 'border-muted-foreground/40 hover:border-primary hover:bg-primary/10'
        }`}
        aria-label={task.completed ? 'Mark task as incomplete' : 'Mark task as completed'}
      >
        {task.completed && <Check className="w-4 h-4 stroke-[3]" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-sm sm:text-base font-semibold leading-snug break-words transition-all ${
              task.completed
                ? 'line-through text-muted-foreground'
                : 'text-foreground'
            }`}
          >
            {task.title}
          </h4>

          {/* Action buttons (hover or desktop) */}
          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
              title="Edit Task"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 rounded-lg hover:bg-destructive/15 text-muted-foreground hover:text-destructive transition-colors"
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
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 text-[11px] font-medium">
          {/* Priority Badge */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[10.5px] font-semibold ${prio.bg} ${prio.text} ${prio.border}`}
          >
            {prio.icon}
            {prio.label}
          </span>

          {/* Category Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-secondary/70 border border-border/50 text-muted-foreground text-[10.5px]">
            <Tag className="w-3 h-3 opacity-70" />
            {task.category}
          </span>

          {/* Due date Badge */}
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10.5px] font-semibold ${
              isOverdue
                ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                : isToday
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-secondary/60 border-border/50 text-muted-foreground'
            }`}
          >
            {isOverdue ? (
              <AlertCircle className="w-3 h-3 text-rose-400" />
            ) : (
              <Calendar className="w-3 h-3 opacity-70" />
            )}
            {formatDueDateLabel()}
            {task.dueTime && (
              <span className="opacity-80 ml-0.5">@ {task.dueTime}</span>
            )}
            {isOverdue && ' (Overdue)'}
          </span>
        </div>
      </div>
    </div>
  );
};
