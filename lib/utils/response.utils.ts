/**
 * 📦 Response Formatting Utilities
 *
 * Clean, consistent API responses
 * Single responsibility: format HTTP responses
 */

import { NextResponse } from 'next/server';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SuccessResponse<T = any> {
  success: true;
  data: T;
  metadata: {
    fetched_at: string;
    response_time_ms: number;
    cached: boolean;
    cache_stats?: {
      enabled: boolean;
      hit_rate: string;
      hits: number;
      misses: number;
      errors: number;
    };
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    statusCode: number;
  };
  timestamp: string;
}

// ============================================================================
// RESPONSE BUILDERS
// ============================================================================

/**
 * Build success response
 */
export function buildSuccessResponse<T>(
  data: T,
  metadata: {
    fetched_at: string;
    response_time_ms: number;
    cached: boolean;
    cache_stats?: any;
  }
): SuccessResponse<T> {
  return {
    success: true,
    data,
    metadata,
  };
}

/**
 * Build error response
 */
export function buildErrorResponse(
  code: string,
  message: string,
  statusCode: number = 500,
  field?: string
): ErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
      field,
      statusCode,
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send success response
 */
export function sendSuccess<T>(
  data: T,
  responseTimeMs: number,
  cached: boolean,
  cacheStats?: any
): NextResponse<SuccessResponse<T>> {
  const response = buildSuccessResponse(data, {
    fetched_at: new Date().toISOString(),
    response_time_ms: responseTimeMs,
    cached,
    cache_stats: cacheStats,
  });

  return NextResponse.json(response, { status: 200 });
}

/**
 * Send error response
 */
export function sendError(
  code: string,
  message: string,
  statusCode: number = 500,
  field?: string
): NextResponse<ErrorResponse> {
  const response = buildErrorResponse(code, message, statusCode, field);

  // Log error for monitoring
  console.error(`❌ API Error [${code}]:`, message);

  return NextResponse.json(response, { status: statusCode });
}