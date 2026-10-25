import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Check,
  Plus,
  Trash2,
  DollarSign,
  Calendar,
  AlertTriangle,
  Info,
  Bell,
} from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Badge } from '../../components/common/Badge';
import type { AppSettings, BackupData } from '../../types';
import { db } from '../../db';
import {
  exportBackup,
  triggerDownload,
  validateBackupData,
  restoreBackup,
  resetAllData,
  type ValidationResult,
} from '../../services/backupService';
import { parseRupeesToPaise, paiseToRupees, formatINR } from '../../utils/currency';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  onRefresh: () => Promise<void>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  settings,
  onUpdateSettings,
  onRefresh,
}) => {
  const [savingsGoalInput, setSavingsGoalInput] = useState(
    paiseToRupees(settings.savingsGoalPaise || 0).toString()
  );
  const [isSavingSavingsGoal, setIsSavingSavingsGoal] = useState(false);

  // New Category / Method inputs
  const [newHabitCat, setNewHabitCat] = useState('');
  const [newExpenseCat, setNewExpenseCat] = useState('');
  const [newIncomeCat, setNewIncomeCat] = useState('');
  const [newPaymentMethod, setNewPaymentMethod] = useState('');
  const [newStudySubject, setNewStudySubject] = useState('');

  // Import flow state
  const [validationPreview, setValidationPreview] = useState<ValidationResult | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState('');

  // Reset confirmation state
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Notification state
  const [notificationStatus, setNotificationStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const handleRequestNotification = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      setNotificationStatus(perm);
    }
  };

  // Save savings goal
  const handleSaveSavingsGoal = async () => {
    try {
      setIsSavingSavingsGoal(true);
      const paise = parseRupeesToPaise(savingsGoalInput);
      await onUpdateSettings({ savingsGoalPaise: paise });
    } finally {
      setIsSavingSavingsGoal(false);
    }
  };

  // Add items
  const handleAddHabitCat = async () => {
    if (!newHabitCat.trim()) return;
    if (settings.habitCategories.includes(newHabitCat.trim())) return;
    await onUpdateSettings({ habitCategories: [...settings.habitCategories, newHabitCat.trim()] });
    setNewHabitCat('');
  };

  const handleRemoveHabitCat = async (cat: string) => {
    await onUpdateSettings({
      habitCategories: settings.habitCategories.filter((c) => c !== cat),
    });
  };

  const handleAddExpenseCat = async () => {
    if (!newExpenseCat.trim()) return;
    if (settings.expenseCategories.includes(newExpenseCat.trim())) return;
    await onUpdateSettings({ expenseCategories: [...settings.expenseCategories, newExpenseCat.trim()] });
    setNewExpenseCat('');
  };

  const handleRemoveExpenseCat = async (cat: string) => {
    await onUpdateSettings({
      expenseCategories: settings.expenseCategories.filter((c) => c !== cat),
    });
  };

  const handleAddIncomeCat = async () => {
    if (!newIncomeCat.trim()) return;
    if (settings.incomeCategories.includes(newIncomeCat.trim())) return;
    await onUpdateSettings({ incomeCategories: [...settings.incomeCategories, newIncomeCat.trim()] });
    setNewIncomeCat('');
  };

  const handleRemoveIncomeCat = async (cat: string) => {
    await onUpdateSettings({
      incomeCategories: settings.incomeCategories.filter((c) => c !== cat),
    });
  };

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.trim()) return;
    if (settings.paymentMethods.includes(newPaymentMethod.trim())) return;
    await onUpdateSettings({ paymentMethods: [...settings.paymentMethods, newPaymentMethod.trim()] });
    setNewPaymentMethod('');
  };

  const handleRemovePaymentMethod = async (pm: string) => {
    await onUpdateSettings({
      paymentMethods: settings.paymentMethods.filter((m) => m !== pm),
    });
  };

  // Export
  const handleExport = async () => {
    const { filename, jsonString } = await exportBackup();
    triggerDownload(filename, jsonString);
  };

  // Import file handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        const result = validateBackupData(parsed);
        setValidationPreview(result);
        setIsImportModalOpen(true);
      } catch (err) {
        alert('Could not read or parse JSON file: malformed JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  // Perform Restore / Merge
  const handleExecuteImport = async (mode: 'replace' | 'merge') => {
    if (!validationPreview?.data) return;
    try {
      setIsImporting(true);
      await restoreBackup(validationPreview.data, mode);
      setIsImportModalOpen(false);
      setValidationPreview(null);
      setImportSuccessMsg(`Data successfully ${mode === 'replace' ? 'restored' : 'merged'}!`);
      await onRefresh();
      setTimeout(() => setImportSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(`Import failed: ${err.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // Reset all
  const handleReset = async () => {
    try {
      setIsResetting(true);
      await resetAllData();
      setIsResetConfirmOpen(false);
      await onRefresh();
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-border/50">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Settings & Preferences
        </h1>
        <span className="text-[10px] bg-secondary text-muted-foreground border border-border/60 px-1.5 py-0.2 rounded font-semibold uppercase tracking-wider">
          System
        </span>
      </div>

      {importSuccessMsg && (
        <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4" />
          {importSuccessMsg}
        </div>
      )}

      {/* Theme Setting */}
      <Card className="p-4 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Appearance Theme
        </span>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'system', label: 'System', icon: Laptop },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const isSelected = settings.theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onUpdateSettings({ theme: t.id })}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                    : 'bg-secondary/40 text-muted-foreground border-border hover:text-foreground'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Preferences (Week start & Savings goal) */}
      <Card className="p-4 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          General Preferences
        </span>

        {/* Week Start Day */}
        <div className="flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-foreground block">Week Starts On</span>
            <span className="text-[11px] text-muted-foreground">
              Used for weekly habit consistency and reports
            </span>
          </div>
          <div className="flex items-center gap-1 bg-secondary p-1 rounded-xl">
            <button
              onClick={() => onUpdateSettings({ weekStartDay: 1 })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                settings.weekStartDay === 1
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground'
              }`}
            >
              Monday
            </button>
            <button
              onClick={() => onUpdateSettings({ weekStartDay: 0 })}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                settings.weekStartDay === 0
                  ? 'bg-card text-foreground shadow-xs'
                  : 'text-muted-foreground'
              }`}
            >
              Sunday
            </button>
          </div>
        </div>

        {/* Daily English Vocabulary Goal */}
        <div className="pt-2 border-t border-border/40 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-foreground block">Daily English Vocabulary Goal</span>
              <span className="text-[11px] text-muted-foreground">
                Target words to learn and practice each day
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {[3, 5, 10, 15].map((count) => (
                <button
                  key={count}
                  onClick={() => onUpdateSettings({ dailyVocabGoal: count })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    (settings.dailyVocabGoal || 5) === count
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Savings Goal */}
        <div className="pt-2 border-t border-border/40 space-y-1.5">
          <label className="block text-xs font-bold text-foreground">
            Monthly Savings Goal Target (₹)
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-2 text-xs font-bold text-muted-foreground">₹</span>
              <input
                type="number"
                value={savingsGoalInput}
                onChange={(e) => setSavingsGoalInput(e.target.value)}
                placeholder="e.g. 50000"
                className="w-full pl-7 pr-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs font-bold text-foreground focus:outline-none"
              />
            </div>
            <Button size="sm" onClick={handleSaveSavingsGoal} disabled={isSavingSavingsGoal}>
              Save
            </Button>
          </div>
        </div>

        {/* Notifications & Reminders */}
        <div className="pt-2 border-t border-border/40 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-foreground block">Browser Reminders</span>
              <span className="text-[11px] text-muted-foreground">
                On-device daily reminders for habits and vocabulary
              </span>
            </div>
            <Button
              size="sm"
              variant={notificationStatus === 'granted' ? 'outline' : 'secondary'}
              onClick={handleRequestNotification}
              disabled={notificationStatus === 'unsupported'}
              className="text-xs h-8"
            >
              <Bell className="w-3.5 h-3.5" />
              {notificationStatus === 'granted'
                ? 'Enabled'
                : notificationStatus === 'denied'
                ? 'Blocked'
                : notificationStatus === 'unsupported'
                ? 'Not supported'
                : 'Enable'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Category Management */}
      <Card className="p-4 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Customise Categories
        </span>

        {/* Expense Categories */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-foreground">Expense Categories</label>
          <div className="flex flex-wrap gap-1.5">
            {settings.expenseCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-foreground text-xs rounded-xl border border-border/60"
              >
                {cat}
                {settings.expenseCategories.length > 1 && (
                  <button
                    onClick={() => handleRemoveExpenseCat(cat)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newExpenseCat}
              onChange={(e) => setNewExpenseCat(e.target.value)}
              placeholder="Add expense category..."
              className="flex-1 px-3 py-1.5 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none"
            />
            <Button size="sm" variant="outline" onClick={handleAddExpenseCat}>
              Add
            </Button>
          </div>
        </div>

        {/* Habit Categories */}
        <div className="space-y-2 pt-2 border-t border-border/40">
          <label className="block text-xs font-bold text-foreground">Habit Categories</label>
          <div className="flex flex-wrap gap-1.5">
            {settings.habitCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-secondary text-foreground text-xs rounded-xl border border-border/60"
              >
                {cat}
                {settings.habitCategories.length > 1 && (
                  <button
                    onClick={() => handleRemoveHabitCat(cat)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                )}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={newHabitCat}
              onChange={(e) => setNewHabitCat(e.target.value)}
              placeholder="Add habit category..."
              className="flex-1 px-3 py-1.5 bg-secondary/40 border border-border rounded-xl text-xs text-foreground focus:outline-none"
            />
            <Button size="sm" variant="outline" onClick={handleAddHabitCat}>
              Add
            </Button>
          </div>
        </div>
      </Card>

      {/* Data Backup & Restore */}
      <Card className="p-4 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          Data Backup & Safety
        </span>
        <p className="text-xs text-muted-foreground">
          LifeOS stores everything locally in your device's IndexedDB. Export periodic JSON backups
          to keep your habit records, expenses, and journal entries permanently safe across devices.
        </p>

        {/* Warning callout on clearing site data */}
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs space-y-1 text-amber-600 dark:text-amber-400">
          <div className="font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            Local Storage Notice & Backup Recommendation
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            All records exist exclusively on this device. <strong>Clearing browser site data, removing application storage, or resetting your phone will permanently erase your data</strong> unless you have exported a JSON backup file. We strongly recommend creating regular backups.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Button onClick={handleExport} className="w-full">
            <Download className="w-4 h-4" />
            Export Backup (JSON)
          </Button>

          <label className="w-full">
            <span className="inline-flex items-center justify-center font-medium transition-all duration-200 active:scale-[0.98] rounded-xl select-none text-xs px-3 py-2.5 h-10 gap-2 border border-border bg-card hover:bg-secondary text-foreground cursor-pointer w-full text-center">
              <Upload className="w-4 h-4" />
              Import Backup
            </span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        </div>

        {/* Danger Zone: Reset */}
        <div className="pt-3 border-t border-border/40 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-destructive block">Reset Application Data</span>
            <span className="text-[10px] text-muted-foreground">
              Permanently wipe all records on this device
            </span>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsResetConfirmOpen(true)}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Data
          </Button>
        </div>
      </Card>

      {/* Privacy and App Information */}
      <Card className="p-4 space-y-3 bg-secondary/30 border border-emerald-500/20">
        <div className="flex items-center gap-3 pb-2 border-b border-border/40">
          <img
            src="/icons/icon-192.png"
            alt="LifeOS App Icon"
            className="w-12 h-12 rounded-2xl shadow-md border border-emerald-500/20 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-foreground text-sm">
              LifeOS
              <span className="text-[10px] bg-emerald-500/15 text-emerald-500 font-bold px-1.5 py-0.5 rounded-md border border-emerald-500/20">
                PWA
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground block">
              Habit Tracker & Personal Expense Manager
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-foreground font-bold text-xs pt-1">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          100% Local Storage & Privacy Assurance
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          • <strong>Local IndexedDB & Dexie.js</strong>: All habits, expenses, incomes, budgets, holdings, and journal reflections are processed and stored strictly on this device.<br />
          • <strong>Zero Remote Databases</strong>: Absolutely no Firebase, Supabase, MongoDB Atlas, or cloud database synchronisation.<br />
          • <strong>Zero Telemetry & Tracking</strong>: No Google Analytics, trackers, advertisements, or external AI API calls.<br />
          • <strong>Host Serves Code Only</strong>: The web server merely serves static JavaScript and CSS assets. No personal records are ever transmitted over the network.
        </p>
        <span className="text-[10px] text-muted-foreground/60 block pt-1 border-t border-border/40">
          LifeOS Version 1.0.0 • Private Edition
        </span>
      </Card>

      {/* Import Review Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Review Backup Import"
        description="Inspect the contents of the backup file before applying."
      >
        {validationPreview && (
          <div className="space-y-4">
            {!validationPreview.isValid ? (
              <div className="p-3 bg-destructive/15 text-destructive rounded-xl text-xs space-y-1">
                <span className="font-bold block">Invalid Backup File:</span>
                {validationPreview.errors.map((e, idx) => (
                  <p key={idx}>• {e}</p>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-secondary/40 rounded-xl">
                    <span className="text-muted-foreground block text-[10px]">Habits</span>
                    <span className="font-bold text-foreground">
                      {validationPreview.summary.habitsCount}
                    </span>
                  </div>
                  <div className="p-2.5 bg-secondary/40 rounded-xl">
                    <span className="text-muted-foreground block text-[10px]">Transactions</span>
                    <span className="font-bold text-foreground">
                      {validationPreview.summary.transactionsCount}
                    </span>
                  </div>
                  <div className="p-2.5 bg-secondary/40 rounded-xl">
                    <span className="text-muted-foreground block text-[10px]">Habit Completions</span>
                    <span className="font-bold text-foreground">
                      {validationPreview.summary.completionsCount}
                    </span>
                  </div>
                  <div className="p-2.5 bg-secondary/40 rounded-xl">
                    <span className="text-muted-foreground block text-[10px]">Study Sessions</span>
                    <span className="font-bold text-foreground">
                      {validationPreview.summary.studySessionsCount}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Choose how to apply this backup:
                </p>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    onClick={() => handleExecuteImport('merge')}
                    disabled={isImporting}
                    className="w-full"
                  >
                    Merge with Existing Data
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleExecuteImport('replace')}
                    disabled={isImporting}
                    className="w-full"
                  >
                    Replace / Restore Entire Database
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-card p-5 rounded-2xl border border-destructive/30 shadow-elevated space-y-4">
            <div className="flex items-center gap-2 text-destructive font-bold text-sm">
              <AlertTriangle className="w-5 h-5" />
              Reset All Application Records?
            </div>
            <p className="text-xs text-muted-foreground">
              This will permanently delete all your habits, completions, expenses, budgets, and journal entries. This action cannot be reversed unless you have a saved JSON backup.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsResetConfirmOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleReset}
                disabled={isResetting}
              >
                {isResetting ? 'Resetting...' : 'Yes, Wipe Everything'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
