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
  ArrowRight
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';

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

  const isMastered = progress?.status === 'mastered';
  const isBookmarked = progress?.isBookmarked;

  return (
    <div
      onClick={() => onOpenDetails(word)}
      className="group relative cursor-pointer rounded-xl bg-card border border-border/80 p-4 sm:p-6 shadow-subtle hover:border-border transition-all"
    >
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-[11px] font-semibold py-0.5">
            <Sparkles className="w-3 h-3" /> Word of the Day
          </Badge>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border border-border/60 px-1.5 py-0.2 rounded">
            {word.difficulty}
          </span>
          <span className="text-xs text-muted-foreground font-mono italic">
            ({word.partOfSpeech})
          </span>
        </div>

        <button
          onClick={handleBookmark}
          className={`p-1.5 rounded-lg border transition-colors ${
            isBookmarked
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
              : 'bg-secondary/40 text-muted-foreground border-border/60 hover:text-foreground'
          }`}
          title={isBookmarked ? 'Saved in bookmarks' : 'Bookmark word'}
        >
          <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
        </button>
      </div>

      {/* Word & Pronunciation */}
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
          {word.word}
        </h2>
        {speechSupported && (
          <button
            onClick={(e) => handleSpeak(e, word.word)}
            disabled={isPlaying}
            className="p-1.5 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
            title="Hear pronunciation"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
        {word.pronunciation && (
          <span className="text-xs font-mono text-muted-foreground">/{word.pronunciation}/</span>
        )}
      </div>

      {/* Meanings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4">
        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
            मराठी अर्थ (Marathi Meaning)
          </span>
          <p className="text-lg sm:text-xl font-bold text-amber-400 font-devanagari">
            {word.marathiMeaning}
          </p>
        </div>
        <div className="p-3.5 rounded-lg bg-secondary/30 border border-border/50">
          <span className="text-[11px] font-semibold text-muted-foreground block mb-1">
            English Definition
          </span>
          <p className="text-xs sm:text-sm text-foreground/90 font-medium">
            {word.meaning}
          </p>
        </div>
      </div>

      {/* Practical Examples */}
      <div className="space-y-1.5 mb-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
          Practical Example
        </span>
        {word.examples.slice(0, 2).map((ex, idx) => (
          <div key={idx} className="p-3 rounded-lg bg-secondary/20 border border-border/40 text-xs">
            <div className="flex items-start justify-between gap-2">
              <p className="italic text-foreground font-medium">"{ex.sentence}"</p>
              {speechSupported && (
                <button
                  onClick={(e) => handleSpeak(e, ex.sentence)}
                  className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  title="Speak example"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-amber-300 font-devanagari mt-1">
              मराठी: {ex.marathiTranslation}
            </p>
          </div>
        ))}
      </div>

      {/* Synonyms & Antonyms tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
        {word.synonyms.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground font-medium">Synonyms:</span>
            {word.synonyms.slice(0, 3).map((s, i) => (
              <span key={i} className="px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                {s}
              </span>
            ))}
          </div>
        )}
        {word.antonyms.length > 0 && (
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-[11px] text-muted-foreground font-medium">Antonyms:</span>
            {word.antonyms.slice(0, 2).map((a, i) => (
              <span key={i} className="px-2 py-0.2 rounded bg-destructive/10 text-destructive border border-destructive/20 text-[11px] font-medium">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-border/50 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[11px]">Consistent daily feature</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkLearned}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              isMastered
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isMastered ? 'Mastered' : 'Mark as Learned'}
          </button>
          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground flex items-center gap-0.5 transition-colors">
            Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
