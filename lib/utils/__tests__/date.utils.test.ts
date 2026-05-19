/**
 * 🧪 Date Utilities Tests
 *
 * Tests for date manipulation helpers
 */

import {
  calculateDateRange,
  formatDate,
  formatNasaDate,
  getCurrentYear,
  isFutureDate,
  parseNasaDate,
} from '@/lib/utils/date.utils';
import { describe, expect, it } from 'vitest';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      expect(formatDate(2024, 1, 15)).toBe('2024-01-15');
      expect(formatDate(2024, 12, 31)).toBe('2024-12-31');
    });

    it('should pad single-digit months and days', () => {
      expect(formatDate(2024, 1, 5)).toBe('2024-01-05');
      expect(formatDate(2024, 9, 9)).toBe('2024-09-09');
    });
  });

  describe('formatNasaDate', () => {
    it('should format as YYYYMMDD', () => {
      expect(formatNasaDate(2024, 7, 15)).toBe('20240715');
      expect(formatNasaDate(2024, 12, 25)).toBe('20241225');
    });

    it('should pad single digits', () => {
      expect(formatNasaDate(2024, 1, 5)).toBe('20240105');
      expect(formatNasaDate(2024, 9, 9)).toBe('20240909');
    });
  });

  describe('parseNasaDate', () => {
    it('should parse NASA date format', () => {
      const date = parseNasaDate('20240715');
      expect(date.year).toBe(2024);
      expect(date.month).toBe(7);
      expect(date.day).toBe(15);
    });

    it('should handle different dates', () => {
      const date = parseNasaDate('20001231');
      expect(date.year).toBe(2000);
      expect(date.month).toBe(12);
      expect(date.day).toBe(31);
    });
  });

  describe('calculateDateRange', () => {
    it('should calculate range for multiple years', () => {
      const range = calculateDateRange(10);
      expect(range.startDate).toMatch(/^\d{8}$/);
      expect(range.endDate).toMatch(/^\d{8}$/);
    });

    it('should return valid date strings', () => {
      const range = calculateDateRange(5);
      const startYear = parseInt(range.startDate.substring(0, 4));
      const endYear = parseInt(range.endDate.substring(0, 4));

      expect(endYear - startYear).toBe(4); // 5 years = 4 year difference
    });

    it('should start on January 1st and end on December 31st', () => {
      const range = calculateDateRange(10);

      expect(range.startDate.substring(4, 8)).toBe('0101');
      expect(range.endDate.substring(4, 8)).toBe('1231');
    });
  });

  describe('getCurrentYear', () => {
    it('should return current year', () => {
      const year = getCurrentYear();
      const actualYear = new Date().getFullYear();
      expect(year).toBe(actualYear);
    });

    it('should return a number', () => {
      expect(typeof getCurrentYear()).toBe('number');
    });
  });

  describe('isFutureDate', () => {
    it('should detect future dates', () => {
      const future = new Date();
      future.setFullYear(future.getFullYear() + 1);
      const year = future.getFullYear();

      expect(isFutureDate(year, 6, 15)).toBe(true);
    });

    it('should accept past dates', () => {
      expect(isFutureDate(2020, 1, 1)).toBe(false);
      expect(isFutureDate(2000, 12, 31)).toBe(false);
    });

    it('should accept today', () => {
      const today = new Date();
      expect(
        isFutureDate(today.getFullYear(), today.getMonth() + 1, today.getDate())
      ).toBe(false);
    });
  });
});