/**
 * 🌤️ Weather Dashboard API - "Will It Rain On My Parade?"
 *
 * Unified endpoint combining ALL weather parameters:
 * - Precipitation probability
 * - Temperature analysis (avg, min, max)
 * - Extreme weather events (heat waves, cold snaps, heavy rain)
 * - Historical trends
 *
 * This is the CHAMPIONSHIP endpoint matching the NASA Space Apps challenge transcript!
 *
 * Endpoint: GET /api/weather/dashboard
 *
 * Query Parameters:
 * - lat: Latitude (-90 to 90)
 * - lon: Longitude (-180 to 180)
 * - month: Month (1-12)
 * - day: Day (1-31)
 * - years: Number of years to analyze (default: 10, max: 20)
 *
 * Example:
 * /api/weather/dashboard?lat=40.7&lon=-74.0&month=6&day=1&years=10
 *
 * Response matches transcript example:
 * - Rain probability: 40%
 * - Average temperature: 26°C (79°F)
 * - Heat wave probability: 10%
 * - Heavy rain probability: 0%
 */

import { getCachedData, setCachedData } from '@/services/cache/cache.service';
import { analyzeExtremeWeather } from '@/services/nasa/extreme-weather.service';
import { PrecipitationService } from '@/services/nasa/precipitation.service';
import { analyzeHistoricalTemperature } from '@/services/nasa/temperature.service';
import { NextRequest, NextResponse } from 'next/server';

// ⚡ Force dynamic rendering (API routes should never be static)
export const dynamic = 'force-dynamic';

const precipService = new PrecipitationService();

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const month = searchParams.get('month');
    const day = searchParams.get('day');
    const years = searchParams.get('years') || '10';

    // Validate required parameters
    if (!lat || !lon || !month || !day) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          required: ['lat', 'lon', 'month', 'day'],
          optional: ['years (default: 10)'],
          example:
            '/api/weather/dashboard?lat=40.7&lon=-74.0&month=6&day=1&years=10',
        },
        { status: 400 }
      );
    }

    // Parse and validate numeric values
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const yearsNum = parseInt(years);

    // Validate ranges
    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Invalid latitude. Must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid longitude. Must be between -180 and 180' },
        { status: 400 }
      );
    }

    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return NextResponse.json(
        { error: 'Invalid month. Must be between 1 and 12' },
        { status: 400 }
      );
    }

    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      return NextResponse.json(
        { error: 'Invalid day. Must be between 1 and 31' },
        { status: 400 }
      );
    }

    if (isNaN(yearsNum) || yearsNum < 1 || yearsNum > 20) {
      return NextResponse.json(
        { error: 'Invalid years. Must be between 1 and 20' },
        { status: 400 }
      );
    }

    // Check if cache should be bypassed (for testing)
    const nocache = searchParams.get('nocache');

    // Check cache first (this is expensive - combine all data)
    const cacheKey = `dashboard:${latitude}:${longitude}:${monthNum}:${dayNum}:${yearsNum}`;
    const cachedResult = nocache ? null : await getCachedData(cacheKey);

    if (cachedResult) {
      const responseTime = Date.now() - startTime;
      return NextResponse.json({
        ...cachedResult,
        metadata: {
          ...(cachedResult as any).metadata,
          cached: true,
          response_time_ms: responseTime,
        },
      });
    }

    // Fetch all data in parallel with error handling for graceful degradation
    const [precipAnalysis, tempAnalysis, extremeAnalysis] =
      await Promise.allSettled([
        precipService.getPrecipitationProbability({
          latitude,
          longitude,
          month: monthNum,
          day: dayNum,
          years: yearsNum,
        }),
        analyzeHistoricalTemperature(
          latitude,
          longitude,
          monthNum,
          dayNum,
          yearsNum
        ),
        analyzeExtremeWeather(latitude, longitude, monthNum, dayNum, yearsNum),
      ]).then((results) => {
        // Extract successful results or provide fallback data
        const precip =
          results[0].status === 'fulfilled'
            ? results[0].value
            : createFallbackPrecipData(
                latitude,
                longitude,
                monthNum,
                dayNum,
                yearsNum
              );

        const temp =
          results[1].status === 'fulfilled'
            ? results[1].value
            : createFallbackTempData(
                latitude,
                longitude,
                monthNum,
                dayNum,
                yearsNum
              );

        const extreme =
          results[2].status === 'fulfilled'
            ? results[2].value
            : createFallbackExtremeData();

        // Log any failures for monitoring
        results.forEach((result, index) => {
          if (result.status === 'rejected') {
            const serviceName = [
              'precipitation',
              'temperature',
              'extreme weather',
            ][index];
            console.warn(
              `⚠️ ${serviceName} service failed:`,
              result.reason?.message || result.reason
            );
          }
        });

        return [precip, temp, extreme] as const;
      });

    const responseTime = Date.now() - startTime;

    // Build unified response matching transcript format
    const result = {
      // Location and date info
      location: {
        latitude,
        longitude,
        coordinates_display: `${latitude.toFixed(2)}°, ${longitude.toFixed(
          2
        )}°`,
      },
      date: {
        month: monthNum,
        day: dayNum,
        display: `${new Date(2000, monthNum - 1, dayNum).toLocaleDateString(
          'en-US',
          { month: 'long', day: 'numeric' }
        )}`,
      },
      period: {
        years_analyzed: precipAnalysis.probability.total_years,
        confidence_level: precipAnalysis.probability.confidence,
      },

      // KEY METRICS (Matching transcript!)
      precipitation: {
        probability: precipAnalysis.probability.probability,
        rainy_days: precipAnalysis.probability.rainy_days,
        dry_days: precipAnalysis.probability.dry_days,
        avg_rainfall_mm: precipAnalysis.probability.avg_precipitation_mm,
        description:
          precipAnalysis.probability.probability >= 60
            ? '☔ High chance of rain - bring an umbrella!'
            : precipAnalysis.probability.probability >= 40
            ? '🌦️ Moderate chance of rain - be prepared'
            : '🌤️ Low chance of rain - enjoy!',
      },

      temperature: {
        avg_celsius: tempAnalysis.statistics.avg_temp_celsius,
        avg_fahrenheit: tempAnalysis.statistics.avg_temp_fahrenheit,
        max_celsius: tempAnalysis.statistics.max_temp_celsius,
        min_celsius: tempAnalysis.statistics.min_temp_celsius,
        hottest_year: tempAnalysis.statistics.hottest_year,
        coldest_year: tempAnalysis.statistics.coldest_year,
        description:
          tempAnalysis.statistics.avg_temp_celsius >= 30
            ? '🔥 Hot day expected - stay hydrated!'
            : tempAnalysis.statistics.avg_temp_celsius >= 20
            ? '☀️ Pleasant temperature'
            : tempAnalysis.statistics.avg_temp_celsius >= 10
            ? '🌥️ Cool day - bring a jacket'
            : '❄️ Cold day - dress warm!',
      },

      extreme_events: {
        hot_days: {
          probability: extremeAnalysis.hot_days.probability,
          total_events: extremeAnalysis.hot_days.total_events,
          worst_event: extremeAnalysis.hot_days.worst_event,
          description:
            extremeAnalysis.hot_days.probability >= 30
              ? `🌡️ ${extremeAnalysis.hot_days.probability}% chance of hot weather (30°C+/86°F+)`
              : extremeAnalysis.hot_days.probability > 0
              ? `Some warm days possible (${extremeAnalysis.hot_days.probability}%)`
              : '✅ No hot weather expected',
        },
        heat_waves: {
          probability: extremeAnalysis.heat_waves.probability,
          total_events: extremeAnalysis.heat_waves.total_events,
          worst_event: extremeAnalysis.heat_waves.worst_event,
          description:
            extremeAnalysis.heat_waves.probability >= 10
              ? `⚠️ ${extremeAnalysis.heat_waves.probability}% chance of extreme heat (32°C+/90°F+)!`
              : extremeAnalysis.heat_waves.probability > 0
              ? `Low risk of heat wave (${extremeAnalysis.heat_waves.probability}%)`
              : '✅ No heat wave risk',
        },
        cold_snaps: {
          probability: extremeAnalysis.cold_snaps.probability,
          total_events: extremeAnalysis.cold_snaps.total_events,
          worst_event: extremeAnalysis.cold_snaps.worst_event,
          description:
            extremeAnalysis.cold_snaps.probability >= 10
              ? `⚠️ ${extremeAnalysis.cold_snaps.probability}% chance of freezing temperatures!`
              : extremeAnalysis.cold_snaps.probability > 0
              ? `Low risk of cold snap (${extremeAnalysis.cold_snaps.probability}%)`
              : '✅ No freezing risk',
        },
        heavy_rain: {
          probability: extremeAnalysis.heavy_rain.probability,
          total_events: extremeAnalysis.heavy_rain.total_events,
          worst_event: extremeAnalysis.heavy_rain.worst_event,
          description:
            extremeAnalysis.heavy_rain.probability >= 10
              ? `⚠️ ${extremeAnalysis.heavy_rain.probability}% chance of heavy rainfall!`
              : extremeAnalysis.heavy_rain.probability > 0
              ? `Low risk of heavy rain (${extremeAnalysis.heavy_rain.probability}%)`
              : '✅ No heavy rain risk',
        },
      },

      // Summary recommendation (like the transcript!)
      recommendation: {
        overall_risk: calculateOverallRisk(precipAnalysis, extremeAnalysis),
        should_have_backup_plan:
          precipAnalysis.probability.probability >= 40 ||
          extremeAnalysis.heat_waves.probability >= 10 ||
          extremeAnalysis.heavy_rain.probability >= 10,
        suggestions: generateSuggestions(
          precipAnalysis,
          tempAnalysis,
          extremeAnalysis
        ),
      },

      metadata: {
        cached: false,
        response_time_ms: responseTime,
        data_source: 'NASA POWER API',
        api_version: 'v1',
        challenge: 'NASA Space Apps 2025 - Will It Rain On My Parade?',
        warnings: [
          ...((precipAnalysis as any).metadata?.fallback
            ? ['Using estimated precipitation data']
            : []),
          ...((tempAnalysis as any).metadata?.fallback
            ? ['Using estimated temperature data']
            : []),
          ...((extremeAnalysis as any).metadata?.fallback
            ? ['Using estimated extreme weather data']
            : []),
        ],
        data_quality:
          (precipAnalysis as any).metadata?.fallback ||
          (tempAnalysis as any).metadata?.fallback ||
          (extremeAnalysis as any).metadata?.fallback
            ? 'partial'
            : 'complete',
      },
    };

    // Cache for 24 hours
    await setCachedData(cacheKey, result, 86400);

    return NextResponse.json(result);
  } catch (error) {
    const responseTime = Date.now() - startTime;
    console.error('Weather dashboard API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch weather dashboard data',
        message: error instanceof Error ? error.message : 'Unknown error',
        response_time_ms: responseTime,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateOverallRisk(
  precipAnalysis: any,
  extremeAnalysis: any
): 'low' | 'medium' | 'high' {
  const rainRisk =
    precipAnalysis.probability.probability >= 60
      ? 2
      : precipAnalysis.probability.probability >= 40
      ? 1
      : 0;
  const hotDayRisk = extremeAnalysis.hot_days.probability >= 30 ? 1 : 0;
  const heatRisk =
    extremeAnalysis.heat_waves.probability >= 10
      ? 2
      : extremeAnalysis.heat_waves.probability > 0
      ? 1
      : 0;
  const coldRisk =
    extremeAnalysis.cold_snaps.probability >= 10
      ? 2
      : extremeAnalysis.cold_snaps.probability > 0
      ? 1
      : 0;
  const heavyRainRisk =
    extremeAnalysis.heavy_rain.probability >= 10
      ? 2
      : extremeAnalysis.heavy_rain.probability > 0
      ? 1
      : 0;

  const totalRisk = rainRisk + hotDayRisk + heatRisk + coldRisk + heavyRainRisk;

  if (totalRisk >= 4) return 'high';
  if (totalRisk >= 2) return 'medium';
  return 'low';
}

function generateSuggestions(
  precipAnalysis: any,
  tempAnalysis: any,
  extremeAnalysis: any
): string[] {
  const suggestions: string[] = [];

  // Rain suggestions
  if (precipAnalysis.probability.probability >= 60) {
    suggestions.push('🏠 Consider booking an indoor backup venue');
    suggestions.push('☔ Have umbrellas and rain gear ready for guests');
  } else if (precipAnalysis.probability.probability >= 40) {
    suggestions.push('⛱️ Have a tent or covered area available');
  }

  // Hot day suggestions (30°C+)
  if (extremeAnalysis.hot_days.probability >= 30) {
    suggestions.push('☀️ Hot weather likely - provide shade and cooling');
    suggestions.push('💧 Have plenty of cold water available');
  }

  // Temperature suggestions based on average
  if (tempAnalysis.statistics.avg_temp_celsius >= 28) {
    suggestions.push('🧊 Ensure plenty of cold drinks and ice available');
    suggestions.push('☂️ Provide shade structures for guests');
  } else if (tempAnalysis.statistics.avg_temp_celsius <= 10) {
    suggestions.push('🔥 Consider heating options or warm beverages');
  }

  // Extreme event suggestions
  if (extremeAnalysis.heat_waves.probability >= 10) {
    suggestions.push('⚠️ Heat wave possible - have cooling stations ready');
  }

  if (extremeAnalysis.heavy_rain.probability >= 10) {
    suggestions.push('⚠️ Heavy rain possible - ensure proper drainage');
  }

  if (suggestions.length === 0) {
    suggestions.push('✅ Weather looks favorable - enjoy your event!');
  }

  return suggestions;
}

// ============================================================================
// FALLBACK DATA FUNCTIONS (For NASA API failures)
// ============================================================================

function createFallbackPrecipData(
  latitude: number,
  longitude: number,
  month: number,
  day: number,
  years: number
) {
  // Provide reasonable default based on latitude (simple climate model)
  const isNearEquator = Math.abs(latitude) < 23.5;
  const isTropicalMonth = month >= 6 && month <= 9; // Summer in Northern Hemisphere

  const baseProbability = isNearEquator
    ? isTropicalMonth
      ? 45
      : 35
    : isTropicalMonth
    ? 30
    : 40;

  return {
    probability: {
      probability: baseProbability,
      rainy_days: Math.round((years * baseProbability) / 100),
      dry_days: years - Math.round((years * baseProbability) / 100),
      total_years: years,
      avg_precipitation_mm: 5.0,
      confidence: 'low' as const,
    },
    location: { latitude, longitude },
    period: { month, day, years_analyzed: years },
    historical: [],
    metadata: {
      data_source: 'Fallback estimate (NASA API unavailable)',
      fallback: true,
    },
  };
}

function createFallbackTempData(
  latitude: number,
  longitude: number,
  month: number,
  day: number,
  years: number
) {
  // Estimate temperature based on latitude and month
  const isNorthernHemisphere = latitude > 0;
  const isSummer = isNorthernHemisphere
    ? month >= 6 && month <= 8
    : month >= 12 || month <= 2;

  const baseTemp = Math.abs(latitude) < 30 ? 25 : 15;
  const seasonalAdjust = isSummer ? 5 : -5;
  const avgTemp = baseTemp + seasonalAdjust;

  return {
    location: { latitude, longitude },
    period: { month, day, years_analyzed: years },
    statistics: {
      avg_temp_celsius: avgTemp,
      avg_temp_fahrenheit: (avgTemp * 9) / 5 + 32,
      max_temp_celsius: avgTemp + 5,
      min_temp_celsius: avgTemp - 5,
      hottest_year: new Date().getFullYear() - 1,
      coldest_year: new Date().getFullYear() - years,
    },
    extremes: {
      heat_wave_days: 0,
      heat_wave_probability: 0,
      cold_wave_days: 0,
      cold_wave_probability: 0,
    },
    historical: [],
    metadata: {
      data_source: 'Fallback estimate (NASA API unavailable)',
      fallback: true,
    },
  };
}

function createFallbackExtremeData() {
  return {
    location: {},
    period: {},
    hot_days: {
      probability: 0,
      total_events: 0,
      worst_event: null,
      description: 'Data unavailable',
    },
    heat_waves: {
      probability: 0,
      total_events: 0,
      worst_event: null,
      description: 'Data unavailable',
    },
    cold_snaps: {
      probability: 0,
      total_events: 0,
      worst_event: null,
      description: 'Data unavailable',
    },
    heavy_rain: {
      probability: 0,
      total_events: 0,
      worst_event: null,
      description: 'Data unavailable',
    },
    metadata: {
      data_source: 'Fallback estimate (NASA API unavailable)',
      fallback: true,
    },
  };
}