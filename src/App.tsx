import React, { useState, useEffect } from 'react';
import { db, initializeDatabase, DEFAULT_SETTINGS, DEFAULT_TASK_CATEGORIES } from './db';
import type {
  Habit,
  HabitCompletion,
  Transaction,
  Budget,
  StudySession,
  JournalEntry,
  AppSettings,
  TransactionType,
  TaskItem,
} from './types';
import { Navigation, type TabType } from './components/layout/Navigation';
import { HomePage } from './features/dashboard/HomePage';
import { HabitsPage } from './features/habits/HabitsPage';
import { TasksPage } from './features/tasks/TasksPage';
import { FinancePage } from './features/finance/FinancePage';
import { InsightsPage } from './features/insights/InsightsPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { VocabularyPage } from './features/vocabulary/VocabularyPage';
import { AddEditHabitModal } from './features/habits/AddEditHabitModal';
import { AddEditTaskModal } from './features/tasks/AddEditTaskModal';
import { AddEditTransactionModal } from './features/finance/AddEditTransactionModal';
import { BudgetModal } from './features/budgets/BudgetModal';
import { createHabit } from './services/habitService';
import { createTask, getAllTasks } from './services/taskService';
import { createTransaction } from './services/financeService';
import { saveBudget } from './services/budgetService';
import { loadStarterTemplates } from './services/sampleDataService';
import { getCurrentMonthString } from './utils/date';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global modal triggers
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [addTxDefaultType, setAddTxDefaultType] = useState<TransactionType>('expense');
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Refresh data from IndexedDB
  const refreshData = async () => {
    try {
      const [
        loadedSettings,
        loadedHabits,
        loadedCompletions,
        loadedTransactions,
        loadedBudgets,
        loadedTasks,
        loadedStudy,
        loadedJournal,
      ] = await Promise.all([
        initializeDatabase(),
        db.habits.toArray(),
        db.habitCompletions.toArray(),
        db.transactions.reverse().sortBy('date'),
        db.budgets.toArray(),
        getAllTasks(),
        db.studySessions.reverse().sortBy('date'),
        db.journalEntries.reverse().sortBy('date'),
      ]);

      setSettings(loadedSettings);
      setHabits(loadedHabits);
      setCompletions(loadedCompletions);
      setTransactions(loadedTransactions);
      setBudgets(loadedBudgets);
      setTasks(loadedTasks);
      setStudySessions(loadedStudy);
      setJournalEntries(loadedJournal);
    } catch (err) {
      console.error('Failed to load data from IndexedDB:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // System preference
      const isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isSystemDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Update Settings
  const handleUpdateSettings = async (updates: Partial<AppSettings>) => {
    const updated = { ...settings, ...updates };
    await db.settings.put(updated);
    setSettings(updated);
  };

  const handleToggleTheme = async () => {
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    await handleUpdateSettings({ theme: nextTheme });
  };

  // Add Habit from shortcut
  const handleSaveHabit = async (data: Omit<Habit, 'id' | 'createdAt' | 'isArchived'>) => {
    await createHabit(data);
    await refreshData();
  };

  // Add Task from shortcut
  const handleSaveTask = async (data: Omit<TaskItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    await createTask(data);
    await refreshData();
  };

  // Add Transaction from shortcut
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    await createTransaction(data);
    await refreshData();
  };

  // Save Budget
  const handleSaveBudget = async (b: Budget) => {
    await saveBudget(b);
    await refreshData();
  };

  // Load starter templates
  const handleLoadSampleData = async () => {
    await loadStarterTemplates();
    await refreshData();
  };

  const currentMonthStr = getCurrentMonthString();
  const currentMonthBudget = budgets.find((b) => b.month === currentMonthStr);
  const taskCategories = settings.taskCategories || DEFAULT_TASK_CATEGORIES;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <img
          src="/icons/icon-192.png"
          alt="LifeOS"
          className="w-16 h-16 rounded-2xl shadow-elevated animate-pulse border border-emerald-500/30 mb-2"
        />
        <span className="text-xs text-muted-foreground mt-2 font-semibold tracking-wider uppercase">
          Initializing LifeOS...
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Navigation (Top bar on desktop) */}
      <Navigation currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main View Area */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-3.5 sm:px-6 pt-4 sm:pt-6 pb-24 sm:pb-12">
        {currentTab === 'home' && (
          <HomePage
            habits={habits}
            completions={completions}
            transactions={transactions}
            tasks={tasks}
            budget={currentMonthBudget}
            settings={settings}
            onSelectTab={setCurrentTab}
            onOpenAddHabit={() => setIsAddHabitOpen(true)}
            onOpenAddTask={() => setIsAddTaskOpen(true)}
            onOpenAddTransaction={(type) => {
              setAddTxDefaultType(type || 'expense');
              setIsAddTxOpen(true);
            }}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            onToggleTheme={handleToggleTheme}
            onLoadSampleData={handleLoadSampleData}
            onRefresh={refreshData}
          />
        )}

        {currentTab === 'tasks' && (
          <TasksPage
            tasks={tasks}
            categories={taskCategories}
            onRefresh={refreshData}
          />
        )}

        {currentTab === 'habits' && (
          <HabitsPage
            habits={habits}
            completions={completions}
            categories={settings.habitCategories}
            onRefresh={refreshData}
          />
        )}

        {currentTab === 'finance' && (
          <FinancePage
            transactions={transactions}
            budget={currentMonthBudget}
            settings={settings}
            expenseCategories={settings.expenseCategories}
            incomeCategories={settings.incomeCategories}
            paymentMethods={settings.paymentMethods}
            onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            onUpdateHoldings={(holdings) => handleUpdateSettings({ holdings })}
            onRefresh={refreshData}
          />
        )}

        {currentTab === 'vocabulary' && (
          <VocabularyPage settings={settings} />
        )}

        {currentTab === 'insights' && (
          <InsightsPage
            habits={habits}
            completions={completions}
            transactions={transactions}
            studySessions={studySessions}
            journalEntries={journalEntries}
            settings={settings}
            budget={currentMonthBudget}
            onRefresh={refreshData}
          />
        )}

        {currentTab === 'settings' && (
          <SettingsPage
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onRefresh={refreshData}
          />
        )}
      </main>

      {/* Global Add Habit Modal */}
      <AddEditHabitModal
        isOpen={isAddHabitOpen}
        onClose={() => setIsAddHabitOpen(false)}
        onSave={handleSaveHabit}
        categories={settings.habitCategories}
      />

      {/* Global Add Task Modal */}
      <AddEditTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onSave={handleSaveTask}
        categories={taskCategories}
      />

      {/* Global Add Transaction Modal */}
      <AddEditTransactionModal
        isOpen={isAddTxOpen}
        onClose={() => setIsAddTxOpen(false)}
        onSave={handleSaveTransaction}
        defaultType={addTxDefaultType}
        expenseCategories={settings.expenseCategories}
        incomeCategories={settings.incomeCategories}
        paymentMethods={settings.paymentMethods}
      />

      {/* Global Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        monthStr={currentMonthStr}
        existingBudget={currentMonthBudget}
        expenseCategories={settings.expenseCategories}
        onSave={handleSaveBudget}
      />
    </div>
  );
};

export default App;
