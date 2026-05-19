/**
 * 🛰️ NASA Historical Weather Service
 *
 * Integrates NASA POWER API historical patterns with OpenWeather actual data
 *
 * Purpose:
 * - Fetch NASA probability patterns for specific dates (from dashboard API)
 * - Combine with OpenWeather actual historical data
 * - Provide unified view: "40% historical rain chance (NASA) vs Actually rained (OpenWeather)"
 *
 * Data Flow:
 * 1. User selects date range (7/14/30 days)
 * 2. Fetch NASA dashboard data for each date (probability patterns)
 * 3. Fetch OpenWeather actual historical data
 * 4. Merge and compare: probability vs reality
 */

export interface NASAHistoricalPattern {
  date: Date;
  dateStr: string;
  probability: {
    rain: number;
    hotDay: number; // 30°C+
    heatWave: number; // 32°C+
    coldSnap: number; // <5°C
    heavyRain: number; // >20mm
  };
  temperature: {
    avg: number;
    min: number;
    max: number;
  };
  confidence: string;
  yearsAnalyzed: number;
}

export interface CombinedHistoricalData {
  date: Date;
  dateStr: string;
  // NASA probability patterns (what usually happens on this date)
  nasa: {
    rainProbability: number;
    avgTemp: number;
    minTemp: number;
    maxTemp: number;
    extremeEvents: {
      hotDay: number;
      heatWave: number;
      coldSnap: number;
      heavyRain: number;
    };
    confidence: string;
    yearsAnalyzed: number;
  };
  // OpenWeather actual data (what actually happened on this date)
  openWeather: {
    temp: number;
    pressure: number;
    humidity: number;
    windSpeed: number;
    weather: any[];
    actuallyRained: boolean;
  };
  // Comparison insights
  comparison: {
    tempDifference: number; // actual vs NASA avg
    rainedAsExpected: boolean | null; // true if NASA predicted rain and it rained
    accuracyNote: string;
  };
}

/**
 * Fetch NASA historical probability patterns for a date range
 */
export async function fetchNASAHistoricalPatterns(
  lat: number,
  lon: number,
  startDate: Date,
  days: number = 7,
  years: number = 10
): Promise<NASAHistoricalPattern[]> {
  const patterns: NASAHistoricalPattern[] = [];

  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() - i); // Go backwards

    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();

    try {
      // Call our dashboard API to get NASA historical patterns
      const response = await fetch(
        `/api/weather/dashboard?lat=${lat}&lon=${lon}&month=${month}&day=${day}&years=${years}`
      );

      if (!response.ok) {
        console.warn(
          `[NASA Historical] Failed to fetch pattern for ${
            currentDate.toISOString().split('T')[0]
          }`
        );
        continue;
      }

      const data = await response.json();

      patterns.push({
        date: currentDate,
        dateStr: currentDate.toISOString().split('T')[0],
        probability: {
          rain: data.precipitation.probability,
          hotDay: data.extreme_events.hot_days.probability,
          heatWave: data.extreme_events.heat_waves.probability,
          coldSnap: data.extreme_events.cold_snaps.probability,
          heavyRain: data.extreme_events.heavy_rain.probability,
        },
        temperature: {
          avg: data.temperature.avg_celsius,
          min: data.temperature.min_celsius,
          max: data.temperature.max_celsius,
        },
        confidence: data.period.confidence_level,
        yearsAnalyzed: data.period.years_analyzed,
      });
    } catch (error) {
      console.error(
        `[NASA Historical] Error fetching pattern for ${
          currentDate.toISOString().split('T')[0]
        }:`,
        error
      );
    }
  }

  return patterns;
}

/**
 * Combine NASA patterns with OpenWeather actual data
 */
export function combineHistoricalData(
  nasaPatterns: NASAHistoricalPattern[],
  openWeatherData: any[]
): CombinedHistoricalData[] {
  const combined: CombinedHistoricalData[] = [];

  // Match NASA patterns with OpenWeather data by date
  for (const pattern of nasaPatterns) {
    // Find corresponding OpenWeather data
    const owData = openWeatherData.find((item) => {
      const itemDate = new Date(item.dt * 1000);
      return (
        itemDate.getMonth() === pattern.date.getMonth() &&
        itemDate.getDate() === pattern.date.getDate()
      );
    });

    if (!owData) {
      console.warn(
        `[Historical Combine] No OpenWeather data for ${pattern.dateStr}`
      );
      continue;
    }

    // Check if it actually rained (precipitation in weather description)
    const actuallyRained =
      owData.weather?.[0]?.main?.toLowerCase().includes('rain') ||
      owData.weather?.[0]?.description?.toLowerCase().includes('rain') ||
      false;

    // Calculate temperature difference
    const tempDifference = owData.temp - pattern.temperature.avg;

    // Determine if rain prediction was accurate
    let rainedAsExpected: boolean | null = null;
    if (pattern.probability.rain >= 50) {
      // NASA predicted rain (>50% probability)
      rainedAsExpected = actuallyRained;
    } else if (pattern.probability.rain <= 30) {
      // NASA predicted no rain (<30% probability)
      rainedAsExpected = !actuallyRained;
    }
    // If 30-50%, it's uncertain so rainedAsExpected stays null

    // Generate accuracy note
    let accuracyNote = '';
    if (rainedAsExpected === true) {
      accuracyNote = '✅ NASA prediction accurate';
    } else if (rainedAsExpected === false) {
      accuracyNote = '⚠️ Unexpected weather occurred';
    } else {
      accuracyNote = '📊 Within uncertainty range';
    }

    combined.push({
      date: pattern.date,
      dateStr: pattern.dateStr,
      nasa: {
        rainProbability: pattern.probability.rain,
        avgTemp: pattern.temperature.avg,
        minTemp: pattern.temperature.min,
        maxTemp: pattern.temperature.max,
        extremeEvents: {
          hotDay: pattern.probability.hotDay,
          heatWave: pattern.probability.heatWave,
          coldSnap: pattern.probability.coldSnap,
          heavyRain: pattern.probability.heavyRain,
        },
        confidence: pattern.confidence,
        yearsAnalyzed: pattern.yearsAnalyzed,
      },
      openWeather: {
        temp: owData.temp,
        pressure: owData.pressure,
        humidity: owData.humidity,
        windSpeed: owData.wind_speed,
        weather: owData.weather,
        actuallyRained,
      },
      comparison: {
        tempDifference,
        rainedAsExpected,
        accuracyNote,
      },
    });
  }

  return combined;
}

/**
 * Calculate accuracy statistics
 */
export function calculateAccuracyStats(
  combinedData: CombinedHistoricalData[]
): {
  totalDays: number;
  accuratePredictions: number;
  inaccuratePredictions: number;
  uncertainPredictions: number;
  accuracyPercentage: number;
  avgTempDifference: number;
} {
  const accurate = combinedData.filter(
    (d) => d.comparison.rainedAsExpected === true
  ).length;
  const inaccurate = combinedData.filter(
    (d) => d.comparison.rainedAsExpected === false
  ).length;
  const uncertain = combinedData.filter(
    (d) => d.comparison.rainedAsExpected === null
  ).length;

  const avgTempDiff =
    combinedData.reduce(
      (sum, d) => sum + Math.abs(d.comparison.tempDifference),
      0
    ) / combinedData.length;

  return {
    totalDays: combinedData.length,
    accuratePredictions: accurate,
    inaccuratePredictions: inaccurate,
    uncertainPredictions: uncertain,
    accuracyPercentage:
      accurate + inaccurate > 0
        ? Math.round((accurate / (accurate + inaccurate)) * 100)
        : 0,
    avgTempDifference: Math.round(avgTempDiff * 10) / 10,
  };
}