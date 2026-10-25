import React, { useState } from 'react';
import { Button } from '../../components/common/Button';
import { VocabWord, VocabProgress, VocabLearningStatus } from '../../types';
import { speakWord, isSpeechSupported } from '../../utils/speech';
import { toggleBookmark, updateWordNotes, updateWordStatus } from '../../services/vocabService';
import {
  X,
  Volume2,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
  Calendar,
  Save,
  Check
} from 'lucide-react';

interface WordDetailModalProps {
  word: VocabWord | null;
  progress?: VocabProgress;
  isOpen: boolean;
  onClose: () => void;
  onProgressUpdated?: () => void;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  progress,
  isOpen,
  onClose,
  onProgressUpdated
}) => {
  if (!isOpen || !word) return null;

  const [notes, setNotes] = useState(progress?.notes || '');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(progress?.isBookmarked ?? false);
  const [currentStatus, setCurrentStatus] = useState<VocabLearningStatus>(progress?.status || 'learning');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const speechAvailable = isSpeechSupported();

  const handlePlayAudio = async (text: string) => {
    if (!speechAvailable) return;
    setIsPlayingAudio(true);
    await speakWord(text);
    setIsPlayingAudio(false);
  };

  const handleToggleBookmark = async () => {
    const updated = await toggleBookmark(word.id);
    setIsBookmarked(updated);
    onProgressUpdated?.();
  };

  const handleStatusChange = async (newStatus: VocabLearningStatus) => {
    setCurrentStatus(newStatus);
    await updateWordStatus(word.id, newStatus);
    onProgressUpdated?.();
  };

  const handleSaveNotes = async () => {
    setIsSavingNotes(true);
    await updateWordNotes(word.id, notes);
    setIsSavingNotes(false);
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
    onProgressUpdated?.();
  };

  const difficultyColors = {
    beginner: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    advanced: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-background/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-card text-card-foreground border-t sm:border border-border/80 rounded-t-2xl sm:rounded-2xl shadow-elevated p-5 sm:p-6 max-h-[92vh] overflow-y-auto my-0 sm:my-8 animate-in slide-in-from-bottom-4 duration-150">
        {/* Mobile handle */}
        <div className="sm:hidden w-10 h-1 bg-muted-foreground/30 rounded-full mx-auto -mt-1 mb-3.5" />

        {/* Header */}
        <div className="flex items-start justify-between border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${difficultyColors[word.difficulty]}`}>
                {word.difficulty.toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground italic font-mono bg-secondary px-2 py-0.5 rounded-lg">
                {word.partOfSpeech}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black tracking-tight text-foreground">{word.word}</h2>
              {speechAvailable && (
                <button
                  onClick={() => handlePlayAudio(word.word)}
                  disabled={isPlayingAudio}
                  className="p-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-95"
                  title="Listen pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
            {word.pronunciation && (
              <p className="text-sm font-mono text-primary/80 mt-1">/{word.pronunciation}/</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`p-2.5 rounded-2xl border transition-all active:scale-90 ${
                isBookmarked
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                  : 'bg-secondary text-muted-foreground border-border/80 hover:text-foreground'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Word'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-2xl bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground border border-border/80 transition-all active:scale-90"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Marathi & English Meanings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 my-5">
          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Marathi Meaning (मराठी अर्थ)
            </div>
            <p className="text-2xl font-bold text-amber-500 dark:text-amber-300 font-devanagari">{word.marathiMeaning}</p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary/50 border border-border/60">
            <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" /> English Meaning
            </div>
            <p className="text-sm sm:text-base text-foreground font-medium">{word.meaning}</p>
          </div>
        </div>

        {/* Examples Section */}
        <div className="space-y-3 mb-5">
          <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Practical Examples</h3>
          {word.examples.map((ex, idx) => (
            <div key={idx} className="p-3.5 rounded-2xl bg-secondary/30 border border-border/50 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-foreground italic">"{ex.sentence}"</p>
                {speechAvailable && (
                  <button
                    onClick={() => handlePlayAudio(ex.sentence)}
                    className="p-1 rounded text-muted-foreground hover:text-primary transition-colors flex-shrink-0"
                    title="Pronounce sentence"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-200/90 font-devanagari font-medium">मराठी: {ex.marathiTranslation}</p>
            </div>
          ))}
        </div>

        {/* Synonyms & Antonyms */}
        {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {word.synonyms.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase text-muted-foreground block mb-2">Synonyms (समानार्थी)</span>
                <div className="flex flex-wrap gap-1.5">
                  {word.synonyms.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {word.antonyms.length > 0 && (
              <div>
                <span className="text-xs font-bold uppercase text-muted-foreground block mb-2">Antonyms (विरुद्धार्थी)</span>
                <div className="flex flex-wrap gap-1.5">
                  {word.antonyms.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs rounded-xl bg-destructive/10 text-destructive border border-destructive/20 font-medium">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Learning Status & Spaced Repetition Stats */}
        <div className="p-4 rounded-2xl bg-secondary/40 border border-border/70 mb-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold uppercase text-muted-foreground">Learning Status</span>
            <div className="flex items-center gap-1.5">
              {(['learning', 'needs_revision', 'mastered'] as VocabLearningStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all active:scale-95 ${
                    currentStatus === status
                      ? status === 'mastered'
                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                        : status === 'needs_revision'
                        ? 'bg-destructive text-white shadow-md shadow-destructive/25'
                        : 'bg-primary text-primary-foreground shadow-md shadow-primary/25'
                      : 'bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {progress && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/40 text-xs">
              <div>
                <span className="text-muted-foreground block font-medium">Total Attempts</span>
                <span className="text-foreground font-bold">{progress.attemptCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Correct / Wrong</span>
                <span className="text-emerald-500 font-bold">{progress.correctCount}</span>
                <span className="text-muted-foreground"> / </span>
                <span className="text-destructive font-bold">{progress.incorrectCount}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Consecutive Recalls</span>
                <span className="text-primary font-bold">{progress.consecutiveSuccess}</span>
              </div>
              <div>
                <span className="text-muted-foreground block font-medium">Next Review</span>
                <span className="text-amber-500 font-bold">{progress.nextReviewDate || 'Scheduled'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Personal Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase text-muted-foreground">Personal Notes & Mnemonics</label>
            {notesSaved && (
              <span className="text-xs text-emerald-500 flex items-center gap-1 font-bold">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your personal memory hook, context, or custom sentence..."
            rows={2}
            className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-secondary/40 border border-border/80 rounded-2xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 transition-colors"
          />
          <div className="flex justify-end pt-1">
            <Button
              size="sm"
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="gap-1.5"
            >
              <Save className="w-3.5 h-3.5" /> Save Note
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
