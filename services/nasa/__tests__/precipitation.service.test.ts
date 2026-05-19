/**
 * 🧪 Precipitation Service Tests
 *
 * Tests for business logic layer
 */

import { PrecipitationService } from '@/services/nasa/precipitation.service';
import type { PrecipitationProbabilityQuery } from '@/services/nasa/types/precipitation.types';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock the NASA client
vi.mock('@/services/nasa/nasa-client.service', () => ({
  nasaClient: {
    fetchDailyData: vi.fn().mockResolvedValue({
      properties: {
        parameter: {
          PRECTOTCORR: {
            '20230715': 1.5,
            '20220715': 0.0,
            '20210715': 2.1,
            '20200715': 0.0,
            '20190715': 3.2,
            '20180715': 0.0,
            '20170715': 1.8,
            '20160715': 0.0,
            '20150715': 0.5,
            '20140715': 0.0,
          },
        },
      },
    }),
    fetchHourlyData: vi.fn().mockResolvedValue({
      properties: {
        parameter: {
          PRECTOTCORR: {
            '20251009': {
              '00': 0.5,
              '01': 0.0,
              '02': 0.0,
              '03': 1.2,
            },
          },
        },
      },
    }),
  },
}));

describe('PrecipitationService', () => {
  let service: PrecipitationService;

  beforeEach(() => {
    service = new PrecipitationService();
  });

  describe('getPrecipitationProbability', () => {
    it('should return valid probability result', async () => {
      const query: PrecipitationProbabilityQuery = {
        latitude: 47.6,
        longitude: -122.3,
        month: 7,
        day: 15,
        years: 10,
      };

      const result = await service.getPrecipitationProbability(query);

      expect(result).toBeDefined();
      expect(result.query).toEqual(query);
      expect(result.probability).toBeDefined();
      expect(result.historical_data).toBeDefined();
      expect(Array.isArray(result.historical_data)).toBe(true);
    });

    it('should reject invalid latitude', async () => {
      const query: PrecipitationProbabilityQuery = {
        latitude: 200,
        longitude: 0,
        month: 1,
        day: 1,
        years: 10,
      };

      await expect(service.getPrecipitationProbability(query)).rejects.toThrow(
        'Latitude'
      );
    });

    it('should reject invalid longitude', async () => {
      const query: PrecipitationProbabilityQuery = {
        latitude: 0,
        longitude: 200,
        month: 1,
        day: 1,
        years: 10,
      };

      await expect(service.getPrecipitationProbability(query)).rejects.toThrow(
        'Longitude'
      );
    });

    it('should reject invalid month', async () => {
      const query: PrecipitationProbabilityQuery = {
        latitude: 0,
        longitude: 0,
        month: 13,
        day: 1,
        years: 10,
      };

      await expect(service.getPrecipitationProbability(query)).rejects.toThrow(
        'Month'
      );
    });

    it('should reject invalid day', async () => {
      const query: PrecipitationProbabilityQuery = {
        latitude: 0,
        longitude: 0,
        month: 1,
        day: 32,
        years: 10,
      };

      await expect(service.getPrecipitationProbability(query)).rejects.toThrow(
        'Day'
      );
    });
  });

  describe('getHourlyPrecipitation', () => {
    it('should return valid hourly result', async () => {
      const result = await service.getHourlyPrecipitation({
        latitude: 40.7,
        longitude: -74.0,
        startDate: '2025-10-09',
        endDate: '2025-10-09',
        timeStandard: 'LST',
      });

      expect(result).toBeDefined();
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.statistics).toBeDefined();
    });

    it('should reject invalid date range', async () => {
      await expect(
        service.getHourlyPrecipitation({
          latitude: 0,
          longitude: 0,
          startDate: '2025-10-12',
          endDate: '2025-10-09', // End before start
          timeStandard: 'LST',
        })
      ).rejects.toThrow();
    });

    it('should reject dates before 2001', async () => {
      await expect(
        service.getHourlyPrecipitation({
          latitude: 0,
          longitude: 0,
          startDate: '2000-01-01',
          endDate: '2000-01-02',
          timeStandard: 'LST',
        })
      ).rejects.toThrow('2001');
    });
  });
});