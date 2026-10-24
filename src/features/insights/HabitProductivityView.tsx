import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square, Clock, Flame, Award, AlertCircle, BookOpen, Trash2 } from 'lucide-react';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import type { Habit, HabitCompletion, StudySession, AppSettings } from '../../types';
import { calculateHabitStreakStats, isHabitScheduledOn } from '../../utils/streaks';
import { getLocalDateString } from '../../utils/date';
import {
  saveStudySession,
  deleteStudySession,
  getStudyStats,
  type StudySummary,
} from '../../services/studyService';

interface HabitProductivityViewProps {
  habits: Habit[];
  completions: HabitCompletion[];
  studySessions: StudySession[];
  settings: AppSettings;
  onRefresh: () => Promise<void>;
}

export const HabitProductivityView: React.FC<HabitProductivityViewProps> = ({
  habits,
  completions,
  studySessions,
  settings,
  onRefresh,
}) => {
  const [selectedSubject, setSelectedSubject] = useState(settings.studySubjects[0] || 'DSA');
  const [studyNotes, setStudyNotes] = useState('');

  // Live stopwatch timer state
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [startTime, setStartTime] = useState<string | null>(null);
  const intervalRef = useRef<any>(null);

  const todayStr = getLocalDateString();

  // Habit insights
  const activeHabits = habits.filter((h) => !h.isArchived);
  const habitStatsList = activeHabits.map((h) => ({
    habit: h,
    stats: calculateHabitStreakStats(h, completions, todayStr),
  }));

  // Top performers (streak > 0 or consistency >= 80)
  const topHabits = [...habitStatsList]
    .sort((a, b) => b.stats.currentStreak - a.stats.currentStreak)
    .slice(0, 3);

  // Habits needing attention (low completion rate or missed yesterday)
  const habitsNeedingAttention = habitStatsList.filter(
    (h) => h.stats.currentStreak === 0 && isHabitScheduledOn(h.habit, todayStr)
  );

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused]);

  const handleStartTimer = () => {
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date().toISOString());
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleStopAndSave = async () => {
    if (seconds >= 30) {
      // Save session if at least 30 seconds
      await saveStudySession({
        subject: selectedSubject,
        startTime: startTime || new Date().toISOString(),
        endTime: new Date().toISOString(),
        durationSeconds: seconds,
        date: todayStr,
        notes: studyNotes.trim() || undefined,
        completed: true,
      });
      await onRefresh();
    }
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setStartTime(null);
    setStudyNotes('');
  };

  const handleDeleteSession = async (id: string) => {
    await deleteStudySession(id);
    await onRefresh();
  };

  // Format seconds to HH:MM:SS
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs > 0 ? `${hrs}:` : ''}${String(mins).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  };

  // Format study duration into readable hours and minutes
  const formatHoursMinutes = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs === 0 && mins === 0) return `${totalSecs}s`;
    if (hrs === 0) return `${mins}m`;
    return `${hrs}h ${mins}m`;
  };

  // Study summary totals
  const todayStudySecs = studySessions
    .filter((s) => s.date === todayStr && s.completed)
    .reduce((acc, s) => acc + s.durationSeconds, 0);

  const thisMonthPrefix = todayStr.substring(0, 7);
  const thisMonthStudySecs = studySessions
    .filter((s) => s.date.startsWith(thisMonthPrefix) && s.completed)
    .reduce((acc, s) => acc + s.durationSeconds, 0);

  return (
    <div className="space-y-5">
      {/* Habit Consistency Overview */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          Habit Consistency & Momentum
        </h3>

        {/* Top Habits & Attention Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Top Performers */}
          <Card className="p-4 bg-emerald-500/[0.04] border-emerald-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <Award className="w-4 h-4" /> Top Streaks
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">Current</span>
            </div>
            {topHabits.length > 0 ? (
              <div className="space-y-2">
                {topHabits.map(({ habit, stats }) => (
                  <div key={habit.id} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground truncate max-w-[180px]">
                      {habit.name}
                    </span>
                    <Badge variant="success" className="text-[10px] py-0 px-2">
                      <Flame className="w-3 h-3 fill-emerald-500" />
                      {stats.currentStreak} days
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">No active habits yet.</p>
            )}
          </Card>

          {/* Needing Attention */}
          <Card className="p-4 bg-amber-500/[0.04] border-amber-500/20 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" /> Focus Needed
              </span>
              <span className="text-[10px] text-muted-foreground font-semibold">Today</span>
            </div>
            {habitsNeedingAttention.length > 0 ? (
              <div className="space-y-2">
                {habitsNeedingAttention.slice(0, 3).map(({ habit }) => (
                  <div key={habit.id} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground truncate max-w-[180px]">
                      {habit.name}
                    </span>
                    <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-2">
                All scheduled habits are on track today!
              </p>
            )}
          </Card>
        </div>
      </div>

      {/* Study & Time Tracker Section */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-primary" />
          Study & Focus Tracker
        </h3>

        {/* Study Summary Metrics */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <Card className="p-3 bg-card">
            <span className="text-[11px] text-muted-foreground font-semibold block">Today's Focus</span>
            <span className="text-lg font-extrabold text-primary">
              {formatHoursMinutes(todayStudySecs)}
            </span>
          </Card>
          <Card className="p-3 bg-card">
            <span className="text-[11px] text-muted-foreground font-semibold block">This Month</span>
            <span className="text-lg font-extrabold text-foreground">
              {formatHoursMinutes(thisMonthStudySecs)}
            </span>
          </Card>
        </div>

        {/* Interactive Stopwatch Timer Card */}
        <Card className="p-5 text-center bg-card border-primary/20 space-y-4">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Active Focus Stopwatch
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-black text-foreground tracking-tight py-2">
              {formatTime(seconds)}
            </div>
          </div>

          {/* Subject Selector & Notes */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              disabled={isRunning}
              className="w-full sm:w-auto px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs font-semibold text-foreground focus:outline-none"
            >
              {settings.studySubjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={studyNotes}
              onChange={(e) => setStudyNotes(e.target.value)}
              placeholder="Session notes (optional)..."
              className="w-full px-3 py-2 bg-secondary/50 border border-border rounded-xl text-xs text-foreground focus:outline-none"
            />
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-3 pt-1">
            {!isRunning ? (
              <Button onClick={handleStartTimer} className="px-6 shadow-md font-bold">
                <Play className="w-4 h-4 fill-white" />
                Start Session
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handlePauseResume}
                  className="px-5 font-semibold"
                >
                  {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button
                  variant="danger"
                  onClick={handleStopAndSave}
                  className="px-5 font-semibold"
                >
                  <Square className="w-4 h-4 fill-destructive" />
                  Stop & Save
                </Button>
              </>
            )}
          </div>
        </Card>

        {/* Recent Study Sessions Log */}
        {studySessions.length > 0 && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block px-1">
              Recent Sessions ({studySessions.length})
            </span>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {studySessions.slice(0, 8).map((session) => (
                <Card key={session.id} className="p-3 flex items-center justify-between text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">{session.subject}</span>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        {session.date}
                      </Badge>
                    </div>
                    {session.notes && (
                      <p className="text-[11px] text-muted-foreground truncate mt-0.5">
                        "{session.notes}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold font-mono text-primary">
                      {formatHoursMinutes(session.durationSeconds)}
                    </span>
                    <button
                      onClick={() => handleDeleteSession(session.id)}
                      className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      title="Delete session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
