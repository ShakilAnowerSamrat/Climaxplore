/**
 * 🛰️ NASA Selected Date API
 *
 * Combines hourly temperature + precipitation data for a specific date
 * This endpoint aggregates data from multiple NASA APIs into one response
 *
 * Endpoint: GET /api/weather/nasa/selected-date
 *
 * Query Parameters:
 * - lat: Latitude (required)
 * - lon: Longitude (required)
 * - date: Date in YYYY-MM-DD format (required)
 *
 * Example:
 * /api/weather/nasa/selected-date?lat=23.76&lon=90.39&date=2024-10-13
 */

import { sendError, sendSuccess } from '@/lib/utils/response.utils';
import {
  validateHourlyDateRange,
  validateLatitude,
  validateLongitude,
  ValidationError,
} from '@/lib/utils/validation.utils';
import { precipitationService } from '@/services';
import { fetchHourlyTemperatureData } from '@/services/nasa/temperature.service';
import { NextRequest } from 'next/server';

// ⚡ Force dynamic rendering (API routes should never be static)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');
    const date = searchParams.get('date') || '';

    // Validate required params
    if (isNaN(lat) || isNaN(lon) || !date) {
      return sendError(
        'MISSING_PARAMETERS',
        'Required parameters: lat, lon, date (YYYY-MM-DD)',
        400
      );
    }

    // Validate inputs
    validateLatitude(lat);
    validateLongitude(lon);
    validateHourlyDateRange(date, date);

    console.log(`\n🛰️ NASA Selected Date API:`);
    console.log(`   Location: (${lat}, ${lon})`);
    console.log(`   Date: ${date}`);

    // Fetch temperature and precipitation data in parallel
    const [tempDataArray, precipData] = await Promise.all([
      fetchHourlyTemperatureData(lat, lon, date, date, 'LST'),
      precipitationService.getHourlyPrecipitation({
        latitude: lat,
        longitude: lon,
        startDate: date,
        endDate: date,
        timeStandard: 'LST',
      }),
    ]);

    // Calculate temperature statistics
    const tempCelsius = tempDataArray.map((d) => d.temp_celsius);
    const tempFahrenheit = tempDataArray.map((d) => d.temp_fahrenheit);

    const tempStats = {
      avg_temperature_celsius:
        tempCelsius.reduce((a, b) => a + b, 0) / tempCelsius.length,
      max_temperature_celsius: Math.max(...tempCelsius),
      min_temperature_celsius: Math.min(...tempCelsius),
      avg_temperature_fahrenheit:
        tempFahrenheit.reduce((a, b) => a + b, 0) / tempFahrenheit.length,
      max_temperature_fahrenheit: Math.max(...tempFahrenheit),
      min_temperature_fahrenheit: Math.min(...tempFahrenheit),
    };

    const precipStats = precipData.statistics;

    // Calculate extreme events
    const hotHours = tempDataArray.filter((d) => d.temp_celsius >= 30).length;
    const heatWaveHours = tempDataArray.filter(
      (d) => d.temp_celsius >= 32
    ).length;

    // Build response
    const response = {
      date,
      location: {
        latitude: lat,
        longitude: lon,
        coordinates_display: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      },
      temperature: {
        hourly: tempDataArray.map((d) => ({
          hour: d.datetime.split(' ')[1].substring(0, 5), // "14:00"
          celsius: d.temp_celsius,
          fahrenheit: d.temp_fahrenheit,
        })),
        statistics: {
          avg_celsius: tempStats.avg_temperature_celsius,
          max_celsius: tempStats.max_temperature_celsius,
          min_celsius: tempStats.min_temperature_celsius,
          avg_fahrenheit: tempStats.avg_temperature_fahrenheit,
          max_fahrenheit: tempStats.max_temperature_fahrenheit,
          min_fahrenheit: tempStats.min_temperature_fahrenheit,
        },
      },
      precipitation: {
        hourly: precipData.data.map((d) => ({
          hour: d.datetime.split(' ')[1].substring(0, 5), // "14:00"
          mm_per_hour: d.precipitation_mm_per_hour,
          is_raining: d.is_raining,
        })),
        statistics: {
          total_mm: precipStats.total_precipitation_mm,
          avg_mm_per_hour: precipStats.avg_precipitation_mm_per_hour,
          max_mm_per_hour: precipStats.max_precipitation_mm_per_hour,
          rainy_hours: precipStats.rainy_hours,
          dry_hours: precipStats.dry_hours,
          rain_probability: Math.round(
            (precipStats.rainy_hours / precipStats.total_hours) * 100
          ),
        },
      },
      extreme_events: {
        hot_hours: hotHours,
        hot_hours_percentage: Math.round((hotHours / 24) * 100),
        heat_wave_hours: heatWaveHours,
        heat_wave_percentage: Math.round((heatWaveHours / 24) * 100),
      },
      source: {
        dataset: 'NASA MERRA-2',
        api: 'NASA POWER API (Hourly)',
        time_standard: 'LST (Local Solar Time)',
        description:
          'Historical hourly weather patterns based on 20+ years of data',
      },
      metadata: {
        fetched_at: new Date().toISOString(),
        response_time_ms: Date.now() - startTime,
        data_points: {
          temperature: tempDataArray.length,
          precipitation: precipData.data.length,
        },
      },
    };

    console.log(`✅ Success - ${response.metadata.response_time_ms}ms`);
    console.log(
      `📊 Temperature: ${response.temperature.statistics.avg_celsius}°C`
    );
    console.log(
      `💧 Rain probability: ${response.precipitation.statistics.rain_probability}%`
    );

    return sendSuccess(response, Date.now() - startTime, false);
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError('VALIDATION_ERROR', error.message, 400, error.field);
    }

    console.error('❌ Selected Date API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return sendError('SERVICE_ERROR', message, 503);
  }
}

export const revalidate = 3600; // Cache for 1 hour (historical data doesn't change)