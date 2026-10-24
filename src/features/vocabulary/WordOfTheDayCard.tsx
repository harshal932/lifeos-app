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
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    advanced: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  const isMastered = progress?.status === 'mastered';
  const isBookmarked = progress?.isBookmarked;

  return (
    <div
      onClick={() => onOpenDetails(word)}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-900/40 via-slate-900 to-slate-900 border border-indigo-500/30 p-5 md:p-7 shadow-xl hover:border-indigo-500/50 transition-all duration-300"
    >
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Word of the Day
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficultyColors[word.difficulty]}`}>
            {word.difficulty.toUpperCase()}
          </span>
          <span className="text-xs text-slate-400 font-mono italic">
            ({word.partOfSpeech})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBookmark}
            className={`p-2 rounded-xl border transition-colors ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white'
            }`}
            title={isBookmarked ? 'Saved in bookmarks' : 'Bookmark word'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Word & Pronunciation */}
      <div className="flex items-baseline gap-3 mb-3">
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
          {word.word}
        </h2>
        {speechSupported && (
          <button
            onClick={(e) => handleSpeak(e, word.word)}
            disabled={isPlaying}
            className="p-2 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/40 transition-colors"
            title="Hear pronunciation"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        )}
        {word.pronunciation && (
          <span className="text-sm font-mono text-indigo-400">/{word.pronunciation}/</span>
        )}
      </div>

      {/* Meanings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <span className="text-xs font-medium text-indigo-400 block mb-1">मराठी अर्थ (Marathi Meaning)</span>
          <p className="text-xl md:text-2xl font-bold text-amber-300 font-devanagari">{word.marathiMeaning}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
          <span className="text-xs font-medium text-indigo-400 block mb-1">English Meaning</span>
          <p className="text-sm md:text-base text-slate-200">{word.meaning}</p>
        </div>
      </div>

      {/* Examples */}
      <div className="space-y-2 mb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Practical Examples</span>
        {word.examples.slice(0, 2).map((ex, idx) => (
          <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800/70 text-sm">
            <div className="flex items-start justify-between gap-2">
              <p className="italic text-slate-200 font-medium">"{ex.sentence}"</p>
              {speechSupported && (
                <button
                  onClick={(e) => handleSpeak(e, ex.sentence)}
                  className="p-1 rounded text-slate-400 hover:text-indigo-300 transition-colors flex-shrink-0"
                  title="Speak example"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <p className="text-xs text-amber-200/90 font-devanagari mt-1">मराठी: {ex.marathiTranslation}</p>
          </div>
        ))}
      </div>

      {/* Synonyms & Antonyms tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
        {word.synonyms.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Synonyms:</span>
            {word.synonyms.slice(0, 3).map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {s}
              </span>
            ))}
          </div>
        )}
        {word.antonyms.length > 0 && (
          <div className="flex items-center gap-1.5 ml-0 sm:ml-2">
            <span className="text-slate-400">Antonyms:</span>
            {word.antonyms.slice(0, 2).map((a, i) => (
              <span key={i} className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20">
                {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Calendar className="w-4 h-4" />
          <span>Keeps consistent throughout the day</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkLearned}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
              isMastered
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {isMastered ? 'Mastered' : 'Mark as Learned'}
          </button>
          <span className="text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
            Details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </div>
  );
};
