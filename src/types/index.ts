export type TransactionType = 'expense' | 'income' | 'refund' | 'transfer';

export interface Habit {
  id: string;
  name: string;
  description?: string;
  category: string;
  icon: string;
  color: string;
  frequency: 'daily' | 'weekdays' | 'custom';
  selectedDays: number[]; // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  target?: number;
  targetUnit?: string;
  createdAt: string;
  isArchived: boolean;
  reminderTime?: string;
  notes?: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO string
  value?: number;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amountPaise: number; // Integer paise: ₹100.50 = 10050 paise
  category: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: string;
  description: string;
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string; // usually YYYY-MM
  month: string; // YYYY-MM
  overallBudgetPaise: number;
  categoryBudgets: Record<string, number>; // category -> amount in paise
  warningThresholds: number[]; // default: [50, 75, 90, 100]
  updatedAt: string;
}

export interface StudySession {
  id: string;
  subject: string;
  startTime: string; // ISO
  endTime?: string; // ISO
  durationSeconds: number;
  date: string; // YYYY-MM-DD
  notes?: string;
  completed: boolean;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title?: string;
  reflections: string;
  goals?: string;
  achievements?: string;
  lessonsLearned?: string;
  mood?: 1 | 2 | 3 | 4 | 5; // 1 = low, 5 = excellent
  createdAt: string;
  updatedAt: string;
}

export interface UserHoldings {
  cashPaise: number;
  shareMarketPaise: number;
  savedPaise: number;
  updatedAt?: string;
}

export type VocabDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type VocabLearningStatus = 'new' | 'learning' | 'needs_revision' | 'mastered';

export interface VocabExample {
  english: string;
  marathi: string;
  sentence: string;
  marathiTranslation: string;
}

export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: string;
  simpleMeaning: string;
  meaning: string;
  marathiMeaning: string;
  pronunciation: string;
  examples: VocabExample[];
  synonyms: string[];
  antonyms: string[];
  difficulty: VocabDifficulty;
}

export interface VocabProgress {
  wordId: string;
  status: VocabLearningStatus;
  isBookmarked: boolean;
  personalNotes?: string;
  notes?: string;
  attempts?: number;
  attemptCount: number;
  correctCount: number;
  incorrectCount: number;
  consecutiveSuccess: number;
  introducedDate: string; // YYYY-MM-DD
  lastReviewedAt?: string; // ISO string
  lastRevisionDate?: string;
  nextReviewDate?: string; // YYYY-MM-DD
}

export type VocabQuizCategory = 'today' | 'previous' | 'all_learned' | 'all' | 'saved' | 'difficult' | 'mixed';
export type VocabQuizDifficulty = VocabDifficulty | 'mixed';
export type VocabQuizQuestionType =
  | 'en_to_mr'
  | 'mr_to_en'
  | 'fill_blank'
  | 'synonym_antonym'
  | 'complete_sentence'
  | 'mixed';

export interface VocabQuizQuestion {
  id: string;
  wordId: string;
  question: string;
  questionType: VocabQuizQuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
  example?: string;
}

export interface VocabQuizResult {
  id: string;
  date: string; // YYYY-MM-DD
  completedAt: string; // ISO string
  category: VocabQuizCategory;
  difficulty: VocabQuizDifficulty;
  totalQuestions: number;
  score: number;
  percentage: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
  scorePercentage?: number;
  questions: VocabQuizQuestion[];
  userAnswers: Record<string, string>;
  incorrectWordIds: string[];
  questionDetails?: Array<{
    question: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    word: string;
    marathiMeaning: string;
    explanation: string;
  }>;
}

export interface AppSettings {
  id: string; // 'current'
  theme: 'light' | 'dark' | 'system';
  currency: string;
  currencySymbol: string;
  weekStartDay: 0 | 1; // 0 = Sunday, 1 = Monday
  dateFormat: string;
  savingsGoalPaise: number;
  studySubjects: string[];
  habitCategories: string[];
  expenseCategories: string[];
  incomeCategories: string[];
  paymentMethods: string[];
  budgetWarningThresholds: number[];
  holdings?: UserHoldings;
  dailyVocabGoal?: number; // default: 5
}

export interface HabitStreakStats {
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  weeklyCompletionRate: number; // 0 to 100
  monthlyCompletionRate: number; // 0 to 100
  overallConsistency: number; // 0 to 100
}

export interface BackupData {
  version: number;
  exportedAt: string;
  habits: Habit[];
  habitCompletions: HabitCompletion[];
  transactions: Transaction[];
  budgets: Budget[];
  studySessions: StudySession[];
  journalEntries: JournalEntry[];
  settings: AppSettings;
  vocabProgress?: VocabProgress[];
  vocabQuizHistory?: VocabQuizResult[];
}
