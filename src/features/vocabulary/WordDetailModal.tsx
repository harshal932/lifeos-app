import React, { useState } from 'react';
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
    beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    intermediate: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    advanced: 'bg-purple-500/10 text-purple-400 border-purple-500/20'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-white my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${difficultyColors[word.difficulty]}`}>
                {word.difficulty.toUpperCase()}
              </span>
              <span className="text-xs text-slate-400 italic font-mono bg-slate-800/80 px-2 py-0.5 rounded">
                {word.partOfSpeech}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight text-white">{word.word}</h2>
              {speechAvailable && (
                <button
                  onClick={() => handlePlayAudio(word.word)}
                  disabled={isPlayingAudio}
                  className="p-2 rounded-full bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 transition-colors"
                  title="Listen pronunciation"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>
            {word.pronunciation && (
              <p className="text-sm font-mono text-indigo-400 mt-1">/{word.pronunciation}/</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`p-2.5 rounded-xl border transition-colors ${
                isBookmarked
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Word'}
            >
              <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Marathi & English Meanings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-5">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" /> Marathi Meaning (मराठी अर्थ)
            </div>
            <p className="text-2xl font-bold text-amber-300 font-devanagari">{word.marathiMeaning}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="flex items-center gap-2 text-xs font-medium text-indigo-400 uppercase tracking-wider mb-1">
              <BookOpen className="w-4 h-4" /> English Meaning
            </div>
            <p className="text-base text-slate-200">{word.meaning}</p>
          </div>
        </div>

        {/* Examples Section */}
        <div className="space-y-3 mb-5">
          <h3 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">Practical Examples</h3>
          {word.examples.map((ex, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-medium text-slate-100 italic">"{ex.sentence}"</p>
                {speechAvailable && (
                  <button
                    onClick={() => handlePlayAudio(ex.sentence)}
                    className="p-1 rounded text-slate-400 hover:text-indigo-400 transition-colors flex-shrink-0"
                    title="Pronounce sentence"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-sm text-amber-200/90 font-devanagari">मराठी: {ex.marathiTranslation}</p>
            </div>
          ))}
        </div>

        {/* Synonyms & Antonyms */}
        {(word.synonyms.length > 0 || word.antonyms.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            {word.synonyms.length > 0 && (
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-2">Synonyms (समानार्थी)</span>
                <div className="flex flex-wrap gap-1.5">
                  {word.synonyms.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {word.antonyms.length > 0 && (
              <div>
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-2">Antonyms (विरुद्धार्थी)</span>
                <div className="flex flex-wrap gap-1.5">
                  {word.antonyms.map((a, i) => (
                    <span key={i} className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/10 text-rose-300 border border-rose-500/20">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Learning Status & Spaced Repetition Stats */}
        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 mb-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400">Learning Status</span>
            <div className="flex items-center gap-1.5">
              {(['learning', 'needs_revision', 'mastered'] as VocabLearningStatus[]).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                    currentStatus === status
                      ? status === 'mastered'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : status === 'needs_revision'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {progress && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/60 text-xs">
              <div>
                <span className="text-slate-400 block">Total Attempts</span>
                <span className="text-slate-100 font-semibold">{progress.attemptCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Correct / Wrong</span>
                <span className="text-emerald-400 font-semibold">{progress.correctCount}</span>
                <span className="text-slate-400"> / </span>
                <span className="text-rose-400 font-semibold">{progress.incorrectCount}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Consecutive Recalls</span>
                <span className="text-indigo-300 font-semibold">{progress.consecutiveSuccess}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Next Review</span>
                <span className="text-amber-300 font-semibold">{progress.nextReviewDate || 'Scheduled'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Personal Notes */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase text-slate-400">Personal Notes & Mnemonics</label>
            {notesSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved
              </span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add your personal memory hook, context, or custom sentence..."
            rows={2}
            className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
          <div className="flex justify-end">
            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Save Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
