/**
 * 💧 Precipitation Domain Types
 *
 * Clean domain types for precipitation data
 */

// ============================================================================
// QUERY TYPES
// ============================================================================

export interface BaseQuery {
  latitude: number;
  longitude: number;
}

export interface PrecipitationProbabilityQuery extends BaseQuery {
  month: number;
  day: number;
  years: number;
}

export interface HourlyPrecipitationQuery extends BaseQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  timeStandard?: 'UTC' | 'LST';
}

export interface DailyPrecipitationQuery extends BaseQuery {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

// ============================================================================
// RESULT TYPES
// ============================================================================

export interface HistoricalDay {
  year: number;
  date: string; // YYYY-MM-DD
  precipitation_mm: number;
  was_rainy: boolean;
}

export interface HourlyDataPoint {
  datetime: string; // YYYY-MM-DD HH:00
  precipitation_mm_per_hour: number;
  is_raining: boolean;
}

export interface DailyDataPoint {
  date: string; // YYYY-MM-DD
  precipitation_mm: number;
  is_rainy: boolean;
}

export interface PrecipitationProbabilityResult {
  query: {
    latitude: number;
    longitude: number;
    month: number;
    day: number;
    years: number;
  };
  probability: {
    probability: number;
    rainy_days: number;
    dry_days: number;
    total_years: number;
    avg_precipitation_mm: number;
    max_precipitation_mm: number;
    min_precipitation_mm: number;
    confidence: 'high' | 'medium' | 'low';
  };
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

export interface HourlyPrecipitationResult {
  query: HourlyPrecipitationQuery;
  data: HourlyDataPoint[];
  statistics: {
    total_hours: number;
    rainy_hours: number;
    dry_hours: number;
    total_precipitation_mm: number;
    avg_precipitation_mm_per_hour: number;
    max_precipitation_mm_per_hour: number;
  };
  source: {
    dataset: string;
    api: string;
    time_standard: string;
  };
  metadata: {
    fetched_at: string;
    response_time_ms: number;
  };
}

export interface DailyPrecipitationResult {
  query: DailyPrecipitationQuery;
  data: DailyDataPoint[];
  statistics: {
    total_days: number;
    rainy_days: number;
    dry_days: number;
    total_precipitation_mm: number;
    avg_precipitation_mm_per_day: number;
    max_precipitation_mm_per_day: number;
  };
  source: {
    dataset: string;
    api: string;
  };
  metadata: {
    fetched_at: string;
    response_time_ms: number;
  };
}