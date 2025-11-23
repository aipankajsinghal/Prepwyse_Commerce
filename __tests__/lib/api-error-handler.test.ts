import { describe, it, expect, jest } from '@jest/globals';
import { handleApiError, ApiError } from '../../lib/api-error-handler';
import { NextResponse } from 'next/server';

// Mock logger
jest.mock('../../lib/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('ApiError', () => {
  it('should create an instance with correct properties', () => {
    const error = new ApiError('Test error', 400, 'TEST_CODE');
    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.code).toBe('TEST_CODE');
    expect(error.name).toBe('ApiError');
  });
});

describe('handleApiError', () => {
  it('should handle ApiError correctly', async () => {
    const error = new ApiError('Custom error', 404, 'NOT_FOUND');
    const response = handleApiError(error);
    
    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data).toEqual({ error: 'Custom error', code: 'NOT_FOUND' });
  });

  it('should handle standard Error correctly', async () => {
    const error = new Error('Standard error');
    const response = handleApiError(error);
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Standard error' });
  });

  it('should handle unknown error correctly', async () => {
    const error = 'Unknown string error';
    const response = handleApiError(error);
    
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data).toEqual({ error: 'Unknown string error' });
  });
  
  it('should use default message if error has no message', async () => {
      const error = new Error('');
      const response = handleApiError(error, 'Default message');
      
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Default message' });
  });
});
