/**
 * 📅 Daily Precipitation Probability API
 *
 * Thin route handler - delegates to services
 * Endpoint: GET /api/precipitation/daily
 */

import { sendError, sendSuccess } from '@/lib/utils/response.utils';
import { ValidationError } from '@/lib/utils/validation.utils';
import { precipitationService } from '@/services';
import { cacheService } from '@/services/cache/cache.service';
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
    const month = parseInt(searchParams.get('month') || '');
    const day = parseInt(searchParams.get('day') || '');
    const years = parseInt(searchParams.get('years') || '20');

    // Validate required params
    if (isNaN(lat) || isNaN(lon) || isNaN(month) || isNaN(day)) {
      return sendError(
        'MISSING_PARAMETERS',
        'Required parameters: lat, lon, month, day',
        400
      );
    }

    console.log(`\n🎯 Daily Probability API:`);
    console.log(`   Location: (${lat}, ${lon})`);
    console.log(`   Date: ${month}/${day}`);
    console.log(`   Years: ${years}`);

    // Check cache
    const cached = await cacheService.get(lat, lon, month, day, years);
    if (cached) {
      const responseTime = Date.now() - startTime;
      console.log(`⚡ Cache HIT - Response: ${responseTime}ms`);
      return sendSuccess(cached, responseTime, true, cacheService.getStats());
    }

    console.log(`🌍 Cache MISS - Fetching from service...`);

    // Fetch from service
    const result = await precipitationService.getPrecipitationProbability({
      latitude: lat,
      longitude: lon,
      month,
      day,
      years,
    });

    // Cache result
    await cacheService.set(lat, lon, month, day, years, result, { ttl: 86400 });

    const responseTime = Date.now() - startTime;
    console.log(`✅ Success - Response: ${responseTime}ms`);

    return sendSuccess(result, responseTime, false, cacheService.getStats());
  } catch (error) {
    if (error instanceof ValidationError) {
      return sendError('VALIDATION_ERROR', error.message, 400, error.field);
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    return sendError('SERVICE_ERROR', message, 503);
  }
}

export const revalidate = 3600; // Cache at CDN level for 1 hour