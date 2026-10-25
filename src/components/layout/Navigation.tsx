import React, { useState } from 'react';
import {
  Home,
  ListTodo,
  CheckCircle2,
  Wallet,
  BarChart3,
  User,
  BookA,
  MoreHorizontal,
  X,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Sliders,
} from 'lucide-react';

export type TabType = 'home' | 'tasks' | 'habits' | 'finance' | 'vocabulary' | 'insights' | 'settings';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  // Desktop all 7 tabs
  const desktopTabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'To-Dos', icon: ListTodo },
    { id: 'finance', label: 'Expenses', icon: Wallet },
    { id: 'habits', label: 'Habits', icon: CheckCircle2 },
    { id: 'vocabulary', label: 'Vocabulary', icon: BookA },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: User },
  ];

  // Mobile 4 primary + More
  const mobileCoreTabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'To-Dos', icon: ListTodo },
    { id: 'finance', label: 'Expenses', icon: Wallet },
    { id: 'habits', label: 'Habits', icon: CheckCircle2 },
  ];

  const moreTabs: { id: TabType; label: string; desc: string; icon: React.ElementType }[] = [
    {
      id: 'vocabulary',
      label: 'English Vocabulary',
      desc: 'Daily words, Marathi meanings & quizzes',
      icon: BookA,
    },
    {
      id: 'insights',
      label: 'Analytics & Insights',
      desc: 'Spending trends, habit consistency & metrics',
      icon: BarChart3,
    },
    {
      id: 'settings',
      label: 'Settings & Data',
      desc: 'Preferences, categories & JSON backup',
      icon: User,
    },
  ];

  const isMoreTabActive = ['vocabulary', 'insights', 'settings'].includes(currentTab);

  const handleMobileSelect = (tab: TabType) => {
    onSelectTab(tab);
    setIsMoreOpen(false);
  };

  return (
    <>
      {/* Mobile Top App Header */}
      <header className="sm:hidden sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/60 px-4 h-13 flex items-center justify-between">
        <div
          onClick={() => onSelectTab('home')}
          className="flex items-center gap-2.5 cursor-pointer active:opacity-80"
        >
          <img
            src="/icons/icon-192.png"
            alt="LifeOS"
            className="w-7 h-7 rounded-lg border border-border/80"
          />
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm tracking-tight text-foreground">LifeOS</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border border-border/70 px-1 py-0.2 rounded">
              Student
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsMoreOpen(true)}
          className={`p-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
            isMoreTabActive
              ? 'border-primary/50 text-primary bg-primary/10'
              : 'border-border/60 text-muted-foreground hover:text-foreground'
          }`}
          aria-label="Open menu"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border/70 px-1 pb-safe shadow-lg">
        <div className="flex items-center justify-around h-15">
          {mobileCoreTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleMobileSelect(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div
                  className={`p-1 rounded-md transition-all ${
                    isActive ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 stroke-[2]" />
                </div>
                <span className="mt-0.5 tracking-tight">{tab.label}</span>
              </button>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
              isMoreTabActive
                ? 'text-primary font-semibold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div
              className={`p-1 rounded-md transition-all ${
                isMoreTabActive ? 'bg-primary/10 text-primary' : ''
              }`}
            >
              <MoreHorizontal className="w-4.5 h-4.5 stroke-[2]" />
            </div>
            <span className="mt-0.5 tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile More Drawer / Bottom Sheet */}
      {isMoreOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex items-end animate-in fade-in duration-150">
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setIsMoreOpen(false)}
          />
          <div className="relative z-10 w-full bg-card border-t border-border/80 rounded-t-2xl p-4 pb-8 space-y-3 animate-in slide-in-from-bottom-5 duration-200">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto mb-2" />

            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                More Features
              </span>
              <button
                onClick={() => setIsMoreOpen(false)}
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              {moreTabs.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleMobileSelect(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-colors ${
                      isActive
                        ? 'bg-primary/10 border-primary/30 text-foreground font-semibold'
                        : 'bg-secondary/30 border-border/50 text-foreground hover:bg-secondary/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold block">{item.label}</span>
                        <span className="text-[11px] text-muted-foreground block">{item.desc}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Desktop / Tablet Top Header Bar */}
      <header className="hidden sm:block sticky top-0 z-40 bg-card/90 backdrop-blur-md border-b border-border/60">
        <div className="max-w-6xl mx-auto px-6 h-15 flex items-center justify-between">
          {/* Logo & Brand */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <img
              src="/icons/icon-192.png"
              alt="LifeOS"
              className="w-8 h-8 rounded-lg border border-border/80 transition-transform group-hover:scale-105"
            />
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-base text-foreground">
                LifeOS
              </span>
              <span className="text-[10px] bg-secondary text-muted-foreground border border-border/70 px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider">
                Student
              </span>
            </div>
          </div>

          {/* Desktop Nav Tabs */}
          <nav className="flex items-center gap-1">
            {desktopTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-120 ${
                    isActive
                      ? 'bg-secondary text-foreground shadow-subtle border border-border/60'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40 border border-transparent'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>
    </>
  );
};
