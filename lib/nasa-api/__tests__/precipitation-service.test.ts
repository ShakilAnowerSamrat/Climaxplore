/**
 * 🧪 Unit Tests for PrecipitationService
 *
 * Tests:
 * - Input validation through getPrecipitationProbability
 * - Error handling (ValidationError, ServiceError)
 * - Business logic correctness
 * - Data formatting and calculations
 */

import {
  PrecipitationService,
  ValidationError,
  type PrecipitationQuery,
} from '@/lib/nasa-api/precipitation-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// ============================================================================
// MOCKS
// ============================================================================

// Mock the NASADataFetcher
vi.mock('@/lib/nasa-api/merra2-fetcher', () => ({
  NASADataFetcher: vi.fn().mockImplementation(() => ({
    fetchDateProbability: vi.fn().mockResolvedValue({
      probability: 45.5,
      avg_precipitation: 3.2,
      historical_days: [
        { year: 2023, precipitation_mm: 5.5 },
        { year: 2022, precipitation_mm: 0.0 },
        { year: 2021, precipitation_mm: 2.1 },
        { year: 2020, precipitation_mm: 8.7 },
        { year: 2019, precipitation_mm: 0.0 },
        { year: 2018, precipitation_mm: 1.2 },
        { year: 2017, precipitation_mm: 0.0 },
        { year: 2016, precipitation_mm: 4.3 },
        { year: 2015, precipitation_mm: 0.0 },
        { year: 2014, precipitation_mm: 6.8 },
      ],
    }),
  })),
}));

// ============================================================================
// TEST SUITES
// ============================================================================

describe('PrecipitationService', () => {
  let service: PrecipitationService;

  beforeEach(() => {
    service = new PrecipitationService();
  });

  // --------------------------------------------------------------------------
  // VALIDATION TESTS (through getPrecipitationProbability)
  // --------------------------------------------------------------------------

  describe('Input Validation', () => {
    it('should accept valid queries', async () => {
      const validQuery: PrecipitationQuery = {
        latitude: 47.6,
        longitude: -122.3,
        month: 7,
        day: 15,
        years: 20,
      };

      const result = await service.getPrecipitationProbability(validQuery);
      expect(result).toBeDefined();
      expect(result.query.latitude).toBe(47.6);
    });

    it('should reject latitude out of range', async () => {
      const queries = [
        { latitude: -91, longitude: 0, month: 1, day: 1, years: 10 },
        { latitude: 91, longitude: 0, month: 1, day: 1, years: 10 },
      ];

      for (const query of queries) {
        await expect(
          service.getPrecipitationProbability(query as PrecipitationQuery)
        ).rejects.toThrow(ValidationError);
      }
    });

    it('should reject longitude out of range', async () => {
      const queries = [
        { latitude: 0, longitude: -181, month: 1, day: 1, years: 10 },
        { latitude: 0, longitude: 181, month: 1, day: 1, years: 10 },
      ];

      for (const query of queries) {
        await expect(
          service.getPrecipitationProbability(query as PrecipitationQuery)
        ).rejects.toThrow(ValidationError);
      }
    });

    it('should reject invalid month', async () => {
      const queries = [
        { latitude: 0, longitude: 0, month: 0, day: 1, years: 10 },
        { latitude: 0, longitude: 0, month: 13, day: 1, years: 10 },
      ];

      for (const query of queries) {
        await expect(
          service.getPrecipitationProbability(query as PrecipitationQuery)
        ).rejects.toThrow(ValidationError);
      }
    });

    it('should reject invalid day', async () => {
      const queries = [
        { latitude: 0, longitude: 0, month: 1, day: 0, years: 10 },
        { latitude: 0, longitude: 0, month: 1, day: 32, years: 10 },
      ];

      for (const query of queries) {
        await expect(
          service.getPrecipitationProbability(query as PrecipitationQuery)
        ).rejects.toThrow(ValidationError);
      }
    });

    it('should reject invalid date combinations', async () => {
      // Feb 30 is invalid
      await expect(
        service.getPrecipitationProbability({
          latitude: 0,
          longitude: 0,
          month: 2,
          day: 30,
          years: 10,
        })
      ).rejects.toThrow(ValidationError);
    });

    it('should reject invalid years', async () => {
      const queries = [
        { latitude: 0, longitude: 0, month: 1, day: 1, years: 0 },
        { latitude: 0, longitude: 0, month: 1, day: 1, years: 51 },
      ];

      for (const query of queries) {
        await expect(
          service.getPrecipitationProbability(query as PrecipitationQuery)
        ).rejects.toThrow(ValidationError);
      }
    });
  });

  // --------------------------------------------------------------------------
  // INTEGRATION TESTS (with mocked fetcher)
  // --------------------------------------------------------------------------

  describe('getPrecipitationProbability()', () => {
    it('should return properly formatted result', async () => {
      const query: PrecipitationQuery = {
        latitude: 47.6,
        longitude: -122.3,
        month: 7,
        day: 15,
        years: 10,
      };

      const result = await service.getPrecipitationProbability(query);

      // Validate structure
      expect(result).toHaveProperty('query');
      expect(result).toHaveProperty('probability');
      expect(result).toHaveProperty('historical_data');
      expect(result).toHaveProperty('source');
      expect(result).toHaveProperty('metadata');

      // Validate query echo
      expect(result.query.latitude).toBe(47.6);
      expect(result.query.longitude).toBe(-122.3);
      expect(result.query.month).toBe(7);
      expect(result.query.day).toBe(15);
      expect(result.query.years).toBe(10);

      // Validate probability structure
      expect(result.probability.probability).toBe(45.5);
      expect(result.probability.avg_precipitation_mm).toBe(3.2);
      expect(typeof result.probability.rainy_days).toBe('number');
      expect(typeof result.probability.dry_days).toBe('number');
      expect(result.probability.total_years).toBe(10);
      expect(['high', 'medium', 'low']).toContain(
        result.probability.confidence
      );

      // Validate historical data
      expect(Array.isArray(result.historical_data)).toBe(true);
      expect(result.historical_data.length).toBe(10);

      const firstDay = result.historical_data[0];
      expect(firstDay).toHaveProperty('year');
      expect(firstDay).toHaveProperty('date');
      expect(firstDay).toHaveProperty('precipitation_mm');
      expect(firstDay).toHaveProperty('was_rainy');

      // Validate metadata
      expect(result.metadata.fetched_at).toBeTruthy();
      expect(typeof result.metadata.response_time_ms).toBe('number');
    });

    it('should calculate rainy vs dry days correctly', async () => {
      const result = await service.getPrecipitationProbability({
        latitude: 0,
        longitude: 0,
        month: 1,
        day: 1,
        years: 10,
      });

      // From mock: count rainy days (>0mm)
      const rainyCount = result.historical_data.filter(
        (d) => d.was_rainy
      ).length;
      const dryCount = result.historical_data.filter(
        (d) => !d.was_rainy
      ).length;

      // Verify they add up to total years
      expect(rainyCount + dryCount).toBe(10);
      expect(result.probability.rainy_days).toBe(rainyCount);
      expect(result.probability.dry_days).toBe(dryCount);
      expect(result.probability.total_years).toBe(10);
    });

    it('should calculate min/max precipitation correctly', async () => {
      const result = await service.getPrecipitationProbability({
        latitude: 0,
        longitude: 0,
        month: 1,
        day: 1,
        years: 10,
      });

      // From mock data: max = 8.7, min = 0.0
      expect(result.probability.max_precipitation_mm).toBe(8.7);
      expect(result.probability.min_precipitation_mm).toBe(0.0);
    });

    it('should format dates correctly', async () => {
      const result = await service.getPrecipitationProbability({
        latitude: 0,
        longitude: 0,
        month: 7,
        day: 4,
        years: 10,
      });

      // Check date formatting (YYYY-07-04)
      result.historical_data.forEach((day) => {
        expect(day.date).toMatch(/^\d{4}-07-04$/);
      });
    });
  });

  // --------------------------------------------------------------------------
  // HEALTH CHECK TESTS
  // --------------------------------------------------------------------------

  describe('healthCheck()', () => {
    it('should return healthy status', async () => {
      const health = await service.healthCheck();

      expect(health.healthy).toBe(true);
      expect(health.message).toBeTruthy();
    });
  });
});