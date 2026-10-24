import React, { useState, useEffect } from 'react';
import {
  VocabQuizCategory,
  VocabQuizDifficulty,
  VocabQuizQuestionType,
  VocabQuizQuestion,
  VocabQuizResult,
  VocabWord
} from '../../types';
import {
  getEligibleWords,
  generateQuizQuestions,
  saveQuizResult,
  getQuizHistory
} from '../../services/vocabService';
import { VOCAB_MAP } from '../../data/vocabularyData';
import { speakWord, isSpeechSupported } from '../../utils/speech';
import {
  Brain,
  Award,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Volume2,
  ChevronRight,
  Sparkles,
  HelpCircle,
  History,
  ArrowLeft,
  Calendar,
  AlertTriangle
} from 'lucide-react';

interface QuizPracticeViewProps {
  onBackToDashboard: () => void;
  onRefreshStats: () => void;
  initialCategory?: VocabQuizCategory;
}

type QuizScreenState = 'config' | 'playing' | 'results' | 'history';

export const QuizPracticeView: React.FC<QuizPracticeViewProps> = ({
  onBackToDashboard,
  onRefreshStats,
  initialCategory = 'mixed'
}) => {
  const [screen, setScreen] = useState<QuizScreenState>('config');

  // Configuration state
  const [category, setCategory] = useState<VocabQuizCategory>(initialCategory);
  const [difficulty, setDifficulty] = useState<VocabQuizDifficulty>('mixed');
  const [questionType, setQuestionType] = useState<VocabQuizQuestionType>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(5);
  const [randomize, setRandomize] = useState<boolean>(true);

  // Eligible count
  const [eligibleWords, setEligibleWords] = useState<VocabWord[]>([]);
  const [isLoadingEligible, setIsLoadingEligible] = useState(false);

  // Active quiz state
  const [questions, setQuestions] = useState<VocabQuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  // Result state
  const [lastResult, setLastResult] = useState<VocabQuizResult | null>(null);
  const [quizHistory, setQuizHistory] = useState<VocabQuizResult[]>([]);
  const [showMistakesOnly, setShowMistakesOnly] = useState(false);

  const speechSupported = isSpeechSupported();

  // Load eligible count whenever category or difficulty changes
  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoadingEligible(true);
      const words = await getEligibleWords(category, difficulty);
      if (isMounted) {
        setEligibleWords(words);
        setIsLoadingEligible(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [category, difficulty]);

  // Load history when history screen is opened
  const handleOpenHistory = async () => {
    const hist = await getQuizHistory();
    setQuizHistory(hist);
    setScreen('history');
  };

  // Start quiz
  const handleStartQuiz = (customWords?: VocabWord[]) => {
    const pool = customWords || eligibleWords;
    if (pool.length === 0) return;

    const countToUse = Math.min(questionCount, pool.length);
    const generated = generateQuizQuestions(pool, countToUse, questionType, randomize);

    setQuestions(generated);
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setUserAnswers({});
    setShowMistakesOnly(false);
    setScreen('playing');
  };

  // Submit current question answer
  const handleSubmitAnswer = () => {
    if (!selectedOption || isAnswerSubmitted) return;
    setIsAnswerSubmitted(true);
    const currentQ = questions[currentIndex];
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: selectedOption }));
  };

  // Next question or finish quiz
  const handleNextQuestion = async () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((idx) => idx + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
    } else {
      // Complete quiz
      const saved = await saveQuizResult(category, difficulty, questions, {
        ...userAnswers,
        [questions[currentIndex].id]: selectedOption || ''
      });
      setLastResult(saved);
      setScreen('results');
      onRefreshStats();
    }
  };

  // Retry only incorrect words from last quiz
  const handleRetryIncorrect = () => {
    if (!lastResult || lastResult.incorrectWordIds.length === 0) return;
    const retryWords = lastResult.incorrectWordIds
      .map((id) => VOCAB_MAP[id])
      .filter((w): w is VocabWord => Boolean(w));

    handleStartQuiz(retryWords);
  };

  const currentQ = questions[currentIndex];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* ======================================================== */}
      {/* 1. QUIZ CONFIGURATION SCREEN */}
      {/* ======================================================== */}
      {screen === 'config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-indigo-400" /> English Quiz Practice
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure your practice session to reinforce vocabulary with instant feedback
              </p>
            </div>
            <button
              onClick={handleOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              <History className="w-4 h-4 text-indigo-400" /> Past Quizzes
            </button>
          </div>

          {/* 1. Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              1. Quiz Category (6 Options)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'today', label: "Today's Words", desc: 'Introduced today' },
                { id: 'previous', label: 'Previous Words', desc: 'Introduced earlier' },
                { id: 'all_learned', label: 'All Learned Words', desc: 'All studied words' },
                { id: 'saved', label: 'Saved Words', desc: 'Bookmarked only' },
                { id: 'difficult', label: 'Difficult Words', desc: 'Needs revision' },
                { id: 'mixed', label: 'Mixed Practice', desc: 'Today & previous' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id as VocabQuizCategory)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    category === cat.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <p className="font-semibold text-sm">{cat.label}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              2. Difficulty Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['beginner', 'intermediate', 'advanced', 'mixed'] as VocabQuizDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                    difficulty === diff
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Question Count */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              3. Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                    questionCount === count
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>

          {/* 4. Question Type */}
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
              4. Question Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {[
                { id: 'mixed', label: 'Mixed Question Types (Recommended)' },
                { id: 'en_to_mr', label: 'English word to Marathi meaning' },
                { id: 'mr_to_en', label: 'Marathi meaning to English word' },
                { id: 'fill_blank', label: 'Fill in the blanks' },
                { id: 'synonym_antonym', label: 'Synonyms and antonyms' },
                { id: 'complete_sentence', label: 'Complete the sentence' }
              ].map((qt) => (
                <button
                  key={qt.id}
                  onClick={() => setQuestionType(qt.id as VocabQuizQuestionType)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    questionType === qt.id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white font-medium'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Randomize toggle & Eligible Count Notice */}
          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                <input
                  type="checkbox"
                  checked={randomize}
                  onChange={(e) => setRandomize(e.target.checked)}
                  className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                />
                Randomize questions and answer choices
              </label>
            </div>

            <div className="text-slate-400">
              Eligible words available:{' '}
              <span className="font-bold text-indigo-400">
                {isLoadingEligible ? '...' : eligibleWords.length}
              </span>
            </div>
          </div>

          {/* Start Quiz Action */}
          <div>
            {eligibleWords.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>
                  No eligible words found for this category and difficulty yet. Try selecting "Mixed Practice" or explore words on the dashboard.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {eligibleWords.length < questionCount && (
                  <p className="text-xs text-amber-400 italic">
                    Note: Only {eligibleWords.length} eligible words available. A shorter quiz with {eligibleWords.length} questions will be generated.
                  </p>
                )}
                <button
                  onClick={() => handleStartQuiz()}
                  className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Start Quiz Now ({Math.min(questionCount, eligibleWords.length)} Questions)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ACTIVE QUIZ PLAYER SCREEN */}
      {/* ======================================================== */}
      {screen === 'playing' && currentQ && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <span className="text-xs uppercase font-semibold text-slate-400">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentQ.questionType.replace('_', ' ')}
              </span>
              <button
                onClick={() => setScreen('config')}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Quit
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-indigo-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h3 className="text-xl md:text-2xl font-bold text-white whitespace-pre-line leading-relaxed">
              {currentQ.question}
            </h3>
            {speechSupported && VOCAB_MAP[currentQ.wordId] && (
              <button
                onClick={() => speakWord(VOCAB_MAP[currentQ.wordId].word)}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 font-medium transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen Audio
              </button>
            )}
          </div>

          {/* Options (4 plausible choices) */}
          <div className="space-y-3">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQ.correctAnswer;

              let btnStyle = 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-500';

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                } else {
                  btnStyle = 'bg-slate-800/40 border-slate-800 text-slate-500';
                }
              } else if (isSelected) {
                btnStyle = 'bg-indigo-600/30 border-indigo-500 text-white font-medium';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isAnswerSubmitted && setSelectedOption(option)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-xl border text-left text-sm md:text-base flex items-center justify-between transition-all ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-mono font-bold text-slate-400">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-medium">{option}</span>
                  </div>

                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner (revealed after submission) */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-xl bg-slate-800/90 border border-slate-700 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                {selectedOption === currentQ.correctAnswer ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                    <XCircle className="w-4 h-4" /> Incorrect. Correct was: {currentQ.correctAnswer}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-devanagari">
                {currentQ.explanation}
              </p>
              {currentQ.example && (
                <p className="text-xs text-indigo-300 italic border-t border-slate-700/60 pt-1.5">
                  Example: "{currentQ.example}"
                </p>
              )}
            </div>
          )}

          {/* Submit / Next Button */}
          <div className="pt-2">
            {!isAnswerSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                {currentIndex + 1 < questions.length ? (
                  <>
                    Next Question <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    View Quiz Results <Award className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. QUIZ RESULTS SCREEN */}
      {/* ======================================================== */}
      {screen === 'results' && lastResult && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Quiz Completed!</h2>
            <p className="text-xs text-slate-400">
              Results saved to your personal learning history
            </p>
          </div>

          {/* Score Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 block">Total Questions</span>
              <span className="text-xl font-bold text-white">{lastResult.totalQuestions}</span>
            </div>
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 block">Correct Answers</span>
              <span className="text-xl font-bold text-emerald-400">{lastResult.score}</span>
            </div>
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 block">Incorrect Answers</span>
              <span className="text-xl font-bold text-rose-400">
                {lastResult.totalQuestions - lastResult.score}
              </span>
            </div>
            <div className="p-3.5 bg-slate-800/80 rounded-xl border border-slate-700">
              <span className="text-xs text-slate-400 block">Score %</span>
              <span className="text-xl font-bold text-indigo-400">{lastResult.percentage}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {lastResult.incorrectWordIds.length > 0 && (
              <button
                onClick={handleRetryIncorrect}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Retry Incorrect Words ({lastResult.incorrectWordIds.length})
              </button>
            )}

            <button
              onClick={() => setShowMistakesOnly(!showMistakesOnly)}
              className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              {showMistakesOnly ? 'Show All Questions' : 'Review Mistakes'}
            </button>

            <button
              onClick={() => setScreen('config')}
              className="py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm transition-all"
            >
              New Quiz
            </button>
          </div>

          {/* Questions Review List */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-semibold uppercase text-slate-400 tracking-wider">
              {showMistakesOnly ? 'Mistakes Review' : 'Detailed Question Review'}
            </h3>

            {lastResult.questions
              .filter((q) => {
                if (!showMistakesOnly) return true;
                return lastResult.userAnswers[q.id] !== q.correctAnswer;
              })
              .map((q, idx) => {
                const userAns = lastResult.userAnswers[q.id];
                const isCorrect = userAns === q.correctAnswer;

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border space-y-2 text-xs sm:text-sm ${
                      isCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-rose-500/5 border-rose-500/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-slate-200">{q.question}</p>
                      {isCorrect ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1 flex-shrink-0">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center gap-1 flex-shrink-0">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-slate-400">Your Answer: </span>
                        <span className={isCorrect ? 'text-emerald-300 font-medium' : 'text-rose-300 font-medium'}>
                          {userAns || '(No answer)'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span className="text-slate-400">Correct Answer: </span>
                          <span className="text-emerald-300 font-medium">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-amber-200/90 font-devanagari border-t border-slate-800/80 pt-1.5">
                      मराठी स्पष्टीकरण: {q.explanation}
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. PAST QUIZ HISTORY SCREEN */}
      {/* ======================================================== */}
      {screen === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button
              onClick={() => setScreen('config')}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Quiz Setup
            </button>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" /> Previous Quiz History
            </h2>
          </div>

          {quizHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No previous quizzes recorded yet. Take your first quiz to track your improvement over time!
            </div>
          ) : (
            <div className="space-y-3">
              {quizHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white capitalize">
                        {item.category.replace('_', ' ')} Quiz
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-700 text-slate-300">
                        {item.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.totalQuestions} Questions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-lg font-bold text-indigo-300">
                        {item.score}/{item.totalQuestions}
                      </span>
                      <span className="text-xs text-slate-400 block">{item.percentage}%</span>
                    </div>
                    <button
                      onClick={() => {
                        setLastResult(item);
                        setScreen('results');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 text-xs font-medium"
                    >
                      View Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
