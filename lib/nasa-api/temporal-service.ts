/**
 * NASA POWER Temporal API Service
 *
 * Fetches actual historical weather measurements from NASA POWER API
 * for specific date ranges. This provides recorded temperature data
 * rather than probability patterns/averages.
 *
 * API Documentation: https://power.larc.nasa.gov/docs/
 */

interface TemporalDataPoint {
  date: string; // YYYYMMDD format
  temp: number; // T2M - Temperature at 2 Meters (°C)
  temp_min?: number; // T2M_MIN
  temp_max?: number; // T2M_MAX
  precipitation?: number; // PRECTOTCORR (mm/day)
  pressure?: number; // PS - Surface Pressure (kPa)
  humidity?: number; // RH2M - Relative Humidity (%)
  wind_speed?: number; // WS2M - Wind Speed at 2 Meters (m/s)
}

interface NASAPowerResponse {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    parameter: {
      T2M?: Record<string, number>;
      T2M_MIN?: Record<string, number>;
      T2M_MAX?: Record<string, number>;
      PRECTOTCORR?: Record<string, number>;
      PS?: Record<string, number>;
      RH2M?: Record<string, number>;
      WS2M?: Record<string, number>;
    };
  };
}

/**
 * Format date as YYYYMMDD for NASA POWER API
 */
function formatDateForNASA(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Calculate start and end dates for a given number of days back
 */
export function calculateDateRange(daysBack: number): {
  startDate: string;
  endDate: string;
} {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - daysBack);

  return {
    startDate: formatDateForNASA(startDate),
    endDate: formatDateForNASA(endDate),
  };
}

/**
 * Fetch daily historical data from NASA POWER Temporal API
 */
export async function fetchDailyTemporalData(
  lat: number,
  lon: number,
  startDate: string,
  endDate: string
): Promise<TemporalDataPoint[]> {
  const params = new URLSearchParams({
    parameters: 'T2M,T2M_MIN,T2M_MAX,PRECTOTCORR,PS,RH2M,WS2M',
    community: 'RE', // Renewable Energy community
    longitude: lon.toString(),
    latitude: lat.toString(),
    start: startDate,
    end: endDate,
    format: 'JSON',
  });

  const url = `https://power.larc.nasa.gov/api/temporal/daily/point?${params}`;

  console.log('[NASA Temporal] 🛰️ Fetching daily data:', {
    lat,
    lon,
    startDate,
    endDate,
    url,
  });

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(
        `NASA POWER API error: ${response.status} ${response.statusText}`
      );
    }

    const data: NASAPowerResponse = await response.json();

    // DETAILED LOGGING: Check what parameters NASA actually returns
    const params = data.properties?.parameter || {};
    const firstDate = params.T2M ? Object.keys(params.T2M)[0] : null;

    console.log('[NASA Temporal] 📦 Raw response structure:', {
      hasT2M: !!params.T2M,
      hasPS: !!params.PS,
      hasRH2M: !!params.RH2M,
      hasWS2M: !!params.WS2M,
      totalDates: params.T2M ? Object.keys(params.T2M).length : 0,
    });

    if (firstDate) {
      console.log('[NASA Temporal] 📊 Sample data for', firstDate, ':', {
        T2M: params.T2M?.[firstDate],
        PS: params.PS?.[firstDate],
        RH2M: params.RH2M?.[firstDate],
        WS2M: params.WS2M?.[firstDate],
        T2M_MIN: params.T2M_MIN?.[firstDate],
        T2M_MAX: params.T2M_MAX?.[firstDate],
      });
    }

    return transformTemporalResponse(data);
  } catch (error) {
    console.error('[NASA Temporal] ❌ Failed to fetch:', error);
    throw error;
  }
}

/**
 * Transform NASA POWER response to our data format
 */
export function transformTemporalResponse(
  nasaResponse: NASAPowerResponse
): TemporalDataPoint[] {
  const { parameter } = nasaResponse.properties;

  if (!parameter.T2M) {
    console.warn('[NASA Temporal] ⚠️ No T2M data in response');
    return [];
  }

  const dates = Object.keys(parameter.T2M);
  const dataPoints: TemporalDataPoint[] = [];

  for (const dateStr of dates) {
    const temp = parameter.T2M[dateStr];

    // Skip sentinel values (-999 indicates missing data)
    if (temp === -999 || temp < -100) {
      console.warn(
        `[NASA Temporal] ⚠️ Skipping sentinel value for ${dateStr}: ${temp}`
      );
      continue;
    }

    dataPoints.push({
      date: dateStr,
      temp,
      temp_min:
        parameter.T2M_MIN?.[dateStr] !== -999
          ? parameter.T2M_MIN?.[dateStr]
          : undefined,
      temp_max:
        parameter.T2M_MAX?.[dateStr] !== -999
          ? parameter.T2M_MAX?.[dateStr]
          : undefined,
      precipitation:
        parameter.PRECTOTCORR?.[dateStr] !== -999
          ? parameter.PRECTOTCORR?.[dateStr]
          : undefined,
      pressure:
        parameter.PS?.[dateStr] !== -999 ? parameter.PS?.[dateStr] : undefined,
      humidity:
        parameter.RH2M?.[dateStr] !== -999
          ? parameter.RH2M?.[dateStr]
          : undefined,
      wind_speed:
        parameter.WS2M?.[dateStr] !== -999
          ? parameter.WS2M?.[dateStr]
          : undefined,
    });
  }

  console.log('[NASA Temporal] ✅ Transformed data points:', dataPoints.length);
  return dataPoints;
}

/**
 * Convert YYYYMMDD string to Date object
 */
export function parseNASADate(dateStr: string): Date {
  const year = parseInt(dateStr.substring(0, 4));
  const month = parseInt(dateStr.substring(4, 6)) - 1;
  const day = parseInt(dateStr.substring(6, 8));
  return new Date(year, month, day);
}