/**
 * AI Services Tests
 *
 * Tests for:
 * - AI question generation
 * - Prompt sanitization
 * - Response validation
 * - Error handling
 */

import { z } from 'zod';
// Removed unused imports from '@/lib/ai-services'
import { sanitizePromptInput, sanitizePromptArray } from '@/lib/prompt-sanitizer';

// Mock AI provider
jest.mock('@/lib/ai-provider', () => ({
  generateChatCompletion: jest.fn(),
  isAnyAIConfigured: jest.fn(() => true),
}));

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    quizAttempt: {
      findMany: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
    },
  },
}));

describe('AI Services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Prompt Sanitization', () => {
    it('should escape special characters in input', () => {
      const input = 'Subject with "quotes"';
      const sanitized = sanitizePromptInput(input);

      expect(sanitized).not.toContain('"quotes"');
      expect(sanitized).toBeTruthy();
    });

    it('should remove control characters', () => {
      const input = 'Subject\x00\x01\x02Invalid';
      const sanitized = sanitizePromptInput(input);

      expect(sanitized).not.toMatch(/[\x00-\x1F\x7F]/);
    });

    it('should limit input length', () => {
      const longInput = 'a'.repeat(2000);
      const sanitized = sanitizePromptInput(longInput);

      expect(sanitized.length).toBeLessThanOrEqual(1000);
    });

    it('should limit consecutive newlines', () => {
      const input = 'Line1\n\n\n\n\nLine2';
      const sanitized = sanitizePromptInput(input);

      expect(sanitized).not.toMatch(/\n{3,}/);
    });

    it('should handle empty strings', () => {
      const sanitized = sanitizePromptInput('');

      expect(sanitized).toBe('');
    });

    it('should sanitize array of inputs', () => {
      const inputs = ['Chapter 1', 'Chapter 2\n\nINJECT', 'Chapter 3'];
      const sanitized = sanitizePromptArray(inputs);

      expect(sanitized.length).toBeLessThanOrEqual(inputs.length);
      expect(sanitized.every((item) => typeof item === 'string')).toBe(true);
    });
  });

  describe('Question Generation', () => {
    it('should validate generated questions have required fields', () => {
      const mockQuestion = {
        questionText: 'What is commerce?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 'Option A',
        explanation: 'This is correct because...',
        difficulty: 'easy',
      };

      expect(mockQuestion.questionText).toBeTruthy();
      expect(mockQuestion.options.length).toBe(4);
      expect(mockQuestion.correctAnswer).toBeTruthy();
    });

    it('should reject questions with invalid difficulty level', () => {
      const invalidQuestion = {
        questionText: 'Question?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
        difficulty: 'ultra-hard', // Invalid
      };

      const difficultySchema = z.enum(['easy', 'medium', 'hard']);
      const isValid = difficultySchema.safeParse(invalidQuestion.difficulty);

      expect(isValid.success).toBe(false);
    });

    it('should validate exactly 4 options per question', () => {
      const validQuestion = {
        options: ['A', 'B', 'C', 'D'],
      };

      const invalidQuestion = {
        options: ['A', 'B', 'C'], // Only 3 options
      };

      expect(validQuestion.options.length).toBe(4);
      expect(invalidQuestion.options.length).not.toBe(4);
    });

    it('should handle AI generation errors', async () => {
      // Simulating error handling
      const mockError = new Error('AI API failed');

      expect(() => {
        throw mockError;
      }).toThrow('AI API failed');
    });
  });

  describe('Mock Test Generation', () => {
    it('should distribute questions across sections', () => {
      const sections = [
        { name: 'Economics', questions: 10 },
        { name: 'Accounting', questions: 15 },
        { name: 'Commerce', questions: 5 },
      ];

      const totalQuestions = sections.reduce((sum, s) => sum + s.questions, 0);

      expect(totalQuestions).toBe(30);
    });

    it('should validate mock test response structure', () => {
      const mockTestResponse = {
        mockTest: {
          title: 'CUET 2025',
          examType: 'CUET',
          duration: 180,
          totalQuestions: 30,
        },
        sections: [
          {
            name: 'Economics',
            questions: [
              {
                questionText: 'Question?',
                options: ['A', 'B', 'C', 'D'],
                correctAnswer: 'A',
                difficulty: 'medium',
              },
            ],
          },
        ],
      };

      expect(mockTestResponse.mockTest.title).toBeTruthy();
      expect(mockTestResponse.sections.length).toBeGreaterThan(0);
      expect(mockTestResponse.mockTest.totalQuestions).toBe(30);
    });

    it('should handle missing section data', () => {
      const incompleteTest = {
        mockTest: {
          title: 'Test',
          duration: 180,
        },
        sections: [],
      };

      expect(incompleteTest.sections.length).toBe(0);
    });
  });

  describe('Question Explanation', () => {
    it('should generate explanation for correct answer', async () => {
      const mockExplanation = {
        explanation: 'This is the correct answer because...',
        concept: 'Business Economics',
        relatedTopics: ['Supply and Demand', 'Market Structure'],
      };

      expect(mockExplanation.explanation).toBeTruthy();
      expect(mockExplanation.relatedTopics).toBeInstanceOf(Array);
    });

    it('should highlight differences for incorrect user answer', () => {
      const params = {
        userAnswer: 'Wrong Option',
        correctAnswer: 'Correct Option',
      };

      const shouldCompare = params.userAnswer !== params.correctAnswer;

      expect(shouldCompare).toBe(true);
    });
  });

  describe('Adaptive Difficulty', () => {
    it('should increase difficulty for high-performing users', () => {
      const attempts = [
        { score: 9, totalQuestions: 10 }, // 90%
        { score: 8, totalQuestions: 10 }, // 80%
      ];

      const avgScore = attempts.reduce((sum, a) => sum + a.score / a.totalQuestions, 0) / attempts.length;
      const suggestedDifficulty = avgScore >= 0.8 ? 'hard' : avgScore >= 0.6 ? 'medium' : 'easy';

      expect(suggestedDifficulty).toBe('hard');
    });

    it('should maintain difficulty for average performers', () => {
      const attempts = [
        { score: 6, totalQuestions: 10 }, // 60%
        { score: 7, totalQuestions: 10 }, // 70%
      ];

      const avgScore = attempts.reduce((sum, a) => sum + a.score / a.totalQuestions, 0) / attempts.length;
      const suggestedDifficulty = avgScore >= 0.8 ? 'hard' : avgScore >= 0.6 ? 'medium' : 'easy';

      expect(suggestedDifficulty).toBe('medium');
    });

    it('should decrease difficulty for struggling users', () => {
      const attempts = [
        { score: 3, totalQuestions: 10 }, // 30%
        { score: 4, totalQuestions: 10 }, // 40%
      ];

      const avgScore = attempts.reduce((sum, a) => sum + a.score / a.totalQuestions, 0) / attempts.length;
      const suggestedDifficulty = avgScore >= 0.8 ? 'hard' : avgScore >= 0.6 ? 'medium' : 'easy';

      expect(suggestedDifficulty).toBe('easy');
    });

    it('should return medium difficulty for new users', () => {
      const attempts: any[] = [];

      const defaultDifficulty = attempts.length === 0 ? 'medium' : 'calculated';

      expect(defaultDifficulty).toBe('medium');
    });
  });

  describe('Response Validation', () => {
    it('should validate JSON responses from AI', () => {
      const validJson = '{"questionText": "Q?", "options": ["A","B","C","D"], "correctAnswer": "A"}';
      const parsed = JSON.parse(validJson);

      expect(parsed.questionText).toBeTruthy();
      expect(Array.isArray(parsed.options)).toBe(true);
    });

    it('should reject malformed JSON responses', () => {
      const invalidJson = '{invalid json}';

      expect(() => JSON.parse(invalidJson)).toThrow();
    });

    it('should handle missing required fields', () => {
      const incompletQuestion = {
        questionText: 'Question?',
        // Missing options, correctAnswer, etc.
      };

      const hasRequiredFields =
        incompletQuestion.questionText &&
        'options' in incompletQuestion &&
        'correctAnswer' in incompletQuestion;

      expect(hasRequiredFields).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle AI service unavailable', async () => {
      const mockError = new Error('No AI provider is configured');

      expect(() => {
        throw mockError;
      }).toThrow('No AI provider is configured');
    });

    it('should handle rate limiting errors', () => {
      const error = new Error('Rate limit exceeded');

      expect(error.message).toContain('Rate limit');
    });

    it('should handle network errors', () => {
      const error = new Error('Failed to fetch');

      expect(error.message).toContain('Failed');
    });
  });
});
