import React, { useState } from 'react';
import { VocabWord, VocabProgress } from '../../types';
import { speakWord, isSpeechSupported } from '../../utils/speech';
import { toggleBookmark, recordRecallAttempt } from '../../services/vocabService';
import {
  Sparkles,
  Volume2,
  Bookmark,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

interface WordOfTheDayCardProps {
  word: VocabWord;
  progress?: VocabProgress;
  onOpenDetails: (word: VocabWord) => void;
  onRefreshProgress: () => void;
}

export const WordOfTheDayCard: React.FC<WordOfTheDayCardProps> = ({
  word,
  progress,
  onOpenDetails,
  onRefreshProgress
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const speechSupported = isSpeechSupported();

  const handleSpeak = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!speechSupported) return;
    setIsPlaying(true);
    await speakWord(text);
    setIsPlaying(false);
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleBookmark(word.id);
    onRefreshProgress();
  };

  const handleMarkLearned = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await recordRecallAttempt(word.id, true);
    onRefreshProgress();
  };

  const difficultyColors = {
    beginner: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    advanced: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const isMastered = progress?.status === 'mastered';
  const isBookmarked = progress?.isBookmarked;

  return (
    <div
      onClick={() => onOpenDetails(word)}
      className="group relative cursor-pointer overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500/[0.08] via-card to-card border border-indigo-500/30 p-5 sm:p-7 shadow-elevated hover:border-indigo-500/60 transition-all duration-300"
    >
      {/* Background glow decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-primary text-primary-foreground shadow-sm shadow-primary/25">
            <Sparkles className="w-3.5 h-3.5" /> Word of the Day
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${difficultyColors[word.difficulty]}`}>
            {word.difficulty.toUpperCase()}
          </span>
          <span className="text-xs text-muted-foreground font-mono italic">
            ({word.partOfSpeech})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl border transition-all active:scale-90 ${
              isBookmarked
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-secondary/60 text-muted-foreground border-border/80 hover:text-foreground'
            }`}
            title={isBookmarked ? 'Saved in bookmarks' : 'Bookmark word'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Word & Pronunciation */}
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
          {word.word}
        </h2>
        {speechSupported && (
          <button
            onClick={(e) => handleSpeak(e, word.word)}
            disabled={isPlaying}
            className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors active:scale-90"
            title="Hear pronunciation"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
        {word.pronunciation && (
          <span className="text-sm font-mono text-primary/80">/{word.pronunciation}/</span>
        )}
      </div>

      {/* Meanings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60">
          <span className="text-xs font-bold text-primary block mb-1">मराठी अर्थ (Marathi Meaning)</span>
          <p className="text-xl sm:text-2xl font-bold text-amber-500 dark:text-amber-300 font-devanagari">{word.marathiMeaning}</p>
        </div>
        <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60">
          <span className="text-xs font-bold text-primary block mb-1">English Meaning</span>
          <p className="text-sm text-foreground/90 font-medium">{word.meaning}</p>
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-2 mb-5">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">Practical Examples</span>
        {word.examples.slice(0, 2).map((ex, idx) => (
          <div key={idx} className="p-3.5 rounded-2xl bg-secondary/30 border border-border/50 text-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="italic text-foreground font-medium">"{ex.sentence}"</p>
              {speechSupported && (
                <button
                  onClick={(e) => handleSpeak(e, ex.sentence)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                  title="Speak example"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-amber-600 dark:text-amber-200/90 font-devanagari mt-1 font-medium">
              मराठी: {ex.marathiTranslation}
            </p>
          </div>
        ))}
      </div>

      {/* Synonyms & Antonyms tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
        {word.synonyms.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Synonyms:</span>
            {word.synonyms.slice(0, 3).map((s, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                {s}
              </span>
            ))}
          </div>
        )}
        {word.antonyms.length > 0 && (
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-muted-foreground font-medium">Antonyms:</span>
            {word.antonyms.slice(0, 2).map((a, i) => (
              <span key={i} className="px-2.5 py-0.5 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-border/50 text-xs">
        <div className="flex items-center gap-2 text-muted-foreground font-medium">
          <Calendar className="w-4 h-4 text-primary" />
          <span>Consistent throughout the day</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkLearned}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold transition-all active:scale-95 ${
              isMastered
                ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isMastered ? 'Mastered' : 'Mark as Learned'}
          </button>
          <span className="text-primary font-bold group-hover:translate-x-1 transition-transform flex items-center gap-1">
            Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
