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
    <div className="space-y-6 pb-12">
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800 scrollbar-none">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'dashboard'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Dashboard
        </button>

        <button
          onClick={() => setActiveTab('previous')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'previous'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Previous Words
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'quiz'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Brain className="w-4 h-4" /> Start Quiz
        </button>

        <button
          onClick={() => setActiveTab('flashcards')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
            activeTab === 'flashcards'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" /> Flashcards
        </button>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Overdue Revision Banner if applicable */}
          {stats.dueForReviewCount > 0 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-slate-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                  <RotateCw className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-200">
                    {stats.dueForReviewCount} word{stats.dueForReviewCount > 1 ? 's' : ''} scheduled for spaced revision today!
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Reviewing now ensures strong memory retention.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('flashcards')}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors whitespace-nowrap shadow-md shadow-amber-500/20"
              >
                Revise Now
              </button>
            </div>
          )}

          {/* Word of the Day */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Today's Featured Word
              </h2>
              <span className="text-xs text-slate-400">Consistent throughout the day</span>
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
            <div className="col-span-2 p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-400 flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-indigo-400" /> Daily Goal
                </span>
                <span className="font-bold text-indigo-400">{progressPct}%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-white">{stats.todayLearnedCount}</span>
                <span className="text-xs text-slate-400">/ {stats.dailyGoal} words today</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Total Learned */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <TrendingUp className="w-3.5 h-3.5 text-indigo-400" /> Total Learned
              </div>
              <p className="text-2xl font-bold text-white">{stats.totalLearned}</p>
            </div>

            {/* Saved Words */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Saved Words
              </div>
              <p className="text-2xl font-bold text-amber-300">{stats.savedWordsCount}</p>
            </div>

            {/* Difficult Words */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" /> Difficult Words
              </div>
              <p className="text-2xl font-bold text-rose-400">{stats.difficultWordsCount}</p>
            </div>

            {/* Mastered Words */}
            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Award className="w-3.5 h-3.5 text-emerald-400" /> Mastered Words
              </div>
              <p className="text-2xl font-bold text-emerald-400">{stats.masteredWordsCount}</p>
            </div>
          </div>

          {/* Quick Action Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              onClick={() => setActiveTab('quiz')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Start Quiz</h3>
                <p className="text-xs text-slate-400">
                  Multiple-choice test with 6 categories, Marathi explanations, and mistake review.
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Configure & Start <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <button
              onClick={() => setActiveTab('flashcards')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Revise Flashcards</h3>
                <p className="text-xs text-slate-400">
                  Spaced repetition flip-cards. Rate your recall to advance mastery.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Practice Flashcards <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>

            <button
              onClick={() => setActiveTab('previous')}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left transition-all group flex flex-col justify-between"
            >
              <div className="space-y-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-white text-base">Revise Previous Words</h3>
                <p className="text-xs text-slate-400">
                  Browse your complete dictionary with Marathi search, filters, and notes.
                </p>
              </div>
              <span className="text-xs font-semibold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Open Collection <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </button>
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
