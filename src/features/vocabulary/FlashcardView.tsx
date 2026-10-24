import React, { useState, useEffect } from 'react';
import { VocabWord, VocabProgress } from '../../types';
import { VOCABULARY_DATASET, VOCAB_MAP } from '../../data/vocabularyData';
import { speakWord, isSpeechSupported } from '../../utils/speech';
import { recordRecallAttempt, getAllProgressMap, getLocalDateString } from '../../services/vocabService';
import {
  Volume2,
  RotateCw,
  CheckCircle,
  XCircle,
  ArrowRight,
  Filter,
  Sparkles,
  BookOpen,
  Layers,
  ChevronRight,
  Award
} from 'lucide-react';

interface FlashcardViewProps {
  onBackToDashboard: () => void;
  onRefreshStats: () => void;
}

type FlashcardDeckFilter = 'due' | 'difficult' | 'saved' | 'all';

export const FlashcardView: React.FC<FlashcardViewProps> = ({
  onBackToDashboard,
  onRefreshStats
}) => {
  const [filter, setFilter] = useState<FlashcardDeckFilter>('all');
  const [deck, setDeck] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, VocabProgress>>({});
  const [completedCount, setCompletedCount] = useState(0);
  const [rememberedCount, setRememberedCount] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const speechSupported = isSpeechSupported();

  const loadDeck = async () => {
    const pMap = await getAllProgressMap();
    setProgressMap(pMap);
    const today = getLocalDateString();

    let candidateWords: VocabWord[] = [];

    switch (filter) {
      case 'due':
        // Overdue or due today
        candidateWords = VOCABULARY_DATASET.filter((w) => {
          const p = pMap[w.id];
          return p && p.nextReviewDate && p.nextReviewDate <= today;
        });
        if (candidateWords.length === 0) {
          // Fallback to all learned if none strictly due
          candidateWords = VOCABULARY_DATASET.filter((w) => pMap[w.id] != null);
        }
        break;

      case 'difficult':
        candidateWords = VOCABULARY_DATASET.filter((w) => {
          const p = pMap[w.id];
          return p && (p.status === 'needs_revision' || (p.incorrectCount > 0 && p.incorrectCount >= p.correctCount));
        });
        break;

      case 'saved':
        candidateWords = VOCABULARY_DATASET.filter((w) => pMap[w.id]?.isBookmarked);
        break;

      case 'all':
      default:
        // Prioritize learned words, or whole dataset if few learned
        const learned = VOCABULARY_DATASET.filter((w) => pMap[w.id] != null);
        candidateWords = learned.length >= 10 ? learned : VOCABULARY_DATASET.slice(0, 30);
        break;
    }

    // Shuffle deck
    const shuffled = [...candidateWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCount(0);
    setRememberedCount(0);
  };

  useEffect(() => {
    loadDeck();
  }, [filter]);

  const currentWord = deck[currentIndex];

  const handleAudio = async (e: React.MouseEvent, text: string) => {
    e.stopPropagation();
    if (!speechSupported) return;
    setIsPlayingAudio(true);
    await speakWord(text);
    setIsPlayingAudio(false);
  };

  const handleResponse = async (remembered: boolean) => {
    if (!currentWord) return;

    await recordRecallAttempt(currentWord.id, remembered);
    if (remembered) {
      setRememberedCount((c) => c + 1);
    }
    setCompletedCount((c) => c + 1);
    onRefreshStats();

    // Advance to next card
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    } else {
      // Completed deck!
      setCurrentIndex(deck.length);
    }
  };

  const handleNextWord = () => {
    if (currentIndex + 1 < deck.length) {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  };

  const isFinished = deck.length > 0 && currentIndex >= deck.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" /> Flashcard Revision
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Spaced repetition flashcards with instant memory feedback
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['all', 'due', 'difficult', 'saved'] as FlashcardDeckFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f === 'due' ? 'Due Today' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {deck.length === 0 ? (
        <div className="text-center p-12 bg-slate-900 border border-slate-800 rounded-2xl">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-200">No flashcards found</h3>
          <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {filter === 'saved'
              ? 'You have not saved any words yet. Bookmark words to practice them here.'
              : filter === 'difficult'
              ? 'Awesome! You currently have no difficult words flagged.'
              : 'Try selecting another deck category or explore more vocabulary words.'}
          </p>
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-500"
          >
            Practice All Vocabulary
          </button>
        </div>
      ) : isFinished ? (
        /* Completion Screen */
        <div className="text-center p-10 bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
            <Award className="w-8 h-8" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">Session Complete!</h3>
          <p className="text-sm text-slate-400 mb-6">
            You reviewed {completedCount} cards and remembered {rememberedCount} correctly.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto mb-6 text-sm">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-xs">Remembered</span>
              <span className="text-emerald-400 font-bold text-lg">{rememberedCount}</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-slate-400 block text-xs">Needs Practice</span>
              <span className="text-rose-400 font-bold text-lg">{completedCount - rememberedCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              onClick={loadDeck}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-500 transition-colors"
            >
              Practice Again
            </button>
            <button
              onClick={onBackToDashboard}
              className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-medium hover:bg-slate-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      ) : (
        /* Active Flashcard */
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Card {currentIndex + 1} of {deck.length}</span>
            <span className="text-indigo-400 font-medium">
              {Math.round(((currentIndex) / deck.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
            />
          </div>

          {/* Flashcard container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[340px] rounded-2xl bg-gradient-to-b from-slate-800/90 to-slate-900 border border-slate-700 p-6 md:p-8 flex flex-col justify-between shadow-2xl transition-all duration-300 relative group"
          >
            {/* Top metadata */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-semibold text-slate-400 tracking-wider">
                {currentWord.partOfSpeech} • {currentWord.difficulty}
              </span>
              <span className="text-xs text-indigo-400 flex items-center gap-1 group-hover:text-indigo-300">
                <RotateCw className="w-3.5 h-3.5" /> Tap card to {isFlipped ? 'hide' : 'reveal'}
              </span>
            </div>

            {/* Front side: English Word */}
            {!isFlipped ? (
              <div className="text-center py-10 my-auto">
                <h3 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                  {currentWord.word}
                </h3>
                {currentWord.pronunciation && (
                  <p className="text-base font-mono text-indigo-400 mb-4">
                    /{currentWord.pronunciation}/
                  </p>
                )}
                {speechSupported && (
                  <button
                    onClick={(e) => handleAudio(e, currentWord.word)}
                    disabled={isPlayingAudio}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 text-sm font-medium transition-colors"
                  >
                    <Volume2 className="w-4 h-4" /> Listen Pronunciation
                  </button>
                )}
              </div>
            ) : (
              /* Back side: Marathi meaning + examples */
              <div className="py-4 my-auto space-y-4">
                <div className="text-center border-b border-slate-700 pb-3">
                  <span className="text-xs text-indigo-400 font-medium block">मराठी अर्थ (Marathi Meaning)</span>
                  <h4 className="text-3xl font-extrabold text-amber-300 font-devanagari mt-1">
                    {currentWord.marathiMeaning}
                  </h4>
                  <p className="text-sm text-slate-300 mt-1">{currentWord.meaning}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-semibold uppercase text-slate-400 block">Practical Example</span>
                  {currentWord.examples.slice(0, 1).map((ex, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs sm:text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="italic text-slate-200">"{ex.sentence}"</p>
                        {speechSupported && (
                          <button
                            onClick={(e) => handleAudio(e, ex.sentence)}
                            className="p-1 text-slate-400 hover:text-indigo-400"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-amber-200/90 font-devanagari mt-1">मराठी: {ex.marathiTranslation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom prompt */}
            <div className="text-center pt-3 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                {isFlipped ? 'Rate how well you knew this word' : 'Click "Reveal Meaning" or tap anywhere'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
              >
                <RotateCw className="w-4 h-4" /> Reveal Meaning
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleResponse(false)}
                  className="flex-1 py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4 text-rose-400" /> Forgot It
                </button>
                <button
                  onClick={() => handleResponse(true)}
                  className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" /> Remembered It
                </button>
              </>
            )}

            <button
              onClick={handleNextWord}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-colors flex items-center gap-1.5"
              title="Skip to next word"
            >
              Skip <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
