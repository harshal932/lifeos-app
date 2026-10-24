import { describe, it, expect, beforeEach } from 'vitest';
import { VOCABULARY_DATASET, VOCAB_MAP } from '../data/vocabularyData';
import {
  getWordOfTheDay,
  generateQuizQuestions,
  getLocalDateString,
  addDaysToDateString,
  recordRecallAttempt,
  getOrCreateWordProgress
} from '../services/vocabService';
import { db } from '../db';

describe('English Vocabulary Learning System', () => {
  beforeEach(async () => {
    await db.vocabProgress.clear();
    await db.vocabQuizHistory.clear();
  });

  describe('Vocabulary Dataset Integrity', () => {
    it('contains at least 100 distinct vocabulary entries', () => {
      expect(VOCABULARY_DATASET.length).toBeGreaterThanOrEqual(100);
    });

    it('has unique IDs and distinct English words without duplicates', () => {
      const ids = new Set<string>();
      const words = new Set<string>();

      for (const item of VOCABULARY_DATASET) {
        expect(ids.has(item.id)).toBe(false);
        ids.add(item.id);

        const lowerWord = item.word.toLowerCase();
        expect(words.has(lowerWord)).toBe(false);
        words.add(lowerWord);
      }
    });

    it('has accurate required fields for every word', () => {
      for (const item of VOCABULARY_DATASET) {
        expect(item.id).toBeTruthy();
        expect(item.word).toBeTruthy();
        expect(item.partOfSpeech).toBeTruthy();
        expect(item.meaning).toBeTruthy();
        expect(item.marathiMeaning).toBeTruthy();
        // Devanagari Marathi script check
        expect(/[\u0900-\u097F]/.test(item.marathiMeaning)).toBe(true);

        // At least 2 practical example sentences with Marathi translations
        expect(item.examples.length).toBeGreaterThanOrEqual(2);
        for (const ex of item.examples) {
          expect(ex.sentence).toBeTruthy();
          expect(ex.marathiTranslation).toBeTruthy();
          expect(/[\u0900-\u097F]/.test(ex.marathiTranslation)).toBe(true);
        }

        expect(['beginner', 'intermediate', 'advanced']).toContain(item.difficulty);
      }
    });
  });

  describe('Word of the Day', () => {
    it('returns the exact same word for a specific calendar date', () => {
      const word1 = getWordOfTheDay('2026-10-24');
      const word2 = getWordOfTheDay('2026-10-24');
      expect(word1.id).toBe(word2.id);
      expect(word1.word).toBe(word2.word);
    });

    it('returns valid words for different dates', () => {
      const w1 = getWordOfTheDay('2026-01-01');
      const w2 = getWordOfTheDay('2026-05-15');
      expect(w1).toBeDefined();
      expect(w2).toBeDefined();
    });
  });

  describe('Spaced Repetition & Mastery Rules', () => {
    it('does not mark a word as mastered after one correct answer', async () => {
      const word = VOCABULARY_DATASET[0];
      const result1 = await recordRecallAttempt(word.id, true);

      expect(result1.attemptCount).toBe(1);
      expect(result1.correctCount).toBe(1);
      expect(result1.consecutiveSuccess).toBe(1);
      expect(result1.status).toBe('learning'); // NOT mastered!
      expect(result1.status).not.toBe('mastered');
    });

    it('requires at least 3 consecutive successful recalls to achieve mastery', async () => {
      const word = VOCABULARY_DATASET[1];

      // Attempt 1: Correct
      const res1 = await recordRecallAttempt(word.id, true);
      expect(res1.consecutiveSuccess).toBe(1);
      expect(res1.status).toBe('learning');

      // Attempt 2: Correct
      const res2 = await recordRecallAttempt(word.id, true);
      expect(res2.consecutiveSuccess).toBe(2);
      expect(res2.status).toBe('learning');

      // Attempt 3: Correct -> Now mastered!
      const res3 = await recordRecallAttempt(word.id, true);
      expect(res3.consecutiveSuccess).toBe(3);
      expect(res3.status).toBe('mastered');
    });

    it('resets consecutive success and marks as needs_revision on failed recall', async () => {
      const word = VOCABULARY_DATASET[2];

      // 2 correct recalls
      await recordRecallAttempt(word.id, true);
      await recordRecallAttempt(word.id, true);

      // 3rd attempt: Forgot / Incorrect
      const failed = await recordRecallAttempt(word.id, false);
      expect(failed.consecutiveSuccess).toBe(0);
      expect(failed.incorrectCount).toBe(1);
      expect(failed.status).toBe('needs_revision');
      // Next review scheduled for next day
      const today = getLocalDateString();
      expect(failed.nextReviewDate).toBe(addDaysToDateString(today, 1));
    });
  });

  describe('Quiz Question Generator', () => {
    it('generates questions with exactly 4 distinct options and 1 correct answer', () => {
      const testWords = VOCABULARY_DATASET.slice(0, 5);
      const questions = generateQuizQuestions(testWords, 5, 'en_to_mr', true);

      expect(questions.length).toBe(5);
      for (const q of questions) {
        expect(q.options.length).toBe(4);
        // All options must be unique
        const uniqueOptions = new Set(q.options);
        expect(uniqueOptions.size).toBe(4);
        // Correct answer must be among options
        expect(q.options).toContain(q.correctAnswer);
        expect(q.explanation).toBeTruthy();
      }
    });

    it('supports multiple question types without crashing', () => {
      const testWords = VOCABULARY_DATASET.slice(0, 5);
      const types = ['en_to_mr', 'mr_to_en', 'fill_blank', 'synonym_antonym', 'complete_sentence', 'mixed'] as const;

      for (const t of types) {
        const questions = generateQuizQuestions(testWords, 3, t, true);
        expect(questions.length).toBe(3);
        for (const q of questions) {
          expect(q.options.length).toBe(4);
          expect(q.options).toContain(q.correctAnswer);
        }
      }
    });

    it('handles requests for more questions than available words gracefully', () => {
      const smallPool = VOCABULARY_DATASET.slice(0, 2);
      const questions = generateQuizQuestions(smallPool, 10, 'mixed', true);
      expect(questions.length).toBe(2);
    });

    it('handles empty word list gracefully', () => {
      const questions = generateQuizQuestions([], 5, 'mixed');
      expect(questions).toEqual([]);
    });
  });
});
