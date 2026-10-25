import React from 'react';
import { Home, ListTodo, CheckCircle2, Wallet, BarChart3, User, BookA, Sparkles } from 'lucide-react';

export type TabType = 'home' | 'tasks' | 'habits' | 'finance' | 'vocabulary' | 'insights' | 'settings';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  // Mobile 6 primary tabs
  const mobileTabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'tasks' as TabType, label: 'To-Dos', icon: ListTodo },
    { id: 'finance' as TabType, label: 'Expenses', icon: Wallet },
    { id: 'habits' as TabType, label: 'Habits', icon: CheckCircle2 },
    { id: 'vocabulary' as TabType, label: 'Vocab', icon: BookA },
    { id: 'settings' as TabType, label: 'Profile', icon: User },
  ];

  // Desktop all 7 tabs
  const desktopTabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'tasks' as TabType, label: 'To-Do List', icon: ListTodo },
    { id: 'finance' as TabType, label: 'Daily Expenses', icon: Wallet },
    { id: 'habits' as TabType, label: 'Habits', icon: CheckCircle2 },
    { id: 'vocabulary' as TabType, label: 'Vocabulary', icon: BookA },
    { id: 'insights' as TabType, label: 'Insights', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings', icon: User },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar (Ultra-clean, thumb-friendly, glassmorphism) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-border/80 px-2 pb-safe shadow-elevated">
        <div className="flex items-center justify-around h-16">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <span className="absolute top-1 w-9 h-1 bg-gradient-to-r from-primary to-indigo-400 rounded-full shadow-sm animate-in fade-in duration-200" />
                )}
                <div
                  className={`p-1 rounded-xl transition-all duration-200 ${
                    isActive ? 'bg-primary/10 text-primary scale-110' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="mt-0.5 text-[10.5px] tracking-tight">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop / Tablet Top Header Bar */}
      <header className="hidden sm:block sticky top-0 z-40 glass-panel border-b border-border/70 shadow-subtle">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <img
                src="/icons/icon-192.png"
                alt="LifeOS Icon"
                className="w-9 h-9 rounded-xl shadow-md border border-emerald-500/20 group-hover:scale-105 transition-transform"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-background" />
            </div>
            <div>
              <span className="font-extrabold tracking-tight text-lg text-foreground flex items-center gap-1.5">
                LifeOS <span className="text-[10px] bg-primary/15 text-primary border border-primary/25 px-1.5 py-0.2 rounded-md font-bold uppercase tracking-wider">Student</span>
              </span>
              <span className="text-[10px] text-muted-foreground block -mt-0.5 font-semibold uppercase tracking-wider">
                Daily Expenses & To-Dos
              </span>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <div className="flex items-center gap-1 bg-secondary/50 p-1 rounded-2xl border border-border/50">
            {desktopTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isActive
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>
    </>
  );
};
