/**
 * 🛰️ NASA POWER API Client Service
 *
 * Clean HTTP client wrapper for NASA POWER API
 * Single responsibility: Make HTTP requests to NASA
 */

import type {
  DailyData,
  DailyRequest,
  HourlyData,
  HourlyRequest,
  NasaApiResponse,
} from './types/nasa-api.types';

// ============================================================================
// CONSTANTS
// ============================================================================

const NASA_BASE_URL = 'https://power.larc.nasa.gov/api/temporal';

const DEFAULT_COMMUNITY = 'AG'; // Agriculture community

const PRECIPITATION_PARAM = 'PRECTOTCORR'; // Corrected precipitation

const REQUEST_TIMEOUT = 30000; // 30 seconds timeout

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class NasaClientService {
  /**
   * Fetch with timeout wrapper
   */
  private async fetchWithTimeout(
    url: string,
    timeoutMs: number = REQUEST_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        next: { revalidate: 3600 }, // Cache for 1 hour
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`NASA API timeout after ${timeoutMs}ms`);
      }
      throw error;
    }
  }

  /**
   * Fetch hourly precipitation data
   * Available: 2001-01-01 to present
   */
  async fetchHourlyData(
    request: HourlyRequest
  ): Promise<NasaApiResponse<HourlyData>> {
    const startTime = Date.now();

    const url = this.buildUrl('hourly', {
      latitude: request.latitude,
      longitude: request.longitude,
      parameters: request.parameters.join(','),
      start: request.start,
      end: request.end,
      community: request.community || DEFAULT_COMMUNITY,
      format: request.format || 'JSON',
      'time-standard': request.timeStandard || 'LST',
    });

    console.log(`\n🌍 Fetching hourly NASA data...`);
    console.log(`📍 Location: (${request.latitude}, ${request.longitude})`);
    console.log(`📅 Period: ${request.start} to ${request.end}`);
    console.log(`⏰ Time Standard: ${request.timeStandard || 'LST'}`);

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(
          `NASA API error: ${response.status} ${response.statusText}`
        );
      }

      const data: NasaApiResponse<HourlyData> = await response.json();

      const elapsed = Date.now() - startTime;
      console.log(
        `✅ Data received in ${(elapsed / 1000).toFixed(2)} seconds!`
      );

      return data;
    } catch (error) {
      console.error('❌ NASA API request failed:', error);
      throw error;
    }
  }

  /**
   * Fetch daily precipitation data
   * Available: 1980-01-01 to present
   */
  async fetchDailyData(
    request: DailyRequest
  ): Promise<NasaApiResponse<DailyData>> {
    const startTime = Date.now();

    const url = this.buildUrl('daily', {
      latitude: request.latitude,
      longitude: request.longitude,
      parameters: request.parameters.join(','),
      start: request.start,
      end: request.end,
      community: request.community || DEFAULT_COMMUNITY,
      format: request.format || 'JSON',
    });

    console.log(`\n🌍 Fetching daily NASA data...`);
    console.log(`📍 Location: (${request.latitude}, ${request.longitude})`);
    console.log(`📅 Period: ${request.start} to ${request.end}`);

    try {
      const response = await this.fetchWithTimeout(url);

      if (!response.ok) {
        throw new Error(
          `NASA API error: ${response.status} ${response.statusText}`
        );
      }

      const data: NasaApiResponse<DailyData> = await response.json();

      const elapsed = Date.now() - startTime;
      console.log(
        `✅ Data received in ${(elapsed / 1000).toFixed(2)} seconds!`
      );

      return data;
    } catch (error) {
      console.error('❌ NASA API request failed:', error);
      throw error;
    }
  }

  /**
   * Build NASA API URL
   */
  private buildUrl(temporal: string, params: Record<string, any>): string {
    const baseUrl = `${NASA_BASE_URL}/${temporal}/point`;
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return `${baseUrl}?${queryParams.toString()}`;
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const nasaClient = new NasaClientService();