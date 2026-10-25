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
  X,
  ChevronDown,
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
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Area */}
      <section className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              To-Do List
            </h1>
            <span className="text-[10px] bg-secondary text-muted-foreground border border-border/60 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
              Student
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Organize assignments, exams, homework deadlines, and daily revision.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingTask(null);
            setIsModalOpen(true);
          }}
          className="self-start sm:self-auto text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
          New To-Do
        </Button>
      </section>

      {/* Unified Task Metrics Strip (No repetitive box cards) */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-3 rounded-xl bg-card border border-border/70">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Today's Progress
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-foreground">{todayProgress}%</span>
            <span className="text-[11px] text-muted-foreground">
              ({todayCompleted.length}/{todayTasks.length})
            </span>
          </div>
          <div className="w-full bg-secondary h-1 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${todayProgress}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border/70">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Due Today
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-foreground">{todayTasks.length}</span>
            <span className="text-[11px] text-muted-foreground">tasks</span>
          </div>
          <span className="text-[10.5px] text-emerald-400 font-medium block mt-0.5">
            {todayCompleted.length} completed
          </span>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border/70">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Assignments
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl font-bold text-foreground">{assignmentTasks.length}</span>
            <span className="text-[11px] text-muted-foreground">pending</span>
          </div>
          <span className="text-[10.5px] text-muted-foreground font-medium block mt-0.5">
            Lab & coursework
          </span>
        </div>

        <div
          className={`p-3 rounded-xl bg-card border ${
            overdueTasks.length > 0 ? 'border-rose-500/40 bg-rose-500/[0.02]' : 'border-border/70'
          }`}
        >
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
            Overdue
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-xl font-bold ${
                overdueTasks.length > 0 ? 'text-rose-400' : 'text-foreground'
              }`}
            >
              {overdueTasks.length}
            </span>
            <span className="text-[11px] text-muted-foreground">urgent</span>
          </div>
          <span
            className={`text-[10.5px] font-medium block mt-0.5 ${
              overdueTasks.length > 0 ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            {overdueTasks.length > 0 ? 'Needs attention' : 'All caught up!'}
          </span>
        </div>
      </section>

      {/* Streamlined Quick Task Input */}
      <section className="p-2.5 sm:p-3 rounded-xl bg-card border border-border/70 shadow-subtle">
        <form onSubmit={handleQuickAdd} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <input
            type="text"
            value={quickInput}
            onChange={(e) => setQuickInput(e.target.value)}
            placeholder="Add a task (e.g. Submit DBMS Assignment, print lab notes)... (Press Enter)"
            className="flex-1 bg-secondary/40 border border-border/60 rounded-lg px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/60 transition-colors"
          />

          <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
            <select
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="bg-secondary/40 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
            >
              <option value="Assignments">Assignments</option>
              <option value="Exams & Quizzes">Exams & Quizzes</option>
              <option value="Lectures & College">Lectures</option>
              <option value="Self Study">Self Study</option>
              <option value="Lab & Projects">Lab & Projects</option>
              <option value="Daily Chores">Chores</option>
              <option value="General">General</option>
            </select>

            <select
              value={quickWhen}
              onChange={(e) => setQuickWhen(e.target.value as 'today' | 'tomorrow')}
              className="bg-secondary/40 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
            >
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
            </select>

            <select
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
              className="bg-secondary/40 border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingQuick || !quickInput.trim()}
              className="h-8.5 px-3 text-xs font-semibold shrink-0"
            >
              <Plus className="w-3.5 h-3.5 mr-0.5 inline" />
              Add
            </Button>
          </div>
        </form>
      </section>

      {/* Tabs and Filters */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-border/50">
          <div className="flex items-center gap-1 shrink-0">
            {[
              { id: 'today' as const, label: "Today", count: todayTasks.length },
              { id: 'assignments' as const, label: 'Assignments', count: assignmentTasks.length },
              { id: 'exams' as const, label: 'Exams', count: examTasks.length },
              { id: 'upcoming' as const, label: 'Upcoming', count: upcomingTasks.length },
              {
                id: 'overdue' as const,
                label: 'Overdue',
                count: overdueTasks.length,
                isDanger: overdueTasks.length > 0,
              },
              { id: 'all' as const, label: 'All', count: tasks.length },
              { id: 'completed' as const, label: 'Done', count: totalCompleted.length },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-secondary text-foreground font-semibold border border-border/70'
                      : tab.isDanger
                      ? 'text-rose-400 hover:bg-rose-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive
                        ? 'bg-primary/15 text-primary'
                        : tab.isDanger
                        ? 'bg-rose-500/15 text-rose-400'
                        : 'bg-secondary text-muted-foreground'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeTab === 'completed' && totalCompleted.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearCompleted}
              className="text-xs h-7 text-rose-400 border-rose-500/30 hover:bg-rose-500/10 shrink-0"
            >
              Clear Done
            </Button>
          )}
        </div>

        {/* Search & Extra Filters Bar */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-card border border-border/60 rounded-lg pl-8 pr-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary placeholder:text-muted-foreground/60 transition-colors"
            />
          </div>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-card border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-card border border-border/60 rounded-lg px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:border-primary cursor-pointer font-medium"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Task List */}
      <section className="space-y-2">
        {filteredTasks.length > 0 ? (
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
        ) : (
          <div className="p-8 rounded-xl bg-card border border-border/60 text-center flex flex-col items-center justify-center">
            <ListTodo className="w-8 h-8 text-muted-foreground/30 mb-2" />
            <h4 className="text-sm font-semibold text-foreground">No tasks found</h4>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-sm">
              {searchQuery
                ? `No tasks matching "${searchQuery}" in this view.`
                : activeTab === 'today'
                ? "You have no tasks due today. All caught up!"
                : activeTab === 'overdue'
                ? 'Great job! You have zero overdue tasks.'
                : 'No tasks in this category yet. Add one above!'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
              }}
              className="mt-3.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Add Task
            </Button>
          </div>
        )}
      </section>

      {/* Add / Edit Task Modal */}
      <AddEditTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSave={handleSaveModal}
        taskToEdit={editingTask || undefined}
        categories={categories}
      />
    </div>
  );
};
