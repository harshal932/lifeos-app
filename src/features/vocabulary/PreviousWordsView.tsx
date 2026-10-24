import React, { useState, useMemo } from 'react';
import { VocabWord, VocabProgress, VocabLearningStatus, VocabDifficulty } from '../../types';
import { VOCABULARY_DATASET } from '../../data/vocabularyData';
import { toggleBookmark, getLocalDateString } from '../../services/vocabService';
import { speakWord, isSpeechSupported } from '../../utils/speech';
import { WordDetailModal } from './WordDetailModal';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
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
    beginner: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    advanced: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20'
  };

  const statusColors: Record<VocabLearningStatus, string> = {
    new: 'bg-secondary text-muted-foreground',
    learning: 'bg-primary/10 text-primary border border-primary/20',
    needs_revision: 'bg-destructive/10 text-destructive border border-destructive/20',
    mastered: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" /> Previous Words Collection
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Permanent record of studied vocabulary with Marathi meanings, search, and revision
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3.5 py-1.5 rounded-xl bg-secondary font-bold text-foreground border border-border/60">
            {filteredWords.length} Words Found
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 sm:p-5 space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in English or Marathi (e.g. धीर, चिकाटी, Resilience)..."
            className="w-full pl-10 pr-4 py-2.5 bg-secondary/40 border border-border/70 rounded-2xl text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          {/* Difficulty filter */}
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/70 text-foreground font-semibold focus:outline-none focus:border-primary/50"
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
            className="px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/70 text-foreground font-semibold focus:outline-none focus:border-primary/50"
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
            className="px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/70 text-foreground font-semibold focus:outline-none focus:border-primary/50"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="alpha">A to Z</option>
            <option value="difficulty">By Difficulty</option>
          </select>

          {/* Saved only toggle */}
          <button
            onClick={() => setSavedOnly(!savedOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold transition-all active:scale-95 ${
              savedOnly
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-500 shadow-xs'
                : 'bg-secondary/40 border-border/70 text-muted-foreground hover:text-foreground'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${savedOnly ? 'fill-amber-500' : ''}`} />
            Saved Only
          </button>
        </div>
      </Card>

      {/* Words Grid */}
      {filteredWords.length === 0 ? (
        <Card className="text-center py-16 space-y-2">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No words match your search or filter</h3>
          <p className="text-xs text-muted-foreground">Try clearing filters or search query</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredWords.map((word) => {
            const p = progressMap[word.id];
            const isBookmarked = p?.isBookmarked;
            const status: VocabLearningStatus = p?.status || 'new';

            return (
              <Card
                key={word.id}
                onClick={() => setSelectedWord(word)}
                className="group cursor-pointer hover:border-primary/50 p-4 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${difficultyColors[word.difficulty]}`}>
                        {word.difficulty.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-mono italic">
                        {word.partOfSpeech}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => handleBookmarkToggle(e, word.id)}
                        className={`p-1.5 rounded-xl border transition-all active:scale-90 ${
                          isBookmarked
                            ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                            : 'text-muted-foreground border-transparent hover:text-foreground'
                        }`}
                        title="Bookmark"
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Word & Audio */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors">
                      {word.word}
                    </h3>
                    {speechSupported && (
                      <button
                        onClick={(e) => handleSpeak(e, word.word)}
                        className="p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors"
                        title="Listen"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Marathi meaning */}
                  <p className="text-base font-bold text-amber-600 dark:text-amber-300 font-devanagari mb-1">
                    {word.marathiMeaning}
                  </p>

                  {/* English meaning */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {word.meaning}
                  </p>
                </div>

                {/* Bottom status badge and introduced date */}
                <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                  <span className={`px-2.5 py-0.5 rounded-full font-bold capitalize ${statusColors[status]}`}>
                    {status.replace('_', ' ')}
                  </span>

                  {p?.introducedDate && (
                    <span className="text-muted-foreground flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-primary" />
                      {p.introducedDate}
                    </span>
                  )}
                </div>
              </Card>
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
