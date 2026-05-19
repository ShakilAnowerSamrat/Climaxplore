/**
 * 💧 Precipitation Service
 *
 * Clean business logic for precipitation data
 * Single responsibility: Transform NASA data into domain models
 */

import {
  formatDate,
  formatNasaDate,
  getCurrentYear,
} from '@/lib/utils/date.utils';
import {
  validateDateExists,
  validateDay,
  validateHourlyDateRange,
  validateLatitude,
  validateLongitude,
  validateMonth,
  validateYears,
} from '@/lib/utils/validation.utils';
import { nasaClient } from './nasa-client.service';
import type {
  HistoricalDay,
  HourlyDataPoint,
  HourlyPrecipitationQuery,
  HourlyPrecipitationResult,
  PrecipitationProbabilityQuery,
  PrecipitationProbabilityResult,
} from './types/precipitation.types';

// ============================================================================
// CONSTANTS
// ============================================================================

const PRECIPITATION_PARAM = 'PRECTOTCORR';
const RAINY_THRESHOLD_MM = 0.1; // Minimum mm to count as "rainy"

// ============================================================================
// SERVICE CLASS
// ============================================================================

export class PrecipitationService {
  /**
   * Get precipitation probability for a specific date
   * (Daily API - historical probability)
   */
  async getPrecipitationProbability(
    query: PrecipitationProbabilityQuery
  ): Promise<PrecipitationProbabilityResult> {
    const startTime = Date.now();

    // Validate inputs
    this.validateProbabilityQuery(query);

    // Calculate date range
    const endYear = getCurrentYear();
    const startYear = endYear - query.years + 1;
    const startDate = formatNasaDate(startYear, 1, 1);
    const endDate = formatNasaDate(endYear, 12, 31);

    // Fetch data from NASA
    const nasaData = await nasaClient.fetchDailyData({
      latitude: query.latitude,
      longitude: query.longitude,
      parameters: [PRECIPITATION_PARAM],
      start: startDate,
      end: endDate,
    });

    // Extract precipitation data
    const precipData = nasaData.properties.parameter[PRECIPITATION_PARAM];

    // Filter for target month/day across all years
    const historical: HistoricalDay[] = [];
    const targetMonth = query.month.toString().padStart(2, '0');
    const targetDay = query.day.toString().padStart(2, '0');

    Object.entries(precipData).forEach(([dateKey, value]) => {
      if (typeof value !== 'number') return; 

      // 🚨 CRITICAL: Skip NASA sentinel values for missing data
      if (value <= -999 || value < 0) {
        console.warn(
          `⚠️ Skipping ${dateKey}: Invalid precipitation ${value}mm`
        );
        return;
      }

      const month = dateKey.substring(4, 6);
      const day = dateKey.substring(6, 8);

      if (month === targetMonth && day === targetDay) {
        const year = parseInt(dateKey.substring(0, 4));
        const precipitation = value;

        historical.push({
          year,
          date: formatDate(year, query.month, query.day),
          precipitation_mm: precipitation,
          was_rainy: precipitation >= RAINY_THRESHOLD_MM,
        });
      }
    });

    // Sort by year (newest first)
    historical.sort((a, b) => b.year - a.year);

    // Calculate statistics
    const rainyDays = historical.filter((d) => d.was_rainy).length;
    const dryDays = historical.length - rainyDays;
    const probability =
      historical.length > 0 ? (rainyDays / historical.length) * 100 : 0;

    const precipValues = historical.map((d) => d.precipitation_mm);
    const avgPrecip =
      precipValues.reduce((sum, val) => sum + val, 0) / historical.length;
    const maxPrecip = Math.max(...precipValues);
    const minPrecip = Math.min(...precipValues);

    const confidence = this.calculateConfidence(historical.length);

    const elapsed = Date.now() - startTime;

    console.log(`📊 Results for ${query.month}/${query.day}:`);
    console.log(`   Sample size: ${historical.length} years`);
    console.log(`   Rain probability: ${probability.toFixed(1)}%`);

    return {
      query: {
        latitude: query.latitude,
        longitude: query.longitude,
        month: query.month,
        day: query.day,
        years: query.years,
      },
      probability: {
        probability: Math.round(probability * 10) / 10,
        rainy_days: rainyDays,
        dry_days: dryDays,
        total_years: historical.length,
        avg_precipitation_mm: Math.round(avgPrecip * 100) / 100,
        max_precipitation_mm: Math.round(maxPrecip * 100) / 100,
        min_precipitation_mm: Math.round(minPrecip * 100) / 100,
        confidence,
      },
      historical_data: historical,
      source: {
        dataset: 'NASA MERRA-2',
        api: 'NASA POWER API (Daily)',
        description:
          'Modern-Era Retrospective analysis for Research and Applications, Version 2',
      },
      metadata: {
        fetched_at: new Date().toISOString(),
        response_time_ms: elapsed,
      },
    };
  }

  /**
   * Get hourly precipitation data for a date range
   * (Hourly API - available 2001-present)
   */
  async getHourlyPrecipitation(
    query: HourlyPrecipitationQuery
  ): Promise<HourlyPrecipitationResult> {
    const startTime = Date.now();

    // Validate inputs
    this.validateHourlyQuery(query);

    // Convert dates to NASA format (YYYYMMDD)
    const [startY, startM, startD] = query.startDate.split('-').map(Number);
    const [endY, endM, endD] = query.endDate.split('-').map(Number);
    const startDate = formatNasaDate(startY, startM, startD);
    const endDate = formatNasaDate(endY, endM, endD);

    // Fetch data from NASA
    const nasaData = await nasaClient.fetchHourlyData({
      latitude: query.latitude,
      longitude: query.longitude,
      parameters: [PRECIPITATION_PARAM],
      start: startDate,
      end: endDate,
      timeStandard: query.timeStandard || 'LST',
    });

    // Extract hourly precipitation data
    const precipData = nasaData.properties.parameter[PRECIPITATION_PARAM];

    // Transform to domain model
    const hourlyData: HourlyDataPoint[] = [];
    let totalPrecip = 0;
    let rainyHours = 0;

    // NASA returns flat structure: {"YYYYMMDDhh": value}
    Object.entries(precipData).forEach(([datetimeKey, precip]) => {
      // Skip if not a number (could be metadata)
      if (typeof precip !== 'number') return;

      // Parse datetime: YYYYMMDDhh (10 digits)
      if (datetimeKey.length !== 10) return;

      // 🚨 CRITICAL: Skip NASA sentinel values for missing data
      if (precip <= -999 || precip < 0) {
        console.warn(
          `⚠️ Skipping ${datetimeKey}: Invalid precipitation ${precip}mm`
        );
        return;
      }

      const year = datetimeKey.substring(0, 4);
      const month = datetimeKey.substring(4, 6);
      const day = datetimeKey.substring(6, 8);
      const hour = datetimeKey.substring(8, 10);

      const date = `${year}-${month}-${day}`;
      const precipitation = precip;
      const isRaining = precipitation >= RAINY_THRESHOLD_MM;

      hourlyData.push({
        datetime: `${date} ${hour}:00`,
        precipitation_mm_per_hour: Math.round(precipitation * 100) / 100,
        is_raining: isRaining,
      });

      totalPrecip += precipitation;
      if (isRaining) rainyHours++;
    });

    // Sort by datetime
    hourlyData.sort((a, b) => a.datetime.localeCompare(b.datetime));

    // Calculate statistics
    const precipValues = hourlyData.map((d) => d.precipitation_mm_per_hour);
    const maxPrecip = Math.max(...precipValues, 0);
    const avgPrecip =
      hourlyData.length > 0 ? totalPrecip / hourlyData.length : 0;

    const elapsed = Date.now() - startTime;

    return {
      query,
      data: hourlyData,
      statistics: {
        total_hours: hourlyData.length,
        rainy_hours: rainyHours,
        dry_hours: hourlyData.length - rainyHours,
        total_precipitation_mm: Math.round(totalPrecip * 100) / 100,
        avg_precipitation_mm_per_hour: Math.round(avgPrecip * 100) / 100,
        max_precipitation_mm_per_hour: Math.round(maxPrecip * 100) / 100,
      },
      source: {
        dataset: 'NASA MERRA-2',
        api: 'NASA POWER API (Hourly)',
        time_standard: query.timeStandard || 'LST',
      },
      metadata: {
        fetched_at: new Date().toISOString(),
        response_time_ms: elapsed,
      },
    };
  }

  // ==========================================================================
  // PRIVATE HELPERS
  // ==========================================================================

  private validateProbabilityQuery(query: PrecipitationProbabilityQuery): void {
    validateLatitude(query.latitude);
    validateLongitude(query.longitude);
    validateMonth(query.month);
    validateDay(query.day, query.month);
    validateYears(query.years);

    // Validate date exists
    const year = getCurrentYear();
    validateDateExists(year, query.month, query.day);
  }

  private validateHourlyQuery(query: HourlyPrecipitationQuery): void {
    validateLatitude(query.latitude);
    validateLongitude(query.longitude);
    validateHourlyDateRange(query.startDate, query.endDate);
  }

  private calculateConfidence(sampleSize: number): 'high' | 'medium' | 'low' {
    if (sampleSize >= 15) return 'high';
    if (sampleSize >= 10) return 'medium';
    return 'low';
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const precipitationService = new PrecipitationService();