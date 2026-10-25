import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  ListTodo,
  Calendar,
  AlertCircle,
  Filter,
  CheckCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  X,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { TaskCard } from './TaskCard';
import { AddEditTaskModal } from './AddEditTaskModal';
import type { TaskItem, TaskPriority } from '../../types';
import {
  createTask,
  updateTask,
  toggleTask,
  deleteTask,
  clearCompletedTasks,
} from '../../services/taskService';
import { getLocalDateString } from '../../utils/date';

interface TasksPageProps {
  tasks: TaskItem[];
  categories: string[];
  onRefresh: () => Promise<void>;
}

type TaskTab = 'today' | 'assignments' | 'exams' | 'upcoming' | 'overdue' | 'all' | 'completed';

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  categories,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<TaskTab>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [quickInput, setQuickInput] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [quickCategory, setQuickCategory] = useState<string>('Assignments');
  const [quickWhen, setQuickWhen] = useState<'today' | 'tomorrow'>('today');
  const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const todayStr = getLocalDateString();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);

  // Metrics
  const todayTasks = tasks.filter((t) => t.dueDate === todayStr);
  const todayCompleted = todayTasks.filter((t) => t.completed);
  const overdueTasks = tasks.filter((t) => !t.completed && t.dueDate < todayStr);
  const upcomingTasks = tasks.filter((t) => !t.completed && t.dueDate > todayStr);
  const totalCompleted = tasks.filter((t) => t.completed);

  const assignmentTasks = tasks.filter(
    (t) => !t.completed && (t.category === 'Assignments' || t.category.toLowerCase().includes('assign'))
  );
  const examTasks = tasks.filter(
    (t) =>
      !t.completed &&
      (t.category === 'Exams & Quizzes' ||
        t.category === 'Self Study' ||
        t.category.toLowerCase().includes('exam'))
  );

  const todayProgress =
    todayTasks.length > 0
      ? Math.round((todayCompleted.length / todayTasks.length) * 100)
      : 0;

  // Filter tasks based on activeTab, search, priority, category
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Tab filter
      if (activeTab === 'today') {
        if (task.dueDate !== todayStr) return false;
      } else if (activeTab === 'assignments') {
        if (task.completed || (task.category !== 'Assignments' && !task.category.toLowerCase().includes('assign'))) return false;
      } else if (activeTab === 'exams') {
        if (
          task.completed ||
          (task.category !== 'Exams & Quizzes' &&
            task.category !== 'Self Study' &&
            !task.category.toLowerCase().includes('exam'))
        )
          return false;
      } else if (activeTab === 'upcoming') {
        if (task.dueDate <= todayStr || task.completed) return false;
      } else if (activeTab === 'overdue') {
        if (task.dueDate >= todayStr || task.completed) return false;
      } else if (activeTab === 'completed') {
        if (!task.completed) return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && task.priority !== selectedPriority) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesCat = task.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesCat) return false;
      }

      return true;
    });
  }, [tasks, activeTab, selectedPriority, selectedCategory, searchQuery, todayStr]);

  // Quick Add handler
  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    try {
      setIsSubmittingQuick(true);
      const chosenDate = quickWhen === 'tomorrow' ? tomorrowStr : todayStr;
      const chosenCat =
        quickCategory || (categories.includes('Assignments') ? 'Assignments' : categories[0] || 'General');

      await createTask({
        title: quickInput.trim(),
        dueDate: chosenDate,
        priority: quickPriority,
        category: chosenCat,
      });
      setQuickInput('');
      await onRefresh();
    } catch (err) {
      console.error('Failed to quick add task:', err);
    } finally {
      setIsSubmittingQuick(false);
    }
  };

  const handleToggle = async (taskId: string, completed: boolean) => {
    await toggleTask(taskId, completed);
    await onRefresh();
  };

  const handleDelete = async (taskId: string) => {
    await deleteTask(taskId);
    await onRefresh();
  };

  const handleSaveModal = async (
    data: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
    await onRefresh();
  };

  const handleClearCompleted = async () => {
    if (window.confirm('Are you sure you want to delete all completed tasks?')) {
      await clearCompletedTasks();
      await onRefresh();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <ListTodo className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
              Student To-Do List
              <span className="text-[10px] bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Student Edition
              </span>
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Track assignments, homework deadlines, exam prep, lab submissions, and daily study to-dos.
          </p>
        </div>

        {/* New Task Button */}
        <Button
          variant="primary"
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="shadow-md flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New To-Do</span>
        </Button>
      </div>

      {/* Progress & Quick Stats Card */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 bg-gradient-to-br from-card to-card/70 border-border/70 shadow-subtle">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Today's Progress
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-foreground">{todayProgress}%</span>
            <span className="text-xs text-muted-foreground">
              ({todayCompleted.length}/{todayTasks.length})
            </span>
          </div>
          <div className="w-full bg-secondary/80 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-500"
              style={{ width: `${todayProgress}%` }}
            />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-card/70 border-border/70 shadow-subtle">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Due Today
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-foreground">{todayTasks.length}</span>
            <span className="text-xs text-muted-foreground">to-dos</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium block mt-1">
            {todayCompleted.length} completed
          </span>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-card to-card/70 border-border/70 shadow-subtle">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Assignments
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-2xl font-extrabold text-foreground">{assignmentTasks.length}</span>
            <span className="text-xs text-muted-foreground">pending</span>
          </div>
          <span className="text-[11px] text-primary font-medium block mt-1">
            Lab & Coursework
          </span>
        </Card>

        <Card
          className={`p-4 bg-gradient-to-br from-card to-card/70 border-border/70 shadow-subtle ${
            overdueTasks.length > 0 ? 'border-rose-500/30' : ''
          }`}
        >
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
            Overdue
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span
              className={`text-2xl font-extrabold ${
                overdueTasks.length > 0 ? 'text-rose-400' : 'text-foreground'
              }`}
            >
              {overdueTasks.length}
            </span>
            <span className="text-xs text-muted-foreground">urgent</span>
          </div>
          <span
            className={`text-[11px] font-medium block mt-1 ${
              overdueTasks.length > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {overdueTasks.length > 0 ? 'Needs immediate action' : 'All caught up!'}
          </span>
        </Card>
      </div>

      {/* Quick Add Bar for Students */}
      <Card className="p-3 bg-secondary/30 border-border/70 shadow-subtle">
        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              placeholder="Quick add to-do (e.g. Submit DBMS Assignment, print lab notes)... (Press Enter)"
              className="w-full bg-background/80 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary placeholder:text-muted-foreground/60 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Category selection */}
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="bg-background/80 border border-border rounded-xl px-2.5 py-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="Assignments">Assignments</option>
              <option value="Exams & Quizzes">Exams & Quizzes</option>
              <option value="Lectures & College">Lectures & College</option>
              <option value="Self Study">Self Study</option>
              <option value="Lab & Projects">Lab & Projects</option>
              <option value="Daily Chores">Daily Chores</option>
              <option value="General">General</option>
            </select>

            {/* When selection */}
            <select
              value={quickWhen}
              onChange={(e) => setQuickWhen(e.target.value as 'today' | 'tomorrow')}
              className="bg-background/80 border border-border rounded-xl px-2.5 py-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="today">Due Today</option>
              <option value="tomorrow">Due Tomorrow</option>
            </select>

            {/* Priority quick toggle */}
            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
              className="bg-background/80 border border-border rounded-xl px-2.5 py-2.5 text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingQuick || !quickInput.trim()}
              className="px-4 py-2.5 text-xs font-bold shrink-0"
            >
              <Plus className="w-3.5 h-3.5 mr-1 inline" />
              Add To-Do
            </Button>
          </div>
        </form>
      </Card>

      {/* Tab Navigation & Filters */}
      <div className="space-y-3">
        {/* Primary Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/60">
          {[
            { id: 'today' as const, label: "Today's To-Dos", count: todayTasks.length, alert: false },
            { id: 'assignments' as const, label: 'Assignments', count: assignmentTasks.length, alert: false },
            { id: 'exams' as const, label: 'Exams & Study', count: examTasks.length, alert: false },
            { id: 'upcoming' as const, label: 'Upcoming', count: upcomingTasks.length, alert: false },
            {
              id: 'overdue' as const,
              label: 'Overdue',
              count: overdueTasks.length,
              alert: overdueTasks.length > 0,
            },
            { id: 'all' as const, label: 'All To-Dos', count: tasks.length, alert: false },
            { id: 'completed' as const, label: 'Completed', count: totalCompleted.length, alert: false },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10.5px] px-1.5 py-0.2 rounded-full font-bold ${
                    tab.alert
                      ? 'bg-rose-500/20 text-rose-400'
                      : isActive
                      ? 'bg-primary/20 text-primary'
                      : 'bg-secondary text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filter Bar (Search, Priority, Category) */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[160px]">
            <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-secondary/50 border border-border/70 rounded-xl pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-secondary/50 border border-border/70 rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent Only</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-secondary/50 border border-border/70 rounded-xl px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Clear Completed Action */}
          {activeTab === 'completed' && totalCompleted.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCompleted}
              className="text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border-rose-500/30"
            >
              Clear Completed
            </Button>
          )}
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center bg-card/40 rounded-2xl border border-dashed border-border/70 flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 stroke-[1.8]" />
            </div>
            <h3 className="text-base font-semibold text-foreground">
              {activeTab === 'today'
                ? 'No tasks due today'
                : activeTab === 'overdue'
                ? 'No overdue tasks!'
                : activeTab === 'upcoming'
                ? 'No upcoming tasks'
                : activeTab === 'completed'
                ? 'No completed tasks yet'
                : 'No tasks found'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-xs">
              {activeTab === 'today'
                ? 'You have cleared all tasks for today or haven’t added any yet.'
                : 'Add a new task using the quick add bar above or click New Task.'}
            </p>
            {activeTab === 'today' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingTask(null);
                  setIsModalOpen(true);
                }}
                className="mt-4 text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Add Today's Task
              </Button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={handleToggle}
              onEdit={(t) => {
                setEditingTask(t);
                setIsModalOpen(true);
              }}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Add / Edit Task Modal */}
      <AddEditTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveModal}
        taskToEdit={editingTask}
        categories={categories}
        defaultDate={activeTab === 'today' ? todayStr : undefined}
      />
    </div>
  );
};
