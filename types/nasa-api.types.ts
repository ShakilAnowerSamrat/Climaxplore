/**
 * 🛰️ NASA API Response Types
 *
 * Proper TypeScript interfaces for NASA POWER API responses
 * Eliminates 'any' types and ensures type safety
 */

// ============================================================================
// DASHBOARD API (20-year historical averages for a specific date)
// ============================================================================

export interface NASADashboardResponse {
  location: {
    latitude: number;
    longitude: number;
    coordinates_display: string;
  };
  date: {
    month: number;
    day: number;
    display: string;
  };
  period: {
    years_analyzed: number;
    confidence_level: 'high' | 'medium' | 'low';
  };
  precipitation: {
    probability: number;
    rainy_days: number;
    dry_days: number;
    avg_rainfall_mm: number;
    description: string;
  };
  temperature: {
    avg_celsius: number;
    avg_fahrenheit: number;
    max_celsius: number;
    min_celsius: number;
    hottest_year: number;
    coldest_year: number;
    description: string;
  };
  extreme_events: {
    hot_days: {
      probability: number;
      total_events: number;
      worst_event: ExtremeEvent | null;
      description: string;
    };
    heat_waves: {
      probability: number;
      total_events: number;
      worst_event: ExtremeEvent | null;
      description: string;
    };
    cold_snaps: {
      probability: number;
      total_events: number;
      worst_event: ExtremeEvent | null;
      description: string;
    };
    heavy_rain: {
      probability: number;
      total_events: number;
      worst_event: ExtremeEvent | null;
      description: string;
    };
  };
  recommendation: {
    overall_risk: 'low' | 'moderate' | 'high';
    should_have_backup_plan: boolean;
    suggestions: string[];
  };
  metadata: {
    cached: boolean;
    response_time_ms: number;
    data_source: string;
    api_version: string;
    challenge: string;
  };
}

interface ExtremeEvent {
  type: string;
  date: string;
  severity: 'low' | 'moderate' | 'high' | 'extreme';
  value: number;
  unit: string;
  threshold: number;
}

// ============================================================================
// SELECTED DATE API (Hourly data for a specific date)
// ============================================================================

export interface NASASelectedDateResponse {
  date: string;
  location: {
    latitude: number;
    longitude: number;
    coordinates_display: string;
  };
  temperature: {
    hourly: HourlyTemperature[];
    statistics: {
      avg_celsius: number;
      max_celsius: number;
      min_celsius: number;
      avg_fahrenheit: number;
      max_fahrenheit: number;
      min_fahrenheit: number;
    };
  };
  precipitation: {
    hourly: HourlyPrecipitation[];
    statistics: {
      total_mm: number;
      avg_mm_per_hour: number;
      max_mm_per_hour: number;
      rainy_hours: number;
      dry_hours: number;
      rain_probability: number;
    };
  };
  extreme_events: {
    hot_hours: number;
    hot_hours_percentage: number;
    heat_wave_hours: number;
    heat_wave_percentage: number;
  };
  source: {
    dataset: string;
    api: string;
    time_standard: string;
    description: string;
  };
  metadata: {
    fetched_at: string;
    response_time_ms: number;
    data_points: {
      temperature: number;
      precipitation: number;
    };
  };
}

interface HourlyTemperature {
  hour: string;
  celsius: number;
  fahrenheit: number;
}

interface HourlyPrecipitation {
  hour: string;
  mm_per_hour: number;
  is_raining: boolean;
}

// ============================================================================
// FORECAST API (7-14 day forecast)
// ============================================================================

export interface NASAForecastResponse {
  start_date: string;
  days_count: number;
  location: {
    latitude: number;
    longitude: number;
    coordinates_display: string;
  };
  forecast: ForecastDay[];
  source: {
    dataset: string;
    api: string;
    description: string;
  };
  metadata: {
    fetched_at: string;
    response_time_ms: number;
    parallel_requests: number;
  };
}

export interface ForecastDay {
  date: string;
  day_of_week: string;
  temperature: {
    avg_celsius: number;
    max_celsius: number;
    min_celsius: number;
  };
  precipitation: {
    probability: number;
    avg_mm: number;
    description: string;
  };
  extreme_events: {
    hot_day_probability: number;
    heat_wave_probability: number;
    cold_snap_probability: number;
    heavy_rain_probability: number;
  };
  recommendation: {
    overall_risk: 'low' | 'moderate' | 'high';
    should_have_backup_plan: boolean;
  };
  wind?: {
    avg_speed_ms: number;
  };
}

// ============================================================================
// API WRAPPER (What we actually receive from endpoints)
// ============================================================================

export interface APISuccessResponse<T> {
  success: true;
  data: T;
  metadata: {
    fetched_at: string;
    response_time_ms: number;
    cached: boolean;
  };
}

export interface APIErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    statusCode: number;
  };
  timestamp: string;
}

// ============================================================================
// TYPE GUARDS (Runtime type checking)
// ============================================================================

export function isNASADashboardResponse(
  data: any
): data is NASADashboardResponse {
  return (
    data &&
    typeof data === 'object' &&
    data.temperature &&
    typeof data.temperature.avg_celsius === 'number' &&
    data.precipitation &&
    typeof data.precipitation.probability === 'number'
  );
}

export function isNASASelectedDateResponse(
  data: any
): data is NASASelectedDateResponse {
  return (
    data &&
    typeof data === 'object' &&
    data.temperature &&
    data.temperature.statistics &&
    typeof data.temperature.statistics.avg_celsius === 'number'
  );
}

export function isNASAForecastResponse(
  data: any
): data is NASAForecastResponse {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.forecast) &&
    data.forecast.length > 0
  );
}