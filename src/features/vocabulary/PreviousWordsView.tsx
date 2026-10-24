import React, { useState, useMemo } from 'react';
import { VocabWord, VocabProgress, VocabLearningStatus, VocabDifficulty } from '../../types';
import { VOCABULARY_DATASET } from '../../data/vocabularyData';
import { toggleBookmark, getLocalDateString } from '../../services/vocabService';
import { speakWord, isSpeechSupported } from '../../utils/speech';
import { WordDetailModal } from './WordDetailModal';
import {
  Search,
  Filter,
  Bookmark,
  Volume2,
  CheckCircle2,
  Clock,
  AlertCircle,
  BookOpen,
  Calendar,
  Layers,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

interface PreviousWordsViewProps {
  progressMap: Record<string, VocabProgress>;
  onRefresh: () => void;
  onStartFlashcardsWithWords?: (words: VocabWord[]) => void;
}

export const PreviousWordsView: React.FC<PreviousWordsViewProps> = ({
  progressMap,
  onRefresh
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [savedOnly, setSavedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'alpha' | 'difficulty'>('date_desc');

  // Selected word for detail modal
  const [selectedWord, setSelectedWord] = useState<VocabWord | null>(null);

  const speechSupported = isSpeechSupported();
  const today = getLocalDateString();

  // Words that have been introduced or studied
  const studiedWords = useMemo(() => {
    return VOCABULARY_DATASET.filter((word) => {
      const p = progressMap[word.id];
      // Include if it has progress record or was introduced
      return Boolean(p && (p.attemptCount > 0 || p.introducedDate != null || p.isBookmarked));
    });
  }, [progressMap]);

  // If no words studied yet, fallback to showing all vocabulary dataset so the user can explore!
  const baseWords = studiedWords.length > 0 ? studiedWords : VOCABULARY_DATASET;

  // Filtered and sorted words
  const filteredWords = useMemo(() => {
    return baseWords.filter((word) => {
      const p = progressMap[word.id];

      // Search query (English word, meaning, or Marathi Devanagari)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesWord = word.word.toLowerCase().includes(q);
        const matchesMeaning = word.meaning.toLowerCase().includes(q);
        const matchesMarathi = word.marathiMeaning.includes(searchQuery.trim());
        if (!matchesWord && !matchesMeaning && !matchesMarathi) {
          return false;
        }
      }

      // Filter: Difficulty
      if (selectedDifficulty !== 'all' && word.difficulty !== selectedDifficulty) {
        return false;
      }

      // Filter: Learning Status
      if (selectedStatus !== 'all') {
        const status = p?.status || 'new';
        if (status !== selectedStatus) {
          return false;
        }
      }

      // Filter: Saved / Bookmarked
      if (savedOnly && !p?.isBookmarked) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const pA = progressMap[a.id];
      const pB = progressMap[b.id];

      if (sortBy === 'date_desc') {
        const dateA = pA?.introducedDate || '2000-01-01';
        const dateB = pB?.introducedDate || '2000-01-01';
        return dateB.localeCompare(dateA);
      }
      if (sortBy === 'date_asc') {
        const dateA = pA?.introducedDate || '2000-01-01';
        const dateB = pB?.introducedDate || '2000-01-01';
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'alpha') {
        return a.word.localeCompare(b.word);
      }
      if (sortBy === 'difficulty') {
        const weights = { beginner: 1, intermediate: 2, advanced: 3 };
        return weights[a.difficulty] - weights[b.difficulty];
      }
      return 0;
    });
  }, [baseWords, progressMap, searchQuery, selectedDifficulty, selectedStatus, savedOnly, sortBy]);

  const handleSpeak = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!speechSupported) return;
    await speakWord(text);
  };

  const handleBookmarkToggle = async (e: React.MouseEvent, wordId: string) => {
    e.stopPropagation();
    await toggleBookmark(wordId);
    onRefresh();
  };

  const difficultyColors = {
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    advanced: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const statusColors: Record<VocabLearningStatus, string> = {
    new: 'bg-slate-700/50 text-slate-400',
    learning: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    needs_revision: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    mastered: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-400" /> Previous Words Collection
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Permanent record of studied vocabulary with Marathi meanings, search, and revision
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 font-semibold text-slate-200">
            {filteredWords.length} Words Listed
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by English word, meaning, or Marathi (e.g. धीर, चिकाटी)..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Difficulty filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Difficulties</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="learning">Learning</option>
            <option value="needs_revision">Needs Revision</option>
            <option value="mastered">Mastered</option>
          </select>

          {/* Sort order */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="alpha">A to Z</option>
            <option value="difficulty">By Difficulty</option>
          </select>

          {/* Saved only toggle */}
          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              savedOnly
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${savedOnly ? 'fill-amber-400' : ''}`} />
            Saved Only
          </button>
        </div>
      </div>

      {/* Words Grid */}
      {filteredWords.length === 0 ? (
        <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-300">No words match your search or filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try clearing filters or search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWords.map((word) => {
            const p = progressMap[word.id];
            const isBookmarked = p?.isBookmarked;
            const status: VocabLearningStatus = p?.status || 'new';

            return (
              <div
                key={word.id}
                onClick={() => setSelectedWord(word)}
                className="group cursor-pointer rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 p-4 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/5 flex flex-col justify-between"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${difficultyColors[word.difficulty]}`}>
                        {word.difficulty.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono italic">
                        {word.partOfSpeech}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleBookmarkToggle(e, word.id)}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                            : 'text-slate-500 border-transparent hover:text-slate-300'
                        }`}
                        title="Bookmark"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Word & Audio */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {word.word}
                    </h3>
                    {speechSupported && (
                      <button
                        onClick={(e) => handleSpeak(e, word.word)}
                        className="p-1 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Marathi meaning */}
                  <p className="text-base font-bold text-amber-300 font-devanagari mb-1">
                    {word.marathiMeaning}
                  </p>

                  {/* English meaning */}
                  <p className="text-xs text-slate-300 line-clamp-2 mb-3">
                    {word.meaning}
                  </p>
                </div>

                {/* Bottom status badge and introduced date */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${statusColors[status]}`}>
                    {status.replace('_', ' ')}
                  </span>

                  {p?.introducedDate && (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {p.introducedDate}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Word Details Modal */}
      <WordDetailModal
        word={selectedWord}
        progress={selectedWord ? progressMap[selectedWord.id] : undefined}
        isOpen={selectedWord !== null}
        onClose={() => setSelectedWord(null)}
        onProgressUpdated={onRefresh}
      />
    </div>
  );
};
