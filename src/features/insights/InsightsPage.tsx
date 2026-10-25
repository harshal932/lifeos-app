import React, { useState } from 'react';
import { BarChart3, Flame, BookMarked } from 'lucide-react';
import { FinancialAnalyticsView } from './FinancialAnalyticsView';
import { HabitProductivityView } from './HabitProductivityView';
import { JournalView } from './JournalView';
import type { Habit, HabitCompletion, Transaction, StudySession, JournalEntry, Budget, AppSettings } from '../../types';

interface InsightsPageProps {
  habits: Habit[];
  completions: HabitCompletion[];
  transactions: Transaction[];
  studySessions: StudySession[];
  journalEntries: JournalEntry[];
  settings: AppSettings;
  budget?: Budget;
  onRefresh: () => Promise<void>;
}

export const InsightsPage: React.FC<InsightsPageProps> = ({
  habits,
  completions,
  transactions,
  studySessions,
  journalEntries,
  settings,
  budget,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'finance' | 'habits' | 'journal'>('finance');

  return (
    <div className="space-y-5 pb-20">
      {/* Top Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Analytics & Insights
        </h1>
        <span className="text-[10px] bg-secondary text-muted-foreground border border-border/60 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
          Metrics
        </span>
      </div>

      {/* Segmented Switcher */}
      <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-lg border border-border/60">
        <button
          onClick={() => setActiveTab('finance')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'finance'
              ? 'bg-card text-foreground shadow-subtle'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Finances
        </button>

        <button
          onClick={() => setActiveTab('habits')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'habits'
              ? 'bg-card text-foreground shadow-subtle'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          Focus & Habits
        </button>

        <button
          onClick={() => setActiveTab('journal')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
            activeTab === 'journal'
              ? 'bg-card text-foreground shadow-subtle'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <BookMarked className="w-3.5 h-3.5 text-primary" />
          Journal
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'finance' && (
        <FinancialAnalyticsView
          transactions={transactions}
          settings={settings}
          budget={budget}
        />
      )}

      {activeTab === 'habits' && (
        <HabitProductivityView
          habits={habits}
          completions={completions}
          studySessions={studySessions}
          settings={settings}
          onRefresh={onRefresh}
        />
      )}

      {activeTab === 'journal' && (
        <JournalView
          entries={journalEntries}
          onRefresh={onRefresh}
        />
      )}
    </div>
  );
};
