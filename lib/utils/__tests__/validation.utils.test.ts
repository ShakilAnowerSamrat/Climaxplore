/**
 * 🧪 Validation Utilities Tests
 *
 * Tests for input validation functions
 */

import {
  validateDateExists,
  validateDay,
  validateHourlyDateRange,
  validateLatitude,
  validateLongitude,
  validateMonth,
  validateYears,
  ValidationError,
} from '@/lib/utils/validation.utils';
import { describe, expect, it } from 'vitest';

describe('Validation Utils', () => {
  describe('validateLatitude', () => {
    it('should accept valid latitudes', () => {
      expect(() => validateLatitude(0)).not.toThrow();
      expect(() => validateLatitude(90)).not.toThrow();
      expect(() => validateLatitude(-90)).not.toThrow();
      expect(() => validateLatitude(45.5)).not.toThrow();
    });

    it('should reject invalid latitudes', () => {
      expect(() => validateLatitude(91)).toThrow(ValidationError);
      expect(() => validateLatitude(-91)).toThrow(ValidationError);
      expect(() => validateLatitude(200)).toThrow(ValidationError);
      expect(() => validateLatitude(NaN)).toThrow(ValidationError);
    });
  });

  describe('validateLongitude', () => {
    it('should accept valid longitudes', () => {
      expect(() => validateLongitude(0)).not.toThrow();
      expect(() => validateLongitude(180)).not.toThrow();
      expect(() => validateLongitude(-180)).not.toThrow();
      expect(() => validateLongitude(120.5)).not.toThrow();
    });

    it('should reject invalid longitudes', () => {
      expect(() => validateLongitude(181)).toThrow(ValidationError);
      expect(() => validateLongitude(-181)).toThrow(ValidationError);
      expect(() => validateLongitude(500)).toThrow(ValidationError);
      expect(() => validateLongitude(NaN)).toThrow(ValidationError);
    });
  });

  describe('validateMonth', () => {
    it('should accept valid months', () => {
      expect(() => validateMonth(1)).not.toThrow();
      expect(() => validateMonth(6)).not.toThrow();
      expect(() => validateMonth(12)).not.toThrow();
    });

    it('should reject invalid months', () => {
      expect(() => validateMonth(0)).toThrow(ValidationError);
      expect(() => validateMonth(13)).toThrow(ValidationError);
      expect(() => validateMonth(-1)).toThrow(ValidationError);
      expect(() => validateMonth(NaN)).toThrow(ValidationError);
    });
  });

  describe('validateDay', () => {
    it('should accept valid days', () => {
      expect(() => validateDay(1)).not.toThrow();
      expect(() => validateDay(15)).not.toThrow();
      expect(() => validateDay(31)).not.toThrow();
    });

    it('should reject invalid days', () => {
      expect(() => validateDay(0)).toThrow(ValidationError);
      expect(() => validateDay(32)).toThrow(ValidationError);
      expect(() => validateDay(-1)).toThrow(ValidationError);
      expect(() => validateDay(NaN)).toThrow(ValidationError);
    });
  });

  describe('validateYears', () => {
    it('should accept valid year ranges', () => {
      expect(() => validateYears(1)).not.toThrow();
      expect(() => validateYears(10)).not.toThrow();
      expect(() => validateYears(30)).not.toThrow();
      expect(() => validateYears(50)).not.toThrow();
    });

    it('should reject invalid year ranges', () => {
      expect(() => validateYears(0)).toThrow(ValidationError);
      expect(() => validateYears(51)).toThrow(ValidationError);
      expect(() => validateYears(-5)).toThrow(ValidationError);
      expect(() => validateYears(NaN)).toThrow(ValidationError);
    });
  });

  describe('validateDateExists', () => {
    it('should accept valid dates', () => {
      expect(() => validateDateExists(2024, 1, 15)).not.toThrow();
      expect(() => validateDateExists(2024, 12, 31)).not.toThrow();
      expect(() => validateDateExists(2024, 2, 29)).not.toThrow(); // Leap year
    });

    it('should reject impossible dates', () => {
      expect(() => validateDateExists(2024, 2, 30)).toThrow(ValidationError);
      expect(() => validateDateExists(2024, 4, 31)).toThrow(ValidationError);
      expect(() => validateDateExists(2024, 9, 31)).toThrow(ValidationError);
      expect(() => validateDateExists(2024, 11, 31)).toThrow(ValidationError);
    });
  });

  describe('validateHourlyDateRange', () => {
    it('should accept valid ranges', () => {
      expect(() =>
        validateHourlyDateRange('2024-01-01', '2024-01-07')
      ).not.toThrow();
      expect(() =>
        validateHourlyDateRange('2001-01-01', '2001-01-02')
      ).not.toThrow();
    });

    it('should reject dates before 2001', () => {
      expect(() => validateHourlyDateRange('2000-12-31', '2001-01-01')).toThrow(
        /2001/
      );
    });

    it('should reject end before start', () => {
      expect(() => validateHourlyDateRange('2024-01-07', '2024-01-01')).toThrow(
        /before.*end/i
      );
    });

    it('should allow future dates for historical planning', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      expect(() =>
        validateHourlyDateRange(futureDateStr, futureDateStr)
      ).not.toThrow();
    });
  });
});