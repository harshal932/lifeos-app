import React, { useState } from 'react';
import { Plus, Search, CheckCircle2, Archive, Flame } from 'lucide-react';
import { Button } from '../../components/common/Button';
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

interface HabitsPageProps {
  habits: Habit[];
  completions: HabitCompletion[];
  categories: string[];
  onRefresh: () => Promise<void>;
}

export const HabitsPage: React.FC<HabitsPageProps> = ({
  habits,
  completions,
  categories,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [selectedHabitDetails, setSelectedHabitDetails] = useState<Habit | null>(null);

  const todayStr = getLocalDateString();

  // Filtered habits
  const filteredHabits = habits
    .filter((h) => (activeTab === 'active' ? !h.isArchived : h.isArchived))
    .filter((h) => {
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
  const activeHabits = habits.filter((h) => !h.isArchived);
  const scheduledTodayHabits = activeHabits.filter((h) => isHabitScheduledOn(h, todayStr));
  const completedTodayCount = scheduledTodayHabits.filter((h) =>
    completions.some((c) => c.habitId === h.id && c.date === todayStr)
  ).length;
  const completionPercent =
    scheduledTodayHabits.length > 0
      ? Math.round((completedTodayCount / scheduledTodayHabits.length) * 100)
      : 0;

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
    <div className="space-y-5 pb-20">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
            Habit Tracker
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Build unshakeable daily consistency and monitor your streaks.
          </p>
        </div>

        <Button
          onClick={() => {
            setEditingHabit(null);
            setIsAddModalOpen(true);
          }}
          className="shadow-sm font-semibold"
        >
          <Plus className="w-4 h-4" />
          Add Habit
        </Button>
      </div>

      {/* Today's Quick Progress Hero */}
      {activeHabits.length > 0 && (
        <div className="p-4 bg-card rounded-2xl border border-border shadow-subtle flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground font-medium block">
              Today's Scheduled Goals
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-foreground">
                {completedTodayCount}
              </span>
              <span className="text-xs text-muted-foreground">
                of {scheduledTodayHabits.length} habits completed
              </span>
            </div>
            <div className="w-48 sm:w-64 h-2 bg-secondary rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-emerald-500">{completionPercent}%</span>
            <span className="text-[10px] text-muted-foreground block font-medium">Progress</span>
          </div>
        </div>
      )}

      {/* Tabs (Active vs Archived) & Search */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-xl border border-border/50">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'active'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Active ({activeHabits.length})
            </button>
            <button
              onClick={() => setActiveTab('archived')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'archived'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Archived ({habits.filter((h) => h.isArchived).length})
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search habits..."
              className="w-full pl-9 pr-3 py-2 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {['All', ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Habits List */}
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
          <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border/80">
            <CheckCircle2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-foreground">
              {searchQuery ? 'No habits match your search' : 'No habits created yet'}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1 mb-4">
              {searchQuery
                ? 'Try adjusting your search terms or filter category.'
                : 'Start tracking your daily routines, studies, or workouts by creating your first habit.'}
            </p>
            {!searchQuery && (
              <Button
                size="sm"
                onClick={() => {
                  setEditingHabit(null);
                  setIsAddModalOpen(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Create First Habit
              </Button>
            )}
          </div>
        )}
      </div>

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
