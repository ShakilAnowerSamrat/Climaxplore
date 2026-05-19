/**
 * 🛰️ NASA Multi-Day Forecast API
 *
 * Provides 5-7 day weather forecast based on NASA historical patterns
 * Uses dashboard API for each day to get comprehensive weather data
 *
 * Endpoint: GET /api/weather/nasa/forecast
 *
 * Query Parameters:
 * - lat: Latitude (required)
 * - lon: Longitude (required)
 * - start_date: Start date in YYYY-MM-DD format (required)
 * - days: Number of days (default: 7, max: 14)
 *
 * Example:
 * /api/weather/nasa/forecast?lat=23.76&lon=90.39&start_date=2024-10-13&days=7
 */

import { sendError, sendSuccess } from '@/lib/utils/response.utils';
import {
  validateLatitude,
  validateLongitude,
  ValidationError,
} from '@/lib/utils/validation.utils';
import { NextRequest } from 'next/server';

// Import the dashboard data fetching logic
async function fetchDashboardData(
  lat: number,
  lon: number,
  month: number,
  day: number,
  years: number = 10
) {
  // Call the dashboard API internally
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lon.toString(),
    month: month.toString(),
    day: day.toString(),
    years: years.toString(),
  });

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const response = await fetch(`${baseUrl}/api/weather/dashboard?${params}`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Dashboard API error: ${response.statusText}`);
  }

  return response.json();
}

// ⚡ Force dynamic rendering (API routes should never be static)
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse query parameters
    const { searchParams } = request.nextUrl;
    const lat = parseFloat(searchParams.get('lat') || '');
    const lon = parseFloat(searchParams.get('lon') || '');
    const startDate = searchParams.get('start_date') || '';
    const days = parseInt(searchParams.get('days') || '7');

    // Validate required params
    if (isNaN(lat) || isNaN(lon) || !startDate) {
      return sendError(
        'MISSING_PARAMETERS',
        'Required parameters: lat, lon, start_date (YYYY-MM-DD)',
        400
      );
    }

    // Validate inputs
    validateLatitude(lat);
    validateLongitude(lon);

    // Validate days
    if (isNaN(days) || days < 1 || days > 14) {
      return sendError('INVALID_DAYS', 'Days must be between 1 and 14', 400);
    }

    // Parse start date
    const start = new Date(startDate);
    if (isNaN(start.getTime())) {
      return sendError(
        'INVALID_DATE',
        'Invalid start_date format. Use YYYY-MM-DD',
        400
      );
    }

    console.log(`\n🛰️ NASA Forecast API:`);
    console.log(`   Location: (${lat}, ${lon})`);
    console.log(`   Start Date: ${startDate}`);
    console.log(`   Days: ${days}`);

    // Fetch data for each day in parallel
    const forecastPromises = [];
    const forecastDates = [];

    for (let i = 0; i < days; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);

      const month = currentDate.getMonth() + 1;
      const day = currentDate.getDate();
      const dateStr = currentDate.toISOString().split('T')[0];

      forecastDates.push({
        date: dateStr,
        day_of_week: currentDate.toLocaleDateString('en-US', {
          weekday: 'long',
        }),
        month,
        day,
      });

      forecastPromises.push(fetchDashboardData(lat, lon, month, day));
    }

    console.log(`📊 Fetching ${days} days of forecast data...`);

    // Fetch all days in parallel
    const forecastResults = await Promise.all(forecastPromises);

    // Build forecast array
    const forecast = forecastDates.map((dateInfo, index) => {
      const data = forecastResults[index];

      return {
        date: dateInfo.date,
        day_of_week: dateInfo.day_of_week,
        temperature: {
          avg_celsius: data.temperature.avg_celsius,
          avg_fahrenheit: data.temperature.avg_fahrenheit,
          max_celsius: data.temperature.max_celsius,
          min_celsius: data.temperature.min_celsius,
        },
        precipitation: {
          probability: data.precipitation.probability,
          avg_rainfall_mm: data.precipitation.avg_rainfall_mm,
          description: data.precipitation.description,
        },
        extreme_events: {
          hot_day_probability: data.extreme_events.hot_days.probability,
          heat_wave_probability: data.extreme_events.heat_waves.probability,
          heavy_rain_probability: data.extreme_events.heavy_rain.probability,
        },
        recommendation: {
          overall_risk: data.recommendation.overall_risk,
          should_have_backup_plan: data.recommendation.should_have_backup_plan,
        },
      };
    });

    const responseTime = Date.now() - startTime;

    const response = {
      start_date: startDate,
      days_count: days,
      location: {
        latitude: lat,
        longitude: lon,
        coordinates_display: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
      },
      forecast,
      source: {
        dataset: 'NASA MERRA-2',
        api: 'NASA POWER API (Daily)',
        description:
          'Historical weather patterns based on 20 years of data for each date',
      },
      metadata: {
        fetched_at: new Date().toISOString(),
        response_time_ms: responseTime,
        parallel_requests: days,
      },
    };

    console.log(`✅ Success - ${responseTime}ms for ${days} days`);
    console.log(
      `📊 Average fetch time per day: ${(responseTime / days).toFixed(0)}ms`
    );

    return sendSuccess(response, responseTime, false);
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError('VALIDATION_ERROR', error.message, 400, error.field);
    }

    console.error('❌ Forecast API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return sendError('SERVICE_ERROR', message, 503);
  }
}

export const revalidate = 3600; // Cache for 1 hour (historical data doesn't change)