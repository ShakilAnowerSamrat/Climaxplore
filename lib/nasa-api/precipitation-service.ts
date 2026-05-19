/**
 * 🛰️ NASA Precipitation Service
 *
 * Clean separation of business logic for precipitation data fetching.
 * Handles NASA POWER API integration with proper error handling.
 *
 * @module lib/nasa-api/precipitation-service
 */

import { NASADataFetcher } from './merra2-fetcher';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface PrecipitationQuery {
  latitude: number;
  longitude: number;
  month: number;
  day: number;
  years?: number;
}

export interface PrecipitationProbability {
  probability: number;
  rainy_days: number;
  dry_days: number;
  total_years: number;
  avg_precipitation_mm: number;
  max_precipitation_mm: number;
  min_precipitation_mm: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface HistoricalDay {
  year: number;
  date: string;
  precipitation_mm: number;
  was_rainy: boolean;
}

export interface PrecipitationResult {
  query: {
    latitude: number;
    longitude: number;
    month: number;
    day: number;
    years: number;
  };
  probability: PrecipitationProbability;
  historical_data: HistoricalDay[];
  source: {
    dataset: string;
    api: string;
    description: string;
  };
  metadata: {
    fetched_at: string;
    response_time_ms: number;
  };
}

export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class PrecipitationService {
  private fetcher: NASADataFetcher;
  private readonly RAIN_THRESHOLD_MM = 0.1;

  constructor() {
    this.fetcher = new NASADataFetcher();
  }

  /**
   * Validate precipitation query parameters
   */
  private validateQuery(query: PrecipitationQuery): void {
    const { latitude, longitude, month, day, years = 20 } = query;

    // Validate latitude
    if (latitude < -90 || latitude > 90) {
      throw new ValidationError(
        'Latitude must be between -90 and 90 degrees',
        'latitude'
      );
    }

    // Validate longitude
    if (longitude < -180 || longitude > 180) {
      throw new ValidationError(
        'Longitude must be between -180 and 180 degrees',
        'longitude'
      );
    }

    // Validate month
    if (month < 1 || month > 12) {
      throw new ValidationError('Month must be between 1 and 12', 'month');
    }

    // Validate day
    if (day < 1 || day > 31) {
      throw new ValidationError('Day must be between 1 and 31', 'day');
    }

    // Validate years
    if (years < 1 || years > 50) {
      throw new ValidationError('Years must be between 1 and 50', 'years');
    }

    // Validate date exists (basic check)
    const daysInMonth = new Date(2024, month, 0).getDate();
    if (day > daysInMonth) {
      throw new ValidationError(
        `Day ${day} does not exist in month ${month}`,
        'day'
      );
    }
  }

  /**
   * Calculate confidence level based on sample size
   */
  private calculateConfidence(sampleSize: number): 'high' | 'medium' | 'low' {
    if (sampleSize >= 15) return 'high';
    if (sampleSize >= 10) return 'medium';
    return 'low';
  }

  /**
   * Format historical data for response
   */
  private formatHistoricalData(
    dates: string[],
    precipitation: number[]
  ): HistoricalDay[] {
    return dates.map((date, index) => ({
      year: parseInt(date.substring(0, 4)),
      date,
      precipitation_mm: Math.round(precipitation[index] * 100) / 100,
      was_rainy: precipitation[index] > this.RAIN_THRESHOLD_MM,
    }));
  }

  /**
   * Get precipitation probability for a specific date
   *
   * @param query - Precipitation query parameters
   * @returns Precipitation probability result
   * @throws {ValidationError} If query parameters are invalid
   * @throws {ServiceError} If NASA API fails
   */
  async getPrecipitationProbability(
    query: PrecipitationQuery
  ): Promise<PrecipitationResult> {
    const startTime = Date.now();

    try {
      // Validate input
      this.validateQuery(query);

      const { latitude, longitude, month, day, years = 20 } = query;

      // Fetch data from NASA POWER API
      const data = await this.fetcher.fetchDateProbability(
        latitude,
        longitude,
        month,
        day,
        years
      );

      // Calculate additional statistics
      const precipitationValues = data.historical_days.map(
        (d) => d.precipitation_mm
      );
      const maxPrecipitation = Math.max(...precipitationValues);
      const minPrecipitation = Math.min(...precipitationValues);
      const confidence = this.calculateConfidence(data.historical_days.length);

      // Calculate rainy/dry days
      const rainyDays = data.historical_days.filter(
        (d) => d.precipitation_mm > this.RAIN_THRESHOLD_MM
      ).length;
      const dryDays = data.historical_days.length - rainyDays;

      // Format historical data
      const historicalData = data.historical_days.map((d) => ({
        year: d.year,
        date: `${d.year}-${String(month).padStart(2, '0')}-${String(
          day
        ).padStart(2, '0')}`,
        precipitation_mm: d.precipitation_mm,
        was_rainy: d.precipitation_mm > this.RAIN_THRESHOLD_MM,
      }));

      // Build result
      const result: PrecipitationResult = {
        query: {
          latitude,
          longitude,
          month,
          day,
          years,
        },
        probability: {
          probability: data.probability,
          rainy_days: rainyDays,
          dry_days: dryDays,
          total_years: data.historical_days.length,
          avg_precipitation_mm: data.avg_precipitation,
          max_precipitation_mm: Math.round(maxPrecipitation * 100) / 100,
          min_precipitation_mm: Math.round(minPrecipitation * 100) / 100,
          confidence,
        },
        historical_data: historicalData,
        source: {
          dataset: 'NASA MERRA-2',
          api: 'NASA POWER API',
          description:
            'Modern-Era Retrospective analysis for Research and Applications, Version 2',
        },
        metadata: {
          fetched_at: new Date().toISOString(),
          response_time_ms: Date.now() - startTime,
        },
      };

      return result;
    } catch (error) {
      // Re-throw validation errors as-is
      if (error instanceof ValidationError) {
        throw error;
      }

      // Wrap other errors as service errors
      if (error instanceof Error) {
        throw new ServiceError(
          `Failed to fetch precipitation data: ${error.message}`,
          'NASA_API_ERROR',
          503
        );
      }

      throw new ServiceError('Unknown error occurred', 'UNKNOWN_ERROR', 500);
    }
  }

  /**
   * Health check for the service
   */
  async healthCheck(): Promise<{ healthy: boolean; message: string }> {
    try {
      // Simple test query (Seattle)
      await this.fetcher.fetchDateProbability(47.6, -122.3, 7, 15, 1);
      return {
        healthy: true,
        message: 'NASA POWER API is responding',
      };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Service unavailable',
      };
    }
  }
}