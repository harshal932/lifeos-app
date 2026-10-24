import React, { useState, useEffect } from 'react';
import { AppSettings, VocabWord, VocabProgress } from '../../types';
import {
  getWordOfTheDay,
  ensureWordOfTheDayIntroduced,
  getAllProgressMap,
  getVocabStats,
  VocabStats,
  getLocalDateString
} from '../../services/vocabService';
import { WordOfTheDayCard } from './WordOfTheDayCard';
import { WordDetailModal } from './WordDetailModal';
import { PreviousWordsView } from './PreviousWordsView';
import { QuizPracticeView } from './QuizPracticeView';
import { FlashcardView } from './FlashcardView';
import { Card } from '../../components/common/Card';
import {
  Sparkles,
  BookOpen,
  Brain,
  Layers,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Award,
  Target,
  ArrowRight,
  TrendingUp,
  RotateCw
} from 'lucide-react';

interface VocabularyPageProps {
  settings: AppSettings;
}

type VocabTab = 'dashboard' | 'previous' | 'quiz' | 'flashcards';

export const VocabularyPage: React.FC<VocabularyPageProps> = ({ settings }) => {
  const [activeTab, setActiveTab] = useState<VocabTab>('dashboard');
  const [wotd, setWotd] = useState<VocabWord>(getWordOfTheDay());
  const [progressMap, setProgressMap] = useState<Record<string, VocabProgress>>({});
  const [stats, setStats] = useState<VocabStats>({
    totalLearned: 0,
    savedWordsCount: 0,
    difficultWordsCount: 0,
    masteredWordsCount: 0,
    todayLearnedCount: 0,
    dailyGoal: settings.dailyVocabGoal || 5,
    dueForReviewCount: 0
  });

  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);

  const loadData = async () => {
    const today = getLocalDateString();
    const currentWotd = getWordOfTheDay(today);
    setWotd(currentWotd);

    await ensureWordOfTheDayIntroduced(today);
    const pMap = await getAllProgressMap();
    setProgressMap(pMap);

    const goal = settings.dailyVocabGoal || 5;
    const currentStats = await getVocabStats(goal);
    setStats(currentStats);
  };

  useEffect(() => {
    loadData();
  }, [settings.dailyVocabGoal]);

  const progressPct = Math.min(100, Math.round((stats.todayLearnedCount / stats.dailyGoal) * 100));

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-200">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
          English Vocabulary
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Master daily English words with accurate Marathi meanings, quizzes, and spaced repetition.
        </p>
      </div>

      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none bg-secondary/50 p-1.5 rounded-2xl border border-border/70 self-start">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'dashboard'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
          }`}
        >
          <Sparkles className="w-4 h-4 text-primary" /> Dashboard
        </button>

        <button
          onClick={() => setActiveTab('previous')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'previous'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
          }`}
        >
          <BookOpen className="w-4 h-4 text-indigo-400" /> Previous Words
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'quiz'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
          }`}
        >
          <Brain className="w-4 h-4 text-emerald-500" /> Start Quiz
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
            activeTab === 'flashcards'
              ? 'bg-card text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-card/40'
          }`}
        >
          <Layers className="w-4 h-4 text-amber-500" /> Flashcards
        </button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Overdue Revision Banner if applicable */}
          {stats.dueForReviewCount > 0 && (
            <Card className="p-4 bg-gradient-to-r from-amber-500/15 via-card to-card border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-500">
                  <RotateCw className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground">
                    {stats.dueForReviewCount} word{stats.dueForReviewCount > 1 ? 's' : ''} scheduled for spaced revision today!
                  </h4>
                  <p className="text-muted-foreground text-xs mt-0.5">
                    Reviewing now ensures strong long-term memory retention.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('flashcards')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap shadow-sm active:scale-95 self-start sm:self-auto"
              >
                Revise Now
              </button>
            </Card>
          )}

          {/* Word of the Day */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" /> Today's Featured Word
              </h3>
              <span className="text-xs text-muted-foreground">Consistent all day</span>
            </div>
            <WordOfTheDayCard
              word={wotd}
              progress={progressMap[wotd.id]}
              onOpenDetails={(w) => setSelectedWord(w)}
              onRefreshProgress={loadData}
            />
          </div>

          {/* Daily Goal & Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Daily Goal card */}
            <Card className="col-span-2 p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground flex items-center gap-1.5 uppercase tracking-wider">
                  <Target className="w-4 h-4 text-primary" /> Daily Goal
                </span>
                <span className="font-black text-primary">{progressPct}%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-foreground">{stats.todayLearnedCount}</span>
                <span className="text-xs text-muted-foreground font-semibold">/ {stats.dailyGoal} words today</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-primary to-indigo-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </Card>

            {/* Total Learned */}
            <Card className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-primary" /> Learned
              </div>
              <p className="text-2xl font-black text-foreground">{stats.totalLearned}</p>
            </Card>

            {/* Saved Words */}
            <Card className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Bookmark className="w-3.5 h-3.5 text-amber-500" /> Saved
              </div>
              <p className="text-2xl font-black text-amber-500">{stats.savedWordsCount}</p>
            </Card>

            {/* Difficult Words */}
            <Card className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <AlertCircle className="w-3.5 h-3.5 text-destructive" /> Difficult
              </div>
              <p className="text-2xl font-black text-destructive">{stats.difficultWordsCount}</p>
            </Card>

            {/* Mastered Words */}
            <Card className="p-4 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-emerald-500" /> Mastered
              </div>
              <p className="text-2xl font-black text-emerald-500">{stats.masteredWordsCount}</p>
            </Card>
          </div>

          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <Card
              onClick={() => setActiveTab('quiz')}
              className="p-5 hover:border-primary/50 text-left transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-2 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                  <Brain className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-foreground text-base">Start Quiz</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Multiple-choice practice across 6 categories with Marathi explanations and mistake review.
                </p>
              </div>
              <span className="text-xs font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Configure & Start <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>

            <Card
              onClick={() => setActiveTab('flashcards')}
              className="p-5 hover:border-emerald-500/50 text-left transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-2 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Layers className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-foreground text-base">Revise Flashcards</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Spaced repetition flip-cards. Rate your recall to advance mastery.
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Practice Flashcards <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>

            <Card
              onClick={() => setActiveTab('previous')}
              className="p-5 hover:border-amber-500/50 text-left transition-all group flex flex-col justify-between cursor-pointer"
            >
              <div className="space-y-2 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="font-bold text-foreground text-base">Previous Words</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Browse your permanent dictionary with Marathi search, filters, and custom notes.
                </p>
              </div>
              <span className="text-xs font-bold text-amber-500 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Collection <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </Card>
          </div>
        </div>
      )}

      {/* PREVIOUS WORDS TAB */}
      {activeTab === 'previous' && (
        <PreviousWordsView
          progressMap={progressMap}
          onRefresh={loadData}
        />
      )}

      {/* QUIZ TAB */}
      {activeTab === 'quiz' && (
        <QuizPracticeView
          onBackToDashboard={() => setActiveTab('dashboard')}
          onRefreshStats={loadData}
        />
      )}

      {/* FLASHCARDS TAB */}
      {activeTab === 'flashcards' && (
        <FlashcardView
          onBackToDashboard={() => setActiveTab('dashboard')}
          onRefreshStats={loadData}
        />
      )}

      {/* Word Details Modal */}
      <WordDetailModal
        word={selectedWord}
        progress={selectedWord ? progressMap[selectedWord.id] : undefined}
        isOpen={selectedWord !== null}
        onClose={() => setSelectedWord(null)}
        onProgressUpdated={loadData}
      />
    </div>
  );
};
