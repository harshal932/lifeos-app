import React, { useState } from 'react';
import {
  Plus,
  Search,
  CheckCircle2,
  Archive,
  Flame,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { HabitCard } from './HabitCard';
import { AddEditHabitModal } from './AddEditHabitModal';
import { HabitDetailsModal } from './HabitDetailsModal';
import type { Habit, HabitCompletion } from '../../types';
import {
  createHabit,
  updateHabit,
  completeHabit,
  undoHabitCompletion,
  toggleArchiveHabit,
  deleteHabit,
} from '../../services/habitService';
import { getLocalDateString } from '../../utils/date';
import { calculateHabitStreakStats, isHabitScheduledOn } from '../../utils/streaks';
import { subDays } from 'date-fns';

interface HabitsPageProps {
  habits: Habit[];
  completions: HabitCompletion[];
  categories: string[];
  onRefresh: () => Promise<void>;
}

type HabitsTab = 'today' | 'weekly' | 'archived';

export const HabitsPage: React.FC<HabitsPageProps> = ({
  habits,
  completions,
  categories,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<HabitsTab>('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabitDetails, setSelectedHabitDetails] = useState<Habit | null>(null);

  const today = new Date();
  const todayStr = getLocalDateString(today);

  // Active & Archived habits
  const activeHabits = habits.filter((h) => !h.isArchived);
  const archivedHabits = habits.filter((h) => h.isArchived);

  // Base list based on tab
  const baseHabits = activeTab === 'archived' ? archivedHabits : activeHabits;

  // Filtered habits
  const filteredHabits = baseHabits.filter((h) => {
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return (
        h.name.toLowerCase().includes(query) ||
        (h.description && h.description.toLowerCase().includes(query)) ||
        h.category.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Calculate today's summary stats
  const scheduledTodayHabits = activeHabits.filter((h) => isHabitScheduledOn(h, todayStr));
  const completedTodayCount = scheduledTodayHabits.filter((h) =>
    completions.some((c) => c.habitId === h.id && c.date === todayStr)
  ).length;
  const completionPercent =
    scheduledTodayHabits.length > 0
      ? Math.round((completedTodayCount / scheduledTodayHabits.length) * 100)
      : 0;

  // Last 7 days for weekly matrix
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(today, 6 - i);
    const dateStr = getLocalDateString(d);
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
    const dayLetter = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][d.getDay()];
    return {
      dateStr,
      dayName,
      dayLetter,
      dayNumber: d.getDate(),
      isToday: dateStr === todayStr,
    };
  });

  // Handlers
  const handleToggleComplete = async (habitId: string, isCompleted: boolean) => {
    if (isCompleted) {
      await completeHabit(habitId, todayStr);
    } else {
      await undoHabitCompletion(habitId, todayStr);
    }
    await onRefresh();
  };

  const handleToggleCompleteOnDate = async (habitId: string, dateStr: string, isCompleted: boolean) => {
    if (isCompleted) {
      await completeHabit(habitId, dateStr);
    } else {
      await undoHabitCompletion(habitId, dateStr);
    }
    await onRefresh();
  };

  const handleSaveHabit = async (habitData: Omit<Habit, 'id' | 'createdAt' | 'isArchived'>) => {
    if (editingHabit) {
      await updateHabit(editingHabit.id, habitData);
    } else {
      await createHabit(habitData);
    }
    await onRefresh();
  };

  const handleArchive = async (habitId: string, isArchived: boolean) => {
    await toggleArchiveHabit(habitId, isArchived);
    await onRefresh();
  };

  const handleDelete = async (habitId: string, deleteHistory: boolean) => {
    await deleteHabit(habitId, deleteHistory);
    await onRefresh();
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/50">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Habit Tracker
            </h1>
            <span className="text-[10px] bg-secondary text-muted-foreground border border-border/60 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
              Student
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Build unshakeable daily consistency and monitor your routine streaks.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingHabit(null);
            setIsAddModalOpen(true);
          }}
          className="self-start sm:self-auto text-xs font-semibold"
        >
          <Plus className="w-3.5 h-3.5 mr-1 stroke-[2.5]" />
          New Habit
        </Button>
      </div>

      {/* Hero Progress Banner */}
      {activeHabits.length > 0 && activeTab !== 'archived' && (
        <Card className="p-4 border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block">
              Today's Completion
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-foreground tracking-tight">
                {completedTodayCount}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                of {scheduledTodayHabits.length} routines completed today
              </span>
            </div>
            <div className="w-full max-w-md h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-border/40 pt-2 sm:pt-0">
            <span className="text-2xl font-bold text-emerald-400 tracking-tight">
              {completionPercent}%
            </span>
            <span className="text-[11px] text-muted-foreground">Overall Goal</span>
          </div>
        </Card>
      )}

      {/* View Switcher Tabs & Search */}
      <div className="space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          {/* Sub-tabs */}
          <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg border border-border/60 self-start">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'today'
                  ? 'bg-card text-foreground font-semibold shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Today's View ({activeHabits.length})
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'weekly'
                  ? 'bg-card text-foreground font-semibold shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Weekly Matrix
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'archived'
                  ? 'bg-card text-foreground font-semibold shadow-subtle'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Archived ({archivedHabits.length})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full pl-8 pr-3 py-1.5 bg-card border border-border/60 rounded-lg text-xs text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-secondary text-foreground font-semibold border border-border/80'
                  : 'bg-card text-muted-foreground hover:text-foreground border border-border/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1. TODAY'S HABITS VIEW */}
      {/* ======================================================== */}
      {activeTab === 'today' && (
        <div className="space-y-3">
          {filteredHabits.length > 0 ? (
            filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completions={completions}
                onToggleComplete={handleToggleComplete}
                onOpenDetails={(h) => setSelectedHabitDetails(h)}
              />
            ))
          ) : (
            <div className="p-10 text-center bg-card rounded-3xl border border-dashed border-border/80 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-muted-foreground/30 mx-auto" />
              <div>
                <h4 className="text-base font-bold text-foreground">
                  {searchQuery ? 'No habits match your search' : 'No active habits'}
                </h4>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  {searchQuery
                    ? 'Try clearing the search query or category filter.'
                    : 'Start building daily discipline by creating your first habit.'}
                </p>
              </div>
              {!searchQuery && (
                <Button
                  size="sm"
                  onClick={() => {
                    setEditingHabit(null);
                    setIsAddModalOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" /> Create First Habit
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. WEEKLY MATRIX VIEW (Weekly consistency & 1-tap checks) */}
      {/* ======================================================== */}
      {activeTab === 'weekly' && (
        <Card className="p-4 sm:p-6 space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between pb-2 border-b border-border/40">
            <div>
              <h3 className="text-base font-bold text-foreground">Weekly Completion Matrix</h3>
              <p className="text-xs text-muted-foreground">
                Tap any day circle to toggle completion directly for that date.
              </p>
            </div>
          </div>

          {filteredHabits.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">No active habits found.</p>
          ) : (
            <div className="min-w-[500px] space-y-3">
              {/* Matrix Header Row: Days */}
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-muted-foreground px-2">
                <span className="col-span-5">Habit</span>
                <div className="col-span-7 grid grid-cols-7 gap-1 text-center">
                  {weekDays.map((d, i) => (
                    <div
                      key={i}
                      className={`p-1 rounded-lg ${
                        d.isToday ? 'bg-primary/10 text-primary font-bold' : ''
                      }`}
                    >
                      <span className="block text-[11px]">{d.dayLetter}</span>
                      <span className="block text-[10px] font-mono opacity-70">{d.dayNumber}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Habit Rows */}
              {filteredHabits.map((habit) => (
                <div
                  key={habit.id}
                  className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-border/50 transition-colors"
                >
                  <div
                    onClick={() => setSelectedHabitDetails(habit)}
                    className="col-span-5 flex items-center gap-2.5 cursor-pointer min-w-0"
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0 font-bold text-xs"
                      style={{ backgroundColor: habit.color || '#6366f1' }}
                    >
                      {habit.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-foreground truncate hover:text-primary">
                      {habit.name}
                    </span>
                  </div>

                  <div className="col-span-7 grid grid-cols-7 gap-1 text-center">
                    {weekDays.map((d, i) => {
                      const isDone = completions.some(
                        (c) => c.habitId === habit.id && c.date === d.dateStr
                      );
                      const isSched = isHabitScheduledOn(habit, d.dateStr);

                      return (
                        <button
                          key={i}
                          onClick={() => handleToggleCompleteOnDate(habit.id, d.dateStr, !isDone)}
                          title={`${habit.name} on ${d.dateStr}: ${isDone ? 'Completed' : 'Not done'}`}
                          className={`w-7 h-7 mx-auto rounded-xl flex items-center justify-center text-xs font-bold transition-all active:scale-90 ${
                            isDone
                              ? 'bg-emerald-500 text-white shadow-xs'
                              : isSched
                              ? 'border border-border hover:border-emerald-500 text-transparent'
                              : 'bg-muted/40 text-muted-foreground/30'
                          }`}
                        >
                          {isDone ? '✓' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ======================================================== */}
      {/* 3. ARCHIVED HABITS VIEW */}
      {/* ======================================================== */}
      {activeTab === 'archived' && (
        <div className="space-y-3">
          {filteredHabits.length > 0 ? (
            filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completions={completions}
                onToggleComplete={handleToggleComplete}
                onOpenDetails={(h) => setSelectedHabitDetails(h)}
              />
            ))
          ) : (
            <div className="p-8 text-center bg-card rounded-3xl border border-dashed border-border/80">
              <Archive className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-foreground">No archived habits</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Completed or retired habits can be archived to keep your active list focused.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Add / Edit Modal */}
      <AddEditHabitModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingHabit(null);
        }}
        onSave={handleSaveHabit}
        habitToEdit={editingHabit}
        categories={categories}
      />

      {/* Habit Details Modal */}
      <HabitDetailsModal
        isOpen={!!selectedHabitDetails}
        onClose={() => setSelectedHabitDetails(null)}
        habit={selectedHabitDetails}
        completions={completions}
        onToggleCompleteOnDate={handleToggleCompleteOnDate}
        onEdit={(h) => {
          setSelectedHabitDetails(null);
          setEditingHabit(h);
          setIsAddModalOpen(true);
        }}
        onArchive={handleArchive}
        onDelete={handleDelete}
      />
    </div>
  );
};
