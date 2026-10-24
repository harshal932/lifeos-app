import { db } from '../db';
import { VOCABULARY_DATASET, VOCAB_MAP } from '../data/vocabularyData';
import {
  VocabWord,
  VocabProgress,
  VocabQuizCategory,
  VocabQuizDifficulty,
  VocabQuizQuestionType,
  VocabQuizQuestion,
  VocabQuizResult,
  VocabLearningStatus
} from '../types';

/**
 * Returns today's local date string formatted as YYYY-MM-DD.
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add days to a YYYY-MM-DD date string.
 */
export function addDaysToDateString(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return getLocalDateString(d);
}

/**
 * Deterministically get the Word of the Day for any date string.
 * This guarantees the exact same word is shown throughout the day across reloads.
 */
export function getWordOfTheDay(dateStr: string = getLocalDateString()): VocabWord {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash << 5) - hash + dateStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % VOCABULARY_DATASET.length;
  return VOCABULARY_DATASET[index];
}

/**
 * Initialize or get progress record for a word.
 */
export async function getOrCreateWordProgress(
  wordId: string,
  introducedDate?: string
): Promise<VocabProgress> {
  const existing = await db.vocabProgress.get(wordId);
  if (existing) {
    return existing;
  }

  const today = introducedDate || getLocalDateString();
  const newRecord: VocabProgress = {
    wordId,
    status: 'learning',
    attemptCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    consecutiveSuccess: 0,
    introducedDate: today,
    nextReviewDate: addDaysToDateString(today, 1),
    isBookmarked: false,
    notes: ''
  };

  await db.vocabProgress.add(newRecord);
  return newRecord;
}

/**
 * Ensures Word of the Day is marked as introduced for today.
 */
export async function ensureWordOfTheDayIntroduced(dateStr: string = getLocalDateString()): Promise<VocabProgress> {
  const wotd = getWordOfTheDay(dateStr);
  return await getOrCreateWordProgress(wotd.id, dateStr);
}

/**
 * Get map of all progress records keyed by wordId.
 */
export async function getAllProgressMap(): Promise<Record<string, VocabProgress>> {
  const all = await db.vocabProgress.toArray();
  const map: Record<string, VocabProgress> = {};
  for (const item of all) {
    map[item.wordId] = item;
  }
  return map;
}

/**
 * Toggle bookmark status.
 */
export async function toggleBookmark(wordId: string): Promise<boolean> {
  const progress = await getOrCreateWordProgress(wordId);
  const updatedStatus = !progress.isBookmarked;
  await db.vocabProgress.update(wordId, { isBookmarked: updatedStatus });
  return updatedStatus;
}

/**
 * Update personal notes for a word.
 */
export async function updateWordNotes(wordId: string, notes: string): Promise<void> {
  await getOrCreateWordProgress(wordId);
  await db.vocabProgress.update(wordId, { notes });
}

/**
 * Manually update learning status.
 */
export async function updateWordStatus(wordId: string, status: VocabLearningStatus): Promise<void> {
  await getOrCreateWordProgress(wordId);
  await db.vocabProgress.update(wordId, { status });
}

/**
 * Spaced repetition schedule intervals in days.
 * 1 -> 3 -> 7 -> 14 -> 30 days
 */
const SRS_INTERVALS = [1, 3, 7, 14, 30];

/**
 * Record a flashcard or quiz recall attempt.
 * Implements strict mastery rule:
 * Must have consecutiveSuccess >= 3 across multiple attempts to reach 'mastered'.
 */
export async function recordRecallAttempt(
  wordId: string,
  remembered: boolean
): Promise<VocabProgress> {
  const progress = await getOrCreateWordProgress(wordId);
  const today = getLocalDateString();

  let nextConsecutive = remembered ? progress.consecutiveSuccess + 1 : 0;
  let nextStatus: VocabLearningStatus = progress.status;

  let intervalDays = 1;
  if (remembered) {
    const intervalIdx = Math.min(Math.max(0, nextConsecutive - 1), SRS_INTERVALS.length - 1);
    intervalDays = SRS_INTERVALS[intervalIdx];

    if (nextConsecutive >= 3) {
      nextStatus = 'mastered';
    } else {
      nextStatus = 'learning';
    }
  } else {
    intervalDays = 1; // Overdue review tomorrow
    nextStatus = 'needs_revision';
  }

  const updated: VocabProgress = {
    ...progress,
    attemptCount: progress.attemptCount + 1,
    correctCount: progress.correctCount + (remembered ? 1 : 0),
    incorrectCount: progress.incorrectCount + (remembered ? 0 : 1),
    consecutiveSuccess: nextConsecutive,
    lastRevisionDate: today,
    nextReviewDate: addDaysToDateString(today, intervalDays),
    status: nextStatus
  };

  await db.vocabProgress.put(updated);
  return updated;
}

/**
 * Fetch eligible words for a quiz based on category and difficulty.
 */
export async function getEligibleWords(
  category: VocabQuizCategory,
  difficulty: VocabQuizDifficulty
): Promise<VocabWord[]> {
  const today = getLocalDateString();
  const allProgress = await db.vocabProgress.toArray();
  const progressMap = new Map<string, VocabProgress>(allProgress.map((p) => [p.wordId, p]));

  // Ensure today's WOTD is tracked
  const wotd = getWordOfTheDay(today);
  if (!progressMap.has(wotd.id)) {
    const initial = await ensureWordOfTheDayIntroduced(today);
    progressMap.set(wotd.id, initial);
  }

  let candidates: VocabWord[] = [];

  switch (category) {
    case 'today':
      candidates = VOCABULARY_DATASET.filter((w) => {
        const p = progressMap.get(w.id);
        return p && p.introducedDate === today;
      });
      break;

    case 'previous':
      candidates = VOCABULARY_DATASET.filter((w) => {
        const p = progressMap.get(w.id);
        return p && p.introducedDate && p.introducedDate < today;
      });
      break;

    case 'all_learned':
      candidates = VOCABULARY_DATASET.filter((w) => {
        const p = progressMap.get(w.id);
        return p && (p.attemptCount > 0 || p.introducedDate != null);
      });
      break;

    case 'saved':
      candidates = VOCABULARY_DATASET.filter((w) => {
        const p = progressMap.get(w.id);
        return p && p.isBookmarked;
      });
      break;

    case 'difficult':
      candidates = VOCABULARY_DATASET.filter((w) => {
        const p = progressMap.get(w.id);
        if (!p) return false;
        // Frequently incorrect or marked as needs_revision with at least one mistake
        return p.status === 'needs_revision' || (p.incorrectCount > 0 && p.incorrectCount >= p.correctCount);
      });
      break;

    case 'mixed':
    default:
      // Combine eligible words from today and previous learning sessions
      candidates = VOCABULARY_DATASET.filter((w) => {
        const p = progressMap.get(w.id);
        return p && (p.attemptCount > 0 || p.introducedDate != null);
      });
      break;
  }

  // Filter by difficulty if not 'mixed'
  if (difficulty !== 'mixed') {
    candidates = candidates.filter((w) => w.difficulty === difficulty);
  }

  return candidates;
}

/**
 * Generate 4 plausible distinct choices for a question.
 */
function generateFourChoices(
  correctAnswer: string,
  distractorPool: string[],
  randomize: boolean
): string[] {
  const filtered = Array.from(new Set(distractorPool.filter((item) => item && item !== correctAnswer)));
  // Shuffle distractors
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  const choices = [correctAnswer, ...filtered.slice(0, 3)];

  if (randomize) {
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
  }

  return choices;
}

/**
 * Generate multiple-choice quiz questions from eligible words.
 */
export function generateQuizQuestions(
  words: VocabWord[],
  questionCount: number,
  questionType: VocabQuizQuestionType,
  randomize: boolean = true
): VocabQuizQuestion[] {
  if (words.length === 0) return [];

  // Pick question words (limit to questionCount or words.length)
  let selectedWords = [...words];
  if (randomize) {
    for (let i = selectedWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [selectedWords[i], selectedWords[j]] = [selectedWords[j], selectedWords[i]];
    }
  }

  const actualCount = Math.min(questionCount, selectedWords.length);
  selectedWords = selectedWords.slice(0, actualCount);

  // Pools for generating plausible options
  const allEnglishWords = VOCABULARY_DATASET.map((w) => w.word);
  const allMarathiMeanings = VOCABULARY_DATASET.map((w) => w.marathiMeaning);

  const availableTypes: VocabQuizQuestionType[] = [
    'en_to_mr',
    'mr_to_en',
    'fill_blank',
    'synonym_antonym',
    'complete_sentence'
  ];

  return selectedWords.map((word, index) => {
    let qType = questionType;
    if (qType === 'mixed') {
      qType = availableTypes[index % availableTypes.length];
    }

    let question = '';
    let correctAnswer = '';
    let options: string[] = [];
    const explanation = `${word.word} (${word.partOfSpeech}): ${word.meaning} — मराठी अर्थ: ${word.marathiMeaning}`;
    const example = word.examples[0]?.sentence;

    switch (qType) {
      case 'en_to_mr': {
        question = `What is the Marathi meaning of "${word.word}"?`;
        correctAnswer = word.marathiMeaning;
        options = generateFourChoices(correctAnswer, allMarathiMeanings, randomize);
        break;
      }

      case 'mr_to_en': {
        question = `Select the English word for "${word.marathiMeaning}" (${word.meaning}):`;
        correctAnswer = word.word;
        options = generateFourChoices(correctAnswer, allEnglishWords, randomize);
        break;
      }

      case 'fill_blank': {
        const primaryEx = word.examples[0] || { sentence: `He showed great ${word.word}.` };
        // Replace the word in sentence with blank (case-insensitive)
        const regex = new RegExp(`\\b${word.word}\\b`, 'i');
        const blankedSentence = primaryEx.sentence.replace(regex, '______');
        question = `Fill in the blank:\n"${blankedSentence}"`;
        correctAnswer = word.word;
        options = generateFourChoices(correctAnswer, allEnglishWords, randomize);
        break;
      }

      case 'synonym_antonym': {
        if (word.synonyms.length > 0 && Math.random() > 0.4) {
          const syn = word.synonyms[0];
          question = `Choose a SYNONYM for "${word.word}":`;
          correctAnswer = syn;
          const otherSyns = VOCABULARY_DATASET.flatMap((w) => w.synonyms);
          options = generateFourChoices(correctAnswer, otherSyns, randomize);
        } else if (word.antonyms.length > 0) {
          const ant = word.antonyms[0];
          question = `Choose an ANTONYM (opposite) for "${word.word}":`;
          correctAnswer = ant;
          const otherAnts = VOCABULARY_DATASET.flatMap((w) => w.antonyms);
          options = generateFourChoices(correctAnswer, otherAnts, randomize);
        } else {
          // Fallback to English to Marathi if no synonyms/antonyms
          question = `What is the meaning of "${word.word}"?`;
          correctAnswer = word.marathiMeaning;
          options = generateFourChoices(correctAnswer, allMarathiMeanings, randomize);
        }
        break;
      }

      case 'complete_sentence':
      default: {
        const ex = word.examples[1] || word.examples[0];
        const sentenceBlank = ex.sentence.replace(new RegExp(`\\b${word.word}\\b`, 'i'), '_______');
        question = `Complete the sentence with the most appropriate word:\n"${sentenceBlank}"`;
        correctAnswer = word.word;
        options = generateFourChoices(correctAnswer, allEnglishWords, randomize);
        break;
      }
    }

    return {
      id: `q-${word.id}-${index}-${Date.now()}`,
      wordId: word.id,
      question,
      questionType: qType,
      options,
      correctAnswer,
      explanation,
      example
    };
  });
}

/**
 * Save quiz results and update individual word progress.
 */
export async function saveQuizResult(
  category: VocabQuizCategory,
  difficulty: VocabQuizDifficulty,
  questions: VocabQuizQuestion[],
  userAnswers: Record<string, string>
): Promise<VocabQuizResult> {
  let score = 0;
  const incorrectWordIds: string[] = [];

  for (const q of questions) {
    const selected = userAnswers[q.id];
    const isCorrect = selected === q.correctAnswer;
    if (isCorrect) {
      score++;
    } else {
      if (!incorrectWordIds.includes(q.wordId)) {
        incorrectWordIds.push(q.wordId);
      }
    }
    // Update spaced repetition progress for this word
    await recordRecallAttempt(q.wordId, isCorrect);
  }

  const result: VocabQuizResult = {
    id: `quiz-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    date: getLocalDateString(),
    category,
    difficulty,
    totalQuestions: questions.length,
    score,
    percentage: questions.length > 0 ? Math.round((score / questions.length) * 100) : 0,
    questions,
    userAnswers,
    incorrectWordIds,
    completedAt: new Date().toISOString()
  };

  await db.vocabQuizHistory.add(result);
  return result;
}

/**
 * Get past quiz results, sorted by date descending.
 */
export async function getQuizHistory(): Promise<VocabQuizResult[]> {
  const history = await db.vocabQuizHistory.toArray();
  return history.sort((a, b) => b.completedAt.localeCompare(a.completedAt));
}

/**
 * Statistics for the dashboard.
 */
export interface VocabStats {
  totalLearned: number;
  savedWordsCount: number;
  difficultWordsCount: number;
  masteredWordsCount: number;
  todayLearnedCount: number;
  dailyGoal: number;
  dueForReviewCount: number;
}

export async function getVocabStats(dailyGoal: number = 5): Promise<VocabStats> {
  const today = getLocalDateString();
  const all = await db.vocabProgress.toArray();

  let totalLearned = 0;
  let savedWordsCount = 0;
  let difficultWordsCount = 0;
  let masteredWordsCount = 0;
  let todayLearnedCount = 0;
  let dueForReviewCount = 0;

  for (const p of all) {
    if (p.attemptCount > 0 || p.introducedDate != null) {
      totalLearned++;
    }
    if (p.isBookmarked) {
      savedWordsCount++;
    }
    if (p.status === 'needs_revision' || (p.incorrectCount > 0 && p.incorrectCount >= p.correctCount)) {
      difficultWordsCount++;
    }
    if (p.status === 'mastered') {
      masteredWordsCount++;
    }
    // Today's progress: words introduced today or revised today
    if (p.introducedDate === today || p.lastRevisionDate === today) {
      todayLearnedCount++;
    }
    // Overdue or due today
    if (p.nextReviewDate && p.nextReviewDate <= today) {
      dueForReviewCount++;
    }
  }

  return {
    totalLearned,
    savedWordsCount,
    difficultWordsCount,
    masteredWordsCount,
    todayLearnedCount,
    dailyGoal,
    dueForReviewCount
  };
}
