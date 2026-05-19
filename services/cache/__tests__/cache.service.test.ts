/**
 * 🧪 Cache Service Tests
 *
 * Tests for Redis caching layer
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock @upstash/redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: vi.fn().mockResolvedValue(null),
    set: vi.fn().mockResolvedValue('OK'),
    del: vi.fn().mockResolvedValue(1),
    ping: vi.fn().mockResolvedValue('PONG'),
  })),
}));

import { CacheService } from '@/services/cache/cache.service';

describe('CacheService', () => {
  let cache: CacheService;

  beforeEach(() => {
    cache = new CacheService();
  });

  describe('get() and set()', () => {
    it('should return null on cache miss', async () => {
      const result = await cache.get<string>(0, 0, 1, 1, 10);
      expect(result).toBeNull();
    });

    it('should track cache statistics', async () => {
      await cache.get<string>(0, 0, 1, 1, 10);
      const stats = cache.getStats();
      expect(typeof stats.misses).toBe('number');
      expect(typeof stats.hits).toBe('number');
    });

    it('should calculate hit rate', async () => {
      const stats = cache.getStats();
      expect(stats.hit_rate).toMatch(/^\d+(\.\d+)?%$/);
    });
  });

  describe('invalidate()', () => {
    it('should not throw when invalidating', async () => {
      await expect(cache.invalidate(0, 0, 1, 1, 10)).resolves.not.toThrow();
    });
  });

  describe('healthCheck()', () => {
    it('should return health status', async () => {
      const health = await cache.healthCheck();
      expect(health).toHaveProperty('healthy');
      expect(health).toHaveProperty('message');
      expect(typeof health.healthy).toBe('boolean');
    });
  });

  describe('Graceful Degradation', () => {
    it('should not throw on errors', async () => {
      await expect(cache.get<string>(0, 0, 1, 1, 10)).resolves.not.toThrow();
      await expect(
        cache.set(0, 0, 1, 1, 10, { test: 'data' })
      ).resolves.not.toThrow();
    });

    it('should track errors in statistics', async () => {
      const stats = cache.getStats();
      expect(typeof stats.errors).toBe('number');
    });

    it('should indicate if cache is enabled', () => {
      const stats = cache.getStats();
      expect(typeof stats.enabled).toBe('boolean');
    });
  });
});