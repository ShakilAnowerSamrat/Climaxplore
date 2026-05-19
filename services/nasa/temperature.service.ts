/**
 * Temperature Service
 *
 * Handles temperature data retrieval and analysis from NASA POWER API.
 * Provides daily averages, min/max temperatures, and heat wave detection.
 *
 * NASA Parameters Used:
 * - T2M: Average temperature at 2 meters (°C)
 * - T2M_MAX: Maximum temperature (°C)
 * - T2M_MIN: Minimum temperature (°C)
 */

import { formatDate } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

export interface DailyTemperatureData {
  date: string;
  avg_temp_celsius: number;
  avg_temp_fahrenheit: number;
  max_temp_celsius: number;
  max_temp_fahrenheit: number;
  min_temp_celsius: number;
  min_temp_fahrenheit: number;
  is_heat_wave: boolean;
  is_cold_wave: boolean;
}

export interface TemperatureHistoricalAnalysis {
  location: {
    latitude: number;
    longitude: number;
  };
  period: {
    month: number;
    day: number;
    years_analyzed: number;
  };
  statistics: {
    avg_temp_celsius: number;
    avg_temp_fahrenheit: number;
    max_temp_celsius: number;
    min_temp_celsius: number;
    hottest_year: number;
    coldest_year: number;
  };
  extremes: {
    heat_wave_days: number;
    heat_wave_probability: number;
    cold_wave_days: number;
    cold_wave_probability: number;
  };
  confidence_level: 'high' | 'medium' | 'low';
}

export interface HourlyTemperatureData {
  datetime: string;
  temp_celsius: number;
  temp_fahrenheit: number;
}

export interface HourlyTemperatureResponse {
  data: HourlyTemperatureData[];
  summary: {
    total_hours: number;
    avg_temp_celsius: number;
    avg_temp_fahrenheit: number;
    max_temp_celsius: number;
    min_temp_celsius: number;
  };
  metadata: {
    time_standard: 'UTC' | 'LST';
    cached: boolean;
    response_time_ms: number;
  };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const HEAT_WAVE_THRESHOLD_CELSIUS = 35; // 95°F
const COLD_WAVE_THRESHOLD_CELSIUS = 0; // 32°F

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Convert Celsius to Fahrenheit
 */
function celsiusToFahrenheit(celsius: number): number {
  return Math.round(((celsius * 9) / 5 + 32) * 10) / 10;
}

/**
 * Determine confidence level based on years of data
 */
function getConfidenceLevel(years: number): 'high' | 'medium' | 'low' {
  if (years >= 15) return 'high';
  if (years >= 10) return 'medium';
  return 'low';
}

// ============================================================================
// CORE SERVICE FUNCTIONS
// ============================================================================

/**
 * Fetch daily temperature data from NASA POWER API
 */
export async function fetchDailyTemperatureData(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<DailyTemperatureData[]> {
  const params = new URLSearchParams({
    parameters: 'T2M,T2M_MAX,T2M_MIN',
    community: 'SB',
    longitude: longitude.toString(),
    latitude: latitude.toString(),
    start: startDate.replace(/-/g, ''),
    end: endDate.replace(/-/g, ''),
    format: 'JSON',
  });

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?${params}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `NASA API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.properties?.parameter) {
    throw new Error('Invalid NASA API response structure');
  }

  const { T2M, T2M_MAX, T2M_MIN } = data.properties.parameter;

  if (!T2M || !T2M_MAX || !T2M_MIN) {
    throw new Error('Missing temperature data in NASA API response');
  }

  // Transform to daily temperature data
  const dailyData: DailyTemperatureData[] = [];

  Object.keys(T2M).forEach((dateKey) => {
    const avgTemp = T2M[dateKey];
    const maxTemp = T2M_MAX[dateKey];
    const minTemp = T2M_MIN[dateKey];

    // Skip invalid data
    if (
      typeof avgTemp !== 'number' ||
      typeof maxTemp !== 'number' ||
      typeof minTemp !== 'number'
    ) {
      return;
    }

    // Validate data quality
    if (isNaN(avgTemp) || isNaN(maxTemp) || isNaN(minTemp)) {
      return;
    }

    // 🚨 CRITICAL: Skip NASA sentinel values for missing data
    // NASA uses -999 to indicate missing/unavailable data
    if (avgTemp <= -999 || maxTemp <= -999 || minTemp <= -999) {
      console.warn(
        `⚠️ Skipping date ${dateKey}: NASA missing data flag (-999)`
      );
      return;
    }

    // Additional sanity check for unrealistic temperatures
    if (
      avgTemp < -100 ||
      avgTemp > 60 ||
      maxTemp < -100 ||
      maxTemp > 60 ||
      minTemp < -100 ||
      minTemp > 60
    ) {
      console.warn(
        `⚠️ Skipping date ${dateKey}: Unrealistic temperature values`
      );
      return;
    }

    dailyData.push({
      date: formatDate(dateKey),
      avg_temp_celsius: Math.round(avgTemp * 10) / 10,
      avg_temp_fahrenheit: celsiusToFahrenheit(avgTemp),
      max_temp_celsius: Math.round(maxTemp * 10) / 10,
      max_temp_fahrenheit: celsiusToFahrenheit(maxTemp),
      min_temp_celsius: Math.round(minTemp * 10) / 10,
      min_temp_fahrenheit: celsiusToFahrenheit(minTemp),
      is_heat_wave: maxTemp >= HEAT_WAVE_THRESHOLD_CELSIUS,
      is_cold_wave: minTemp <= COLD_WAVE_THRESHOLD_CELSIUS,
    });
  });

  return dailyData;
}

/**
 * Analyze historical temperature patterns for a specific date
 */
export async function analyzeHistoricalTemperature(
  latitude: number,
  longitude: number,
  month: number,
  day: number,
  years: number = 10
): Promise<TemperatureHistoricalAnalysis> {
  const currentYear = new Date().getFullYear();

  // ⚡ PERFORMANCE OPTIMIZATION: Fetch all years in parallel!
  // Sequential (OLD): 10 years × 3s/year = 30s total
  // Parallel (NEW): 10 years at once = 3-5s total (10X FASTER!)
  const yearPromises = Array.from({ length: years }, (_, i) => {
    const year = currentYear - 1 - i;
    const date = `${year}-${String(month).padStart(2, '0')}-${String(
      day
    ).padStart(2, '0')}`;

    return fetchDailyTemperatureData(latitude, longitude, date, date)
      .then((yearData) => (yearData.length > 0 ? yearData[0] : null))
      .catch((error) => {
        console.warn(
          `⚠️ Failed to fetch temperature for ${date}:`,
          error.message
        );
        return null;
      });
  });

  // Wait for all years to complete in parallel (FAST!)
  const allData = (await Promise.all(yearPromises)).filter(
    (data): data is DailyTemperatureData => data !== null
  );

  if (allData.length === 0) {
    throw new Error('No temperature data available for the specified period');
  }

  // Calculate statistics
  const avgTemps = allData.map((d) => d.avg_temp_celsius);
  const maxTemps = allData.map((d) => d.max_temp_celsius);
  const minTemps = allData.map((d) => d.min_temp_celsius);

  const avgTemp = avgTemps.reduce((a, b) => a + b, 0) / avgTemps.length;
  const maxTemp = Math.max(...maxTemps);
  const minTemp = Math.min(...minTemps);

  // Find hottest and coldest years
  const hottestIndex = maxTemps.indexOf(maxTemp);
  const coldestIndex = minTemps.indexOf(minTemp);

  const hottestYear = parseInt(allData[hottestIndex].date.split('-')[0]);
  const coldestYear = parseInt(allData[coldestIndex].date.split('-')[0]);

  // Calculate extreme events
  const heatWaveDays = allData.filter((d) => d.is_heat_wave).length;
  const coldWaveDays = allData.filter((d) => d.is_cold_wave).length;

  return {
    location: { latitude, longitude },
    period: {
      month,
      day,
      years_analyzed: allData.length,
    },
    statistics: {
      avg_temp_celsius: Math.round(avgTemp * 10) / 10,
      avg_temp_fahrenheit: celsiusToFahrenheit(avgTemp),
      max_temp_celsius: Math.round(maxTemp * 10) / 10,
      min_temp_celsius: Math.round(minTemp * 10) / 10,
      hottest_year: hottestYear,
      coldest_year: coldestYear,
    },
    extremes: {
      heat_wave_days: heatWaveDays,
      heat_wave_probability:
        Math.round((heatWaveDays / allData.length) * 1000) / 10,
      cold_wave_days: coldWaveDays,
      cold_wave_probability:
        Math.round((coldWaveDays / allData.length) * 1000) / 10,
    },
    confidence_level: getConfidenceLevel(allData.length),
  };
}

/**
 * Fetch hourly temperature data
 */
export async function fetchHourlyTemperatureData(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string,
  timeStandard: 'UTC' | 'LST' = 'LST'
): Promise<HourlyTemperatureData[]> {
  const params = new URLSearchParams({
    parameters: 'T2M',
    community: 'SB',
    longitude: longitude.toString(),
    latitude: latitude.toString(),
    start: startDate.replace(/-/g, ''),
    end: endDate.replace(/-/g, ''),
    format: 'JSON',
    'time-standard': timeStandard,
  });

  const url = `https://power.larc.nasa.gov/api/temporal/hourly/point?${params}`;

  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(
      `NASA API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();

  if (!data.properties?.parameter?.T2M) {
    throw new Error('Invalid NASA API response structure');
  }

  const tempData = data.properties.parameter.T2M;
  const hourlyData: HourlyTemperatureData[] = [];

  // NASA returns flat structure: {"YYYYMMDDhh": value}
  Object.entries(tempData).forEach(([datetimeKey, temp]) => {
    if (typeof temp !== 'number') return;
    if (datetimeKey.length !== 10) return; // YYYYMMDDhh format

    // 🚨 CRITICAL: Skip NASA sentinel values for missing data
    if (temp <= -999 || temp < -100 || temp > 60) {
      console.warn(`⚠️ Skipping ${datetimeKey}: Invalid temperature ${temp}°C`);
      return;
    }

    const year = datetimeKey.substring(0, 4);
    const month = datetimeKey.substring(4, 6);
    const day = datetimeKey.substring(6, 8);
    const hour = datetimeKey.substring(8, 10);

    const tempCelsius = Math.round(temp * 10) / 10;

    hourlyData.push({
      datetime: `${year}-${month}-${day} ${hour}:00`,
      temp_celsius: tempCelsius,
      temp_fahrenheit: celsiusToFahrenheit(tempCelsius),
    });
  });

  return hourlyData;
}