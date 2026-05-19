/**
 * ⏰ Hourly Precipitation API
 *
 * Thin route handler - delegates to services
 * Endpoint: GET /api/precipitation/hourly
 *
 * Available: 2001-01-01 to present
 * Time standards: UTC or LST (Local Solar Time)
 */

import { sendError, sendSuccess } from '@/lib/utils/response.utils';
import { ValidationError } from '@/lib/utils/validation.utils';
import { precipitationService } from '@/services';
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
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';
    const timeStandard = (searchParams.get('time_standard') || 'LST') as
      | 'UTC'
      | 'LST';

    // Validate required params
    if (isNaN(lat) || isNaN(lon) || !startDate || !endDate) {
      return sendError(
        'MISSING_PARAMETERS',
        'Required parameters: lat, lon, start_date (YYYY-MM-DD), end_date (YYYY-MM-DD)',
        400
      );
    }

    console.log(`\n🎯 Hourly Precipitation API:`);
    console.log(`   Location: (${lat}, ${lon})`);
    console.log(`   Period: ${startDate} to ${endDate}`);
    console.log(`   Time Standard: ${timeStandard}`);

    // Fetch from service (hourly data not cached due to size)
    const result = await precipitationService.getHourlyPrecipitation({
      latitude: lat,
      longitude: lon,
      startDate,
      endDate,
      timeStandard,
    });

    const responseTime = Date.now() - startTime;
    console.log(`✅ Success - Response: ${responseTime}ms`);
    console.log(`📊 Data points: ${result.data.length} hours`);

    return sendSuccess(result, responseTime, false);
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError('VALIDATION_ERROR', error.message, 400, error.field);
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return sendError('SERVICE_ERROR', message, 503);
  }
}

export const revalidate = 1800; // Cache at CDN level for 30 minutes