/**
 * Unit tests for User Service
 * 
 * Note: These are integration-style tests that would require database mocking
 * in a real environment. For now, we're testing the structure and logic.
 */

import { describe, it, expect } from '@jest/globals';

describe('UserService', () => {
  describe('getOrCreateUser', () => {
    it('should be defined', () => {
      // This test verifies the service can be imported
      const userService = require('@/lib/services/userService');
      expect(userService.getOrCreateUser).toBeDefined();
      expect(typeof userService.getOrCreateUser).toBe('function');
    });
  });

  describe('getUserById', () => {
    it('should be defined', () => {
      const userService = require('@/lib/services/userService');
      expect(userService.getUserById).toBeDefined();
      expect(typeof userService.getUserById).toBe('function');
    });
  });

  describe('updateUser', () => {
    it('should be defined', () => {
      const userService = require('@/lib/services/userService');
      expect(userService.updateUser).toBeDefined();
      expect(typeof userService.updateUser).toBe('function');
    });
  });

  describe('deleteUser', () => {
    it('should be defined', () => {
      const userService = require('@/lib/services/userService');
      expect(userService.deleteUser).toBeDefined();
      expect(typeof userService.deleteUser).toBe('function');
    });
  });

  describe('getUserWithSubscription', () => {
    it('should be defined', () => {
      const userService = require('@/lib/services/userService');
      expect(userService.getUserWithSubscription).toBeDefined();
      expect(typeof userService.getUserWithSubscription).toBe('function');
    });
  });

  describe('exportUserData', () => {
    it('should be defined for GDPR compliance', () => {
      const userService = require('@/lib/services/userService');
      expect(userService.exportUserData).toBeDefined();
      expect(typeof userService.exportUserData).toBe('function');
    });
  });
});

// Test that all expected functions are exported
describe('UserService exports', () => {
  it('should export all required functions', () => {
    const userService = require('@/lib/services/userService');
    
    const expectedFunctions = [
      'getOrCreateUser',
      'getUserByClerkId',
      'getUserById',
      'getUserByEmail',
      'updateUser',
      'updateUserPreferences',
      'deleteUser',
      'getUserWithSubscription',
      'getUserQuizStats',
      'getUserPerformanceSummary',
      'exportUserData',
    ];

    expectedFunctions.forEach(funcName => {
      expect(userService[funcName]).toBeDefined();
      expect(typeof userService[funcName]).toBe('function');
    });
  });
});
