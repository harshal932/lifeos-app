import React from 'react';
import { Home, CheckCircle2, Wallet, BarChart3, Settings } from 'lucide-react';

export type TabType = 'home' | 'habits' | 'finance' | 'insights' | 'settings';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'habits' as TabType, label: 'Habits', icon: CheckCircle2 },
    { id: 'finance' as TabType, label: 'Finance', icon: Wallet },
    { id: 'insights' as TabType, label: 'Insights', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Bottom Navigation Bar */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border px-2 pb-safe shadow-elevated">
        <div className="flex items-center justify-around h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`relative flex flex-col items-center justify-center flex-1 h-full py-1 text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {isActive && (
                  <span className="absolute top-1.5 w-8 h-1 bg-primary rounded-full animate-in fade-in duration-200" />
                )}
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'scale-110' : ''
                  }`}
                />
                <span className="mt-1 text-[11px] leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Top Header Bar */}
      <header className="hidden sm:block sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-subtle">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/icons/icon-192.png"
              alt="LifeOS App Icon"
              className="w-9 h-9 rounded-xl shadow-sm border border-emerald-500/20"
            />
            <div>
              <span className="font-extrabold tracking-tight text-lg text-foreground">
                LifeOS
              </span>
              <span className="text-[10px] text-muted-foreground block -mt-1 font-semibold uppercase tracking-wider">
                Habits & Finance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-secondary/60 p-1 rounded-xl border border-border/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-card text-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground hover:bg-card/50'
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
