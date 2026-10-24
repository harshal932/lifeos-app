import React, { useState, useEffect } from 'react';
import { VocabWord, VocabProgress } from '../../types';
import { VOCABULARY_DATASET, VOCAB_MAP } from '../../data/vocabularyData';
import { speakWord, isSpeechSupported } from '../../utils/speech';
import { recordRecallAttempt, getAllProgressMap, getLocalDateString } from '../../services/vocabService';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
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
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Top Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Layers className="w-6 h-6 text-primary" /> Flashcard Revision
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Spaced repetition flip cards with instant memory rating
          </p>
        </div>

        <div className="flex items-center gap-1.5 bg-secondary/50 p-1.5 rounded-2xl border border-border/70 self-start sm:self-auto">
          {(['all', 'due', 'difficult', 'saved'] as FlashcardDeckFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                filter === f
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {f === 'due' ? 'Due Today' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State */}
      {deck.length === 0 ? (
        <Card className="text-center p-12 space-y-3">
          <BookOpen className="w-12 h-12 text-muted-foreground/30 mx-auto" />
          <h3 className="text-base font-bold text-foreground">No flashcards found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {filter === 'saved'
              ? 'You have not saved any words yet. Bookmark words to practice them here.'
              : filter === 'difficult'
              ? 'Awesome! You currently have no difficult words flagged.'
              : 'Try selecting another deck category or explore vocabulary.'}
          </p>
          <Button
            size="sm"
            onClick={() => setFilter('all')}
            className="mt-2"
          >
            Practice All Vocabulary
          </Button>
        </Card>
      ) : isFinished ? (
        /* Completion Screen */
        <Card className="text-center p-8 sm:p-10 border-emerald-500/30 space-y-4">
          <div className="w-16 h-16 bg-emerald-500/15 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/30">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-foreground mb-1">Session Complete!</h3>
            <p className="text-xs text-muted-foreground">
              You reviewed {completedCount} cards and remembered {rememberedCount} correctly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto py-2">
            <div className="p-3 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-muted-foreground block text-xs font-semibold">Remembered</span>
              <span className="text-emerald-500 font-black text-xl">{rememberedCount}</span>
            </div>
            <div className="p-3 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-muted-foreground block text-xs font-semibold">Needs Practice</span>
              <span className="text-destructive font-black text-xl">{completedCount - rememberedCount}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button onClick={loadDeck}>
              Practice Again
            </Button>
            <Button variant="outline" onClick={onBackToDashboard}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      ) : (
        /* Active Flashcard */
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground px-1 font-semibold">
            <span>Card {currentIndex + 1} of {deck.length}</span>
            <span className="text-primary font-bold">
              {Math.round(((currentIndex) / deck.length) * 100)}% complete
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / deck.length) * 100}%` }}
            />
          </div>

          {/* Flashcard container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="cursor-pointer min-h-[350px] rounded-3xl bg-card border border-border/80 p-6 sm:p-8 flex flex-col justify-between shadow-elevated transition-all duration-300 relative group select-none hover:border-primary/50"
          >
            {/* Top metadata */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-muted-foreground tracking-wider">
                {currentWord.partOfSpeech} • {currentWord.difficulty}
              </span>
              <span className="text-xs text-primary font-semibold flex items-center gap-1 group-hover:underline">
                <RotateCw className="w-3.5 h-3.5" /> Tap card to {isFlipped ? 'hide' : 'reveal'}
              </span>
            </div>

            {/* Front side: English Word */}
            {!isFlipped ? (
              <div className="text-center py-12 my-auto">
                <h3 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight mb-2">
                  {currentWord.word}
                </h3>
                {currentWord.pronunciation && (
                  <p className="text-base font-mono text-primary/80 mb-5">
                    /{currentWord.pronunciation}/
                  </p>
                )}
                {speechSupported && (
                  <button
                    onClick={(e) => handleAudio(e, currentWord.word)}
                    disabled={isPlayingAudio}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary hover:bg-primary/20 text-xs sm:text-sm font-bold transition-all active:scale-95"
                  >
                    <Volume2 className="w-4 h-4" /> Listen Audio
                  </button>
                )}
              </div>
            ) : (
              /* Back side: Marathi meaning + examples */
              <div className="py-4 my-auto space-y-4">
                <div className="text-center border-b border-border/50 pb-3">
                  <span className="text-xs text-primary font-bold block">मराठी अर्थ (Marathi Meaning)</span>
                  <h4 className="text-3xl font-black text-amber-500 dark:text-amber-300 font-devanagari mt-1">
                    {currentWord.marathiMeaning}
                  </h4>
                  <p className="text-sm text-foreground/80 font-medium mt-1">{currentWord.meaning}</p>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase text-muted-foreground block">Practical Example</span>
                  {currentWord.examples.slice(0, 1).map((ex, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-secondary/40 border border-border/50 text-xs sm:text-sm">
                      <div className="flex items-start justify-between gap-2">
                        <p className="italic text-foreground font-medium">"{ex.sentence}"</p>
                        {speechSupported && (
                          <button
                            onClick={(e) => handleAudio(e, ex.sentence)}
                            className="p-1 text-muted-foreground hover:text-primary"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-amber-600 dark:text-amber-200/90 font-devanagari mt-1 font-medium">
                        मराठी: {ex.marathiTranslation}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom prompt */}
            <div className="text-center pt-3 border-t border-border/40">
              <span className="text-xs text-muted-foreground font-medium">
                {isFlipped ? 'Rate how well you knew this word' : 'Click "Reveal Meaning" or tap anywhere'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {!isFlipped ? (
              <button
                onClick={() => setIsFlipped(true)}
                className="w-full py-3.5 rounded-2xl bg-primary hover:bg-primary/95 text-primary-foreground font-bold text-sm shadow-md shadow-primary/20 transition-all flex items-center justify-center gap-2 active:scale-98"
              >
                <RotateCw className="w-4 h-4" /> Reveal Meaning
              </button>
            ) : (
              <>
                <button
                  onClick={() => handleResponse(false)}
                  className="flex-1 py-3 rounded-2xl bg-destructive/15 hover:bg-destructive/25 text-destructive border border-destructive/25 font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <XCircle className="w-4 h-4" /> Forgot It
                </button>
                <button
                  onClick={() => handleResponse(true)}
                  className="flex-1 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" /> Remembered It
                </button>
              </>
            )}

            <button
              onClick={handleNextWord}
              className="px-4 py-3 rounded-2xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-all flex items-center gap-1.5 active:scale-95"
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
