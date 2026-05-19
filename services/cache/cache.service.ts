/**
 * ⚡ Cache Service
 *
 * Handles caching with Upstash Redis for faster API responses.
 * Falls back gracefully if Redis is unavailable.
 *
 * @module lib/cache-service
 */

import { Redis } from '@upstash/redis';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 24 hours)
}

export interface CacheStats {
  hits: number;
  misses: number;
  errors: number;
}

// ============================================================================
// CACHE SERVICE CLASS
// ============================================================================

export class CacheService {
  private redis: Redis | null = null;
  private enabled: boolean = false;
  private stats: CacheStats = { hits: 0, misses: 0, errors: 0 };
  private readonly DEFAULT_TTL = 86400; // 24 hours

  constructor() {
    this.initializeRedis();
  }

  /**
   * Initialize Redis connection
   */
  private initializeRedis(): void {
    try {
      const url = process.env.UPSTASH_REDIS_REST_URL;
      const token = process.env.UPSTASH_REDIS_REST_TOKEN;

      if (!url || !token) {
        console.warn('⚠️  Redis credentials not found - caching disabled');
        console.warn(
          '   Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to .env'
        );
        this.enabled = false;
        return;
      }

      this.redis = new Redis({
        url,
        token,
      });

      this.enabled = true;
      console.log('✅ Redis cache initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Redis:', error);
      this.enabled = false;
    }
  }

  /**
   * Generate cache key for precipitation data
   */
  private generateKey(
    latitude: number,
    longitude: number,
    month: number,
    day: number,
    years: number
  ): string {
    // Round coordinates to 2 decimal places for better cache hits
    const lat = Math.round(latitude * 100) / 100;
    const lon = Math.round(longitude * 100) / 100;

    return `precip:${lat}:${lon}:${month}:${day}:${years}`;
  }

  /**
   * Get cached precipitation data
   *
   * @returns Cached data or null if not found/cache disabled
   */
  async get<T>(
    latitude: number,
    longitude: number,
    month: number,
    day: number,
    years: number
  ): Promise<T | null> {
    if (!this.enabled || !this.redis) {
      return null;
    }

    try {
      const key = this.generateKey(latitude, longitude, month, day, years);
      const cached = await this.redis.get<T>(key);

      if (cached) {
        this.stats.hits++;
        console.log(`✅ Cache HIT: ${key}`);
        return cached;
      }

      this.stats.misses++;
      console.log(`❌ Cache MISS: ${key}`);
      return null;
    } catch (error) {
      this.stats.errors++;
      console.error('Cache GET error:', error);
      return null; // Fail gracefully
    }
  }

  /**
   * Set precipitation data in cache
   */
  async set<T>(
    latitude: number,
    longitude: number,
    month: number,
    day: number,
    years: number,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    try {
      const key = this.generateKey(latitude, longitude, month, day, years);
      const ttl = options.ttl || this.DEFAULT_TTL;

      await this.redis.set(key, data, { ex: ttl });
      console.log(`💾 Cached: ${key} (TTL: ${ttl}s)`);
    } catch (error) {
      this.stats.errors++;
      console.error('Cache SET error:', error);
      // Don't throw - fail gracefully
    }
  }

  /**
   * Invalidate cache for specific location and date
   */
  async invalidate(
    latitude: number,
    longitude: number,
    month: number,
    day: number,
    years: number
  ): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    try {
      const key = this.generateKey(latitude, longitude, month, day, years);
      await this.redis.del(key);
      console.log(`🗑️  Invalidated cache: ${key}`);
    } catch (error) {
      console.error('Cache DELETE error:', error);
    }
  }

  /**
   * Clear all precipitation cache
   * WARNING: Use with caution!
   */
  async clearAll(): Promise<void> {
    if (!this.enabled || !this.redis) {
      return;
    }

    try {
      // Note: This is a simple implementation
      // For production, you'd want to use SCAN with pattern matching
      console.warn(
        '⚠️  Clear all cache - not implemented (use Redis CLI for now)'
      );
    } catch (error) {
      console.error('Cache CLEAR error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { enabled: boolean; hit_rate: string } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate =
      total > 0 ? ((this.stats.hits / total) * 100).toFixed(1) : '0';

    return {
      ...this.stats,
      enabled: this.enabled,
      hit_rate: `${hitRate}%`,
    };
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = { hits: 0, misses: 0, errors: 0 };
  }

  /**
   * Health check for cache service
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    if (!this.enabled || !this.redis) {
      return {
        healthy: true, // Cache is optional
        message: 'Cache disabled (not configured)',
      };
    }

    try {
      // Try to ping Redis
      await this.redis.ping();
      return {
        healthy: true,
        message: 'Redis cache is responding',
      };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Redis unavailable',
      };
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

// Export singleton instance for use across the application
export const cacheService = new CacheService();

// ============================================================================
// GENERIC CACHE HELPERS
// ============================================================================

/**
 * Get data from cache using a custom key
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  if (!cacheService['enabled'] || !cacheService['redis']) {
    return null;
  }

  try {
    const cached = await cacheService['redis'].get<T>(key);
    if (cached) {
      console.log(`✅ Cache HIT: ${key}`);
      return cached;
    }
    console.log(`❌ Cache MISS: ${key}`);
    return null;
  } catch (error) {
    console.error('Cache GET error:', error);
    return null;
  }
}

/**
 * Set data in cache using a custom key
 */
export async function setCachedData<T>(
  key: string,
  data: T,
  ttl: number = 86400
): Promise<void> {
  if (!cacheService['enabled'] || !cacheService['redis']) {
    return;
  }

  try {
    await cacheService['redis'].set(key, data, { ex: ttl });
    console.log(`💾 Cached: ${key} (TTL: ${ttl}s)`);
  } catch (error) {
    console.error('Cache SET error:', error);
  }
}