/**
 * Uses NASA POWER API for INSTANT precipitation data
 * - NO authentication needed (public API!)
 * - Works for ANY location globally
 * - Returns 20+ years of data in ~3 seconds
 * - Direct JSON response (no NetCDF parsing)
 *
 * API: https://power.larc.nasa.gov/
 * Data Source: NASA MERRA-2 (same as before, but via POWER API)
 * Output: Real precipitation values in mm/day
 */

import axios, { AxiosError } from 'axios';

export interface PrecipitationData {
  date: string; // YYYY-MM-DD
  latitude: number;
  longitude: number;
  precipitation_mm: number;
  source: 'nasa-power-merra2';
  quality: 'high' | 'medium' | 'low';
}

export interface HistoricalData {
  dates: string[];
  precipitation: number[];
  rainy_days: number;
  dry_days: number;
  probability: number;
  total_precipitation: number;
  avg_precipitation: number;
}

export class NASADataFetcher {
  private baseURL = 'https://power.larc.nasa.gov/api/temporal/daily/point';

  constructor() {
    // No authentication needed - NASA POWER is public API!
  }

  /**
   * 🚀 Fetch MULTIPLE YEARS of precipitation data (FAST!)
   * Returns historical data for probability calculations
   */
  async fetchHistoricalPrecipitation(
    latitude: number,
    longitude: number,
    startYear: number = 2005,
    endYear: number = 2024
  ): Promise<HistoricalData> {
    const startDate = `${startYear}0101`;
    const endDate = `${endYear}1231`;

    console.log(
      `\n🌍 Fetching ${endYear - startYear + 1} years of NASA data...`
    );
    console.log(`📍 Location: (${latitude}, ${longitude})`);
    console.log(`📅 Period: ${startDate} to ${endDate}`);

    try {
      const url = this.buildPOWERURL(latitude, longitude, startDate, endDate);
      console.log(`⏳ Calling NASA POWER API...`);

      const startTime = Date.now();
      const response = await axios.get(url, { timeout: 30000 });
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);

      console.log(`✅ Data received in ${duration} seconds!`);

      // Parse response
      const data = response.data.properties.parameter.PRECTOTCORR;
      const dates = Object.keys(data);
      const precipitation = Object.values(data) as number[];

      // Calculate statistics
      const rainyDays = precipitation.filter((p) => p > 0.1).length;
      const dryDays = precipitation.length - rainyDays;
      const probability = (rainyDays / precipitation.length) * 100;
      const totalPrecipitation = precipitation.reduce((sum, p) => sum + p, 0);
      const avgPrecipitation = totalPrecipitation / precipitation.length;

      console.log(`📊 Statistics:`);
      console.log(`   Total days: ${precipitation.length}`);
      console.log(`   Rainy days: ${rainyDays}`);
      console.log(`   Rain probability: ${probability.toFixed(1)}%`);

      return {
        dates: dates.map((d) => this.formatDate(d)),
        precipitation,
        rainy_days: rainyDays,
        dry_days: dryDays,
        probability: Math.round(probability * 10) / 10,
        total_precipitation: Math.round(totalPrecipitation * 100) / 100,
        avg_precipitation: Math.round(avgPrecipitation * 100) / 100,
      };
    } catch (error) {
      this.handleError(error as AxiosError, {
        latitude,
        longitude,
        startYear,
        endYear,
      });
      throw error;
    }
  }

  /**
   * Fetch precipitation for a SPECIFIC DATE across multiple years
   * Perfect for "Will it rain on July 15th?" queries
   */
  async fetchDateProbability(
    latitude: number,
    longitude: number,
    month: number,
    day: number,
    years: number = 20
  ): Promise<{
    probability: number;
    historical_days: Array<{ year: number; precipitation_mm: number }>;
    avg_precipitation: number;
  }> {
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - years;

    console.log(
      `\n🎯 Fetching probability for ${month}/${day} (past ${years} years)`
    );

    // Fetch all historical data
    const historicalData = await this.fetchHistoricalPrecipitation(
      latitude,
      longitude,
      startYear,
      currentYear
    );

    // Filter for matching month/day
    const matchingDays: Array<{ year: number; precipitation_mm: number }> = [];

    historicalData.dates.forEach((date, index) => {
      const [year, m, d] = date.split('-').map(Number);
      if (m === month && d === day) {
        matchingDays.push({
          year,
          precipitation_mm: historicalData.precipitation[index],
        });
      }
    });

    const rainyCount = matchingDays.filter(
      (d) => d.precipitation_mm > 0.1
    ).length;
    const probability = (rainyCount / matchingDays.length) * 100;
    const avgPrecipitation =
      matchingDays.reduce((sum, d) => sum + d.precipitation_mm, 0) /
      matchingDays.length;

    console.log(`📊 Results for ${month}/${day}:`);
    console.log(`   Sample size: ${matchingDays.length} years`);
    console.log(`   Rain probability: ${probability.toFixed(1)}%`);

    return {
      probability: Math.round(probability * 10) / 10,
      historical_days: matchingDays,
      avg_precipitation: Math.round(avgPrecipitation * 100) / 100,
    };
  }

  /**
   * Build NASA POWER API URL
   * Simple REST API - no authentication needed!
   */
  private buildPOWERURL(
    latitude: number,
    longitude: number,
    startDate: string,
    endDate: string
  ): string {
    const params = new URLSearchParams({
      parameters: 'PRECTOTCORR', // Precipitation Corrected (mm/day)
      community: 'AG', // Agroclimatology community
      longitude: longitude.toString(),
      latitude: latitude.toString(),
      start: startDate, // YYYYMMDD
      end: endDate, // YYYYMMDD
      format: 'JSON',
    });

    return `${this.baseURL}?${params.toString()}`;
  }

  /**
   * Format date from YYYYMMDD to YYYY-MM-DD
   */
  private formatDate(dateStr: string): string {
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  /**
   * Handle errors with helpful messages
   */
  private handleError(error: AxiosError, context: any) {
    console.error('\n❌ NASA POWER API ERROR');
    console.error(`📍 Context:`, context);

    if (error.response) {
      console.error(
        `🔴 HTTP ${error.response.status}: ${error.response.statusText}`
      );
    } else if (error.code === 'ETIMEDOUT') {
      console.error(`⏱️  Timeout: Request took too long`);
    } else {
      console.error(`💥 Error: ${error.message}`);
    }

    console.error('\n💡 Troubleshooting:');
    console.error('   1. Check latitude/longitude are valid');
    console.error('   2. Verify dates are within range (1981-present)');
    console.error('   3. Try again in a moment');
    console.error('   4. Check https://power.larc.nasa.gov/ status');
  }
}