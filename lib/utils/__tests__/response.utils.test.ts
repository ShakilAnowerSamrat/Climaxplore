/**
 * 🧪 Response Utilities Tests
 *
 * Tests for standardized API responses
 */

import {
  buildErrorResponse,
  buildSuccessResponse,
  sendError,
  sendSuccess,
} from '@/lib/utils/response.utils';
import { NextResponse } from 'next/server';
import { describe, expect, it } from 'vitest';

describe('Response Utils', () => {
  describe('buildSuccessResponse', () => {
    it('should build success response structure', () => {
      const data = { value: 42 };
      const metadata = {
        fetched_at: '2024-01-01T00:00:00.000Z',
        response_time_ms: 100,
        cached: false,
      };
      const response = buildSuccessResponse(data, metadata);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(data);
      expect(response.metadata).toEqual(metadata);
    });

    it('should include cache stats when provided', () => {
      const data = { value: 42 };
      const cacheStats = {
        enabled: true,
        hit_rate: '50%',
        hits: 5,
        misses: 5,
        errors: 0,
      };
      const metadata = {
        fetched_at: '2024-01-01T00:00:00.000Z',
        response_time_ms: 50,
        cached: true,
        cache_stats: cacheStats,
      };
      const response = buildSuccessResponse(data, metadata);

      expect(response.metadata.cache_stats).toEqual(cacheStats);
    });
  });

  describe('buildErrorResponse', () => {
    it('should build error response structure', () => {
      const response = buildErrorResponse(
        'VALIDATION_ERROR',
        'Test error',
        400
      );

      expect(response.success).toBe(false);
      expect(response.error.code).toBe('VALIDATION_ERROR');
      expect(response.error.message).toBe('Test error');
      expect(response.error.statusCode).toBe(400);
      expect(response.timestamp).toBeDefined();
    });

    it('should include field when provided', () => {
      const response = buildErrorResponse(
        'VALIDATION_ERROR',
        'Invalid latitude',
        400,
        'latitude'
      );

      expect(response.error.field).toBe('latitude');
    });

    it('should use 500 as default status', () => {
      const response = buildErrorResponse('INTERNAL_ERROR', 'Server error');

      expect(response.error.statusCode).toBe(500);
    });
  });

  describe('sendSuccess', () => {
    it('should return NextResponse with correct structure', () => {
      const data = { value: 42 };
      const response = sendSuccess(data, 100, false);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });

    it('should include cache stats when provided', () => {
      const data = { created: true };
      const cacheStats = {
        enabled: true,
        hit_rate: '100%',
        hits: 10,
        misses: 0,
        errors: 0,
      };
      const response = sendSuccess(data, 50, true, cacheStats);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(200);
    });
  });

  describe('sendError', () => {
    it('should return NextResponse with error status', () => {
      const response = sendError('TEST_ERROR', 'Test error', 400);

      expect(response).toBeInstanceOf(NextResponse);
      expect(response.status).toBe(400);
    });

    it('should use 500 as default status', () => {
      const response = sendError('INTERNAL_ERROR', 'Server error');

      expect(response.status).toBe(500);
    });

    it('should handle field parameter', () => {
      const response = sendError(
        'VALIDATION_ERROR',
        'Invalid email',
        400,
        'email'
      );

      expect(response.status).toBe(400);
    });
  });
});