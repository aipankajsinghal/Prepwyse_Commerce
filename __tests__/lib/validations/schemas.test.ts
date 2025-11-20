/**
 * Unit tests for Validation Schemas
 */

import {
  createQuizSchema,
  updateUserProfileSchema,
  createSubscriptionSchema,
  searchSchema,
  validateRequest,
  formatValidationErrors,
} from '@/lib/validations/schemas';

describe('createQuizSchema', () => {
  it('should validate correct quiz data', () => {
    const validData = {
      title: 'Test Quiz',
      subjectId: 'subject123',
      difficulty: 'MEDIUM' as const,
    };

    const result = createQuizSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject quiz with short title', () => {
    const invalidData = {
      title: 'AB',
      subjectId: 'subject123',
      difficulty: 'MEDIUM' as const,
    };

    const result = createQuizSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject quiz without required fields', () => {
    const invalidData = {
      title: 'Test Quiz',
    };

    const result = createQuizSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should accept optional fields', () => {
    const validData = {
      title: 'Test Quiz',
      description: 'A test quiz description',
      subjectId: 'subject123',
      difficulty: 'HARD' as const,
      timeLimit: 60,
      questionCount: 20,
    };

    const result = createQuizSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

describe('updateUserProfileSchema', () => {
  it('should validate user profile updates', () => {
    const validData = {
      name: 'John Doe',
      preferredDifficulty: 'EASY' as const,
      weakAreas: ['accounting', 'economics'],
    };

    const result = updateUserProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should allow partial updates', () => {
    const validData = {
      name: 'John Doe',
    };

    const result = updateUserProfileSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const invalidData = {
      email: 'not-an-email',
    };

    const result = updateUserProfileSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('createSubscriptionSchema', () => {
  it('should validate subscription creation', () => {
    const validData = {
      planId: 'plan123',
    };

    const result = createSubscriptionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should accept optional payment fields', () => {
    const validData = {
      planId: 'plan123',
      razorpayOrderId: 'order_123',
      razorpayPaymentId: 'pay_123',
    };

    const result = createSubscriptionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject without planId', () => {
    const invalidData = {};

    const result = createSubscriptionSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});

describe('searchSchema', () => {
  it('should validate search request', () => {
    const validData = {
      query: 'accounting',
    };

    const result = searchSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate with filters', () => {
    const validData = {
      query: 'accounting',
      filters: {
        subjectId: 'subject123',
        difficulty: 'MEDIUM' as const,
      },
      page: 1,
      perPage: 20,
    };

    const result = searchSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject empty query', () => {
    const invalidData = {
      query: '',
    };

    const result = searchSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should apply default pagination', () => {
    const validData = {
      query: 'test',
    };

    const result = searchSchema.safeParse(validData);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.perPage).toBe(20);
    }
  });
});

describe('validateRequest', () => {
  it('should return success for valid data', () => {
    const schema = createQuizSchema;
    const validData = {
      title: 'Test Quiz',
      subjectId: 'subject123',
      difficulty: 'MEDIUM' as const,
    };

    const result = validateRequest(schema, validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validData);
    }
  });

  it('should return error for invalid data', () => {
    const schema = createQuizSchema;
    const invalidData = {
      title: 'AB',
    };

    const result = validateRequest(schema, invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
    }
  });
});

describe('formatValidationErrors', () => {
  it('should format validation errors', () => {
    const schema = createQuizSchema;
    const invalidData = {
      title: 'AB',
    };

    const result = schema.safeParse(invalidData);
    if (!result.success) {
      const formatted = formatValidationErrors(result.error);
      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('object');
    }
  });
});
