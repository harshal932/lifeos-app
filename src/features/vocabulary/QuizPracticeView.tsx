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
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* 1. QUIZ CONFIGURATION SCREEN */}
      {/* ======================================================== */}
      {screen === 'config' && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
            <div>
              <h2 className="text-2xl font-black text-foreground flex items-center gap-2">
                <Brain className="w-6 h-6 text-primary" /> English Quiz Practice
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Configure your practice session to reinforce vocabulary with instant feedback
              </p>
            </div>
            <button
              onClick={handleOpenHistory}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground text-xs font-bold transition-all active:scale-95 self-start sm:self-auto"
            >
              <History className="w-4 h-4 text-primary" /> Past Quizzes
            </button>
          </div>

          {/* 1. Category Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
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
                  className={`p-3.5 rounded-2xl border text-left transition-all active:scale-95 ${
                    category === cat.id
                      ? 'bg-primary/10 border-primary text-foreground shadow-sm'
                      : 'bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary/70'
                  }`}
                >
                  <p className="font-bold text-sm text-foreground">{cat.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{cat.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Difficulty */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              2. Difficulty Level
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['beginner', 'intermediate', 'advanced', 'mixed'] as VocabQuizDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold capitalize transition-all active:scale-95 ${
                    difficulty === diff
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Question Count */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
              3. Number of Questions
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 15, 20].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 ${
                    questionCount === count
                      ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                      : 'bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>

          {/* 4. Question Type */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
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
                  className={`p-3 rounded-2xl border text-left transition-all active:scale-98 ${
                    questionType === qt.id
                      ? 'bg-primary/10 border-primary text-foreground font-bold'
                      : 'bg-secondary/40 border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  {qt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Randomize toggle & Eligible Count Notice */}
          <div className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <label className="flex items-center gap-2.5 cursor-pointer text-foreground font-medium">
              <input
                type="checkbox"
                checked={randomize}
                onChange={(e) => setRandomize(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
              />
              Randomize questions and answer choices
            </label>

            <div className="text-muted-foreground font-semibold">
              Eligible words:{' '}
              <span className="font-bold text-primary">
                {isLoadingEligible ? '...' : eligibleWords.length}
              </span>
            </div>
          </div>

          {/* Start Quiz Action */}
          <div>
            {eligibleWords.length === 0 ? (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  No eligible words found for this category and difficulty yet. Try selecting "Mixed Practice" or explore words on the dashboard.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {eligibleWords.length < questionCount && (
                  <p className="text-xs text-amber-500 font-semibold italic">
                    Note: Only {eligibleWords.length} eligible words available. A shorter quiz with {eligibleWords.length} questions will be generated.
                  </p>
                )}
                <Button
                  onClick={() => handleStartQuiz()}
                  className="w-full py-3.5 text-sm font-bold shadow-md shadow-primary/25 rounded-2xl gap-2"
                >
                  <Sparkles className="w-4 h-4" /> Start Quiz Now ({Math.min(questionCount, eligibleWords.length)} Questions)
                </Button>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* 2. ACTIVE QUIZ PLAYER SCREEN */}
      {/* ======================================================== */}
      {screen === 'playing' && currentQ && (
        <Card className="p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 pb-3">
            <span className="text-xs uppercase font-bold text-muted-foreground">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                {currentQ.questionType.replace('_', ' ')}
              </span>
              <button
                onClick={() => setScreen('config')}
                className="text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Quit
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <div className="py-2">
            <h3 className="text-xl sm:text-2xl font-black text-foreground whitespace-pre-line leading-relaxed">
              {currentQ.question}
            </h3>
            {speechSupported && VOCAB_MAP[currentQ.wordId] && (
              <button
                onClick={() => speakWord(VOCAB_MAP[currentQ.wordId].word)}
                className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-secondary hover:bg-secondary/80 text-xs text-primary font-bold transition-all active:scale-95"
              >
                <Volume2 className="w-3.5 h-3.5" /> Listen Audio
              </button>
            )}
          </div>

          {/* Options (4 plausible choices) */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = option === currentQ.correctAnswer;

              let btnStyle = 'bg-secondary/40 border-border/70 text-foreground hover:border-primary/50';

              if (isAnswerSubmitted) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-destructive/15 border-destructive text-destructive font-bold';
                } else {
                  btnStyle = 'bg-secondary/20 border-border/30 text-muted-foreground opacity-60';
                }
              } else if (isSelected) {
                btnStyle = 'bg-primary/10 border-primary text-foreground font-bold shadow-xs';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !isAnswerSubmitted && setSelectedOption(option)}
                  disabled={isAnswerSubmitted}
                  className={`w-full p-4 rounded-2xl border text-left text-sm sm:text-base flex items-center justify-between transition-all active:scale-99 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-background border border-border/70 flex items-center justify-center text-xs font-mono font-bold text-muted-foreground">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="font-semibold">{option}</span>
                  </div>

                  {isAnswerSubmitted && isCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !isCorrect && (
                    <XCircle className="w-5 h-5 text-destructive shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner (revealed after submission) */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-2xl bg-secondary/50 border border-border/70 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                {selectedOption === currentQ.correctAnswer ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                    <CheckCircle2 className="w-4 h-4" /> Correct Answer!
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-destructive">
                    <XCircle className="w-4 h-4" /> Incorrect. Correct was: {currentQ.correctAnswer}
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-foreground/90 font-devanagari font-medium">
                {currentQ.explanation}
              </p>
              {currentQ.example && (
                <p className="text-xs text-primary italic border-t border-border/50 pt-1.5">
                  Example: "{currentQ.example}"
                </p>
              )}
            </div>
          )}

          {/* Submit / Next Button */}
          <div className="pt-2">
            {!isAnswerSubmitted ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={!selectedOption}
                className="w-full py-3.5 text-sm font-bold shadow-md shadow-primary/20 rounded-2xl"
              >
                Submit Answer
              </Button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
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
        </Card>
      )}

      {/* ======================================================== */}
      {/* 3. QUIZ RESULTS SCREEN */}
      {/* ======================================================== */}
      {screen === 'results' && lastResult && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center mx-auto mb-2">
              <Award className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Quiz Completed!</h2>
            <p className="text-xs text-muted-foreground">
              Results saved to your personal learning history.
            </p>
          </div>

          {/* Score Card */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-xs text-muted-foreground block font-semibold">Total Questions</span>
              <span className="text-xl font-black text-foreground">{lastResult.totalQuestions}</span>
            </div>
            <div className="p-3.5 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-xs text-muted-foreground block font-semibold">Correct</span>
              <span className="text-xl font-black text-emerald-500">{lastResult.score}</span>
            </div>
            <div className="p-3.5 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-xs text-muted-foreground block font-semibold">Incorrect</span>
              <span className="text-xl font-black text-destructive">
                {lastResult.totalQuestions - lastResult.score}
              </span>
            </div>
            <div className="p-3.5 bg-secondary/50 rounded-2xl border border-border/60">
              <span className="text-xs text-muted-foreground block font-semibold">Score %</span>
              <span className="text-xl font-black text-primary">{lastResult.percentage}%</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {lastResult.incorrectWordIds.length > 0 && (
              <Button
                variant="outline"
                onClick={handleRetryIncorrect}
                className="flex-1 border-amber-500/30 text-amber-500 hover:bg-amber-500/10 text-xs sm:text-sm font-bold gap-1.5"
              >
                <RotateCcw className="w-4 h-4" /> Retry Mistakes ({lastResult.incorrectWordIds.length})
              </Button>
            )}

            <Button
              variant="secondary"
              onClick={() => setShowMistakesOnly(!showMistakesOnly)}
              className="flex-1 text-xs sm:text-sm font-bold"
            >
              {showMistakesOnly ? 'Show All' : 'Review Mistakes'}
            </Button>

            <Button
              onClick={() => setScreen('config')}
              className="py-2.5 px-5 text-xs sm:text-sm font-bold"
            >
              New Quiz
            </Button>
          </div>

          {/* Questions Review List */}
          <div className="space-y-3 pt-4 border-t border-border/50">
            <h3 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
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
                    className={`p-4 rounded-2xl border space-y-2 text-xs sm:text-sm ${
                      isCorrect
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-destructive/5 border-destructive/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold text-foreground">{q.question}</p>
                      {isCorrect ? (
                        <span className="text-emerald-500 font-bold flex items-center gap-1 shrink-0 text-xs">
                          <CheckCircle2 className="w-4 h-4" /> Correct
                        </span>
                      ) : (
                        <span className="text-destructive font-bold flex items-center gap-1 shrink-0 text-xs">
                          <XCircle className="w-4 h-4" /> Incorrect
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div>
                        <span className="text-muted-foreground">Your Answer: </span>
                        <span className={isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-destructive font-bold'}>
                          {userAns || '(No answer)'}
                        </span>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span className="text-muted-foreground">Correct: </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">{q.correctAnswer}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-xs text-amber-600 dark:text-amber-300 font-devanagari border-t border-border/40 pt-1.5 font-medium">
                      मराठी स्पष्टीकरण: {q.explanation}
                    </p>
                  </div>
                );
              })}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* 4. PAST QUIZ HISTORY SCREEN */}
      {/* ======================================================== */}
      {screen === 'history' && (
        <Card className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-border/50 pb-4">
            <button
              onClick={() => setScreen('config')}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Setup
            </button>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <History className="w-4 h-4 text-primary" /> Past Quiz History
            </h2>
          </div>

          {quizHistory.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-xs">
              No previous quizzes recorded yet. Take your first quiz to track your improvement over time!
            </div>
          ) : (
            <div className="space-y-2.5">
              {quizHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl bg-secondary/40 border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground capitalize">
                        {item.category.replace('_', ' ')} Quiz
                      </span>
                      <span className="px-2 py-0.5 rounded-lg text-[10px] uppercase font-bold bg-secondary text-foreground">
                        {item.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{item.date}</span>
                      <span>•</span>
                      <span>{item.totalQuestions} Questions</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <div className="text-right">
                      <span className="text-lg font-black text-foreground">
                        {item.score}/{item.totalQuestions}
                      </span>
                      <span className="text-xs text-muted-foreground block font-bold">{item.percentage}%</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setLastResult(item);
                        setScreen('results');
                      }}
                      className="text-xs"
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
