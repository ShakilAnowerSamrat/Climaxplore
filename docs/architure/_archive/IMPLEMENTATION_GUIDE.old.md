# 🛠️ NASA Data Integration - Step-by-Step Implementation Guide

**Last Updated:** October 12, 2025
**Target:** Global NASA Space Apps Championship
**Estimated Time:** 2-3 weeks

---

## 🎬 Quick Start: Get NASA Data in 30 Minutes

This guide gets you from zero to your first NASA data fetch. Follow exactly.

---

## 📋 Prerequisites Checklist

### 1. NASA Earthdata Account (REQUIRED)

**Time: 5 minutes**

```bash
# Step 1: Register
# Go to: https://urs.earthdata.nasa.gov/users/new
# Fill out the form (use your real email)

# Step 2: Approve applications
# After registration, go to: https://urs.earthdata.nasa.gov/profile
# Click "Applications > Authorized Apps"
# Approve: "NASA GESDISC DATA ARCHIVE"

# Step 3: Create .netrc file (for authentication)
# This file stores your NASA credentials for automated access
```

Create `.netrc` file in your home directory:

```bash
cd ~
touch .netrc
chmod 600 .netrc  # Security: Only you can read this file
```

Add to `.netrc`:

```
machine urs.earthdata.nasa.gov
login YOUR_EARTHDATA_USERNAME
password YOUR_EARTHDATA_PASSWORD
```

**Test it:**

```bash
# Try downloading a small NASA file
curl -n -L "https://goldsmr4.gesdisc.eosdis.nasa.gov/data/MERRA2/M2T1NXSLV.5.12.4/2020/01/MERRA2_400.tavg1_2d_slv_Nx.20200101.nc4" -o test.nc4

# If you see a file downloading, you're authenticated! ✅
```

---

### 2. Install Required Packages

```bash
cd /home/tanzim/Desktop/LearnNext/space_x/weather-app

# Install NASA data processing libraries
pnpm add netcdfjs simple-statistics date-fns

# Install development tools
pnpm add -D @types/node
```

---

## 🏗️ Phase 1: Build NASA Service Layer (Day 1-3)

### Step 1.1: Create Directory Structure

```bash
mkdir -p lib/nasa-api
mkdir -p lib/statistical-analysis
mkdir -p app/api/nasa
```

### Step 1.2: NASA MERRA-2 Service (Core Logic)

Create `lib/nasa-api/merra2-service.ts`:

```typescript
import { NetCDFReader } from 'netcdfjs';

export interface HistoricalDataPoint {
  year: number;
  month: number;
  day: number;
  value: number;
  variable: string;
}

export interface NASAQueryParams {
  lat: number;
  lon: number;
  startYear: number;
  endYear: number;
  variable: 'precipitation' | 'temperature' | 'wind_speed' | 'humidity';
  monthDay: string; // Format: "MM-DD" e.g., "07-15"
}

export class MERRA2Service {
  private baseUrl =
    'https://goldsmr4.gesdisc.eosdis.nasa.gov/opendap/MERRA2/M2T1NXSLV.5.12.4';

  /**
   * Fetch historical data for a specific date across multiple years
   * Example: Get July 15th precipitation data from 2005-2025
   */
  async fetchHistoricalData(
    params: NASAQueryParams
  ): Promise<HistoricalDataPoint[]> {
    const results: HistoricalDataPoint[] = [];

    // Parse month and day from monthDay string
    const [month, day] = params.monthDay.split('-').map(Number);

    // Fetch data for each year in the range
    for (let year = params.startYear; year <= params.endYear; year++) {
      try {
        const dataPoint = await this.fetchSingleDay(
          params.lat,
          params.lon,
          year,
          month,
          day,
          params.variable
        );

        results.push(dataPoint);
      } catch (error) {
        console.error(
          `Failed to fetch data for ${year}-${month}-${day}:`,
          error
        );
        // Continue with other years even if one fails
      }
    }

    return results;
  }

  /**
   * Fetch data for a single day
   */
  private async fetchSingleDay(
    lat: number,
    lon: number,
    year: number,
    month: number,
    day: number,
    variable: string
  ): Promise<HistoricalDataPoint> {
    // Step 1: Build OPeNDAP URL with spatial and temporal subsetting
    const url = this.buildOPeNDAPUrl(lat, lon, year, month, day, variable);

    // Step 2: Fetch NetCDF data (authentication via .netrc)
    const response = await fetch(url, {
      headers: {
        Accept: 'application/x-netcdf',
      },
    });

    if (!response.ok) {
      throw new Error(
        `NASA API error: ${response.status} ${response.statusText}`
      );
    }

    // Step 3: Parse NetCDF data
    const arrayBuffer = await response.arrayBuffer();
    const reader = new NetCDFReader(arrayBuffer);

    // Step 4: Extract the variable value
    const value = this.extractValue(reader, variable);

    return {
      year,
      month,
      day,
      value,
      variable,
    };
  }

  /**
   * Build OPeNDAP URL with subsetting parameters
   * OPeNDAP allows us to request only the data we need (specific lat/lon/time)
   */
  private buildOPeNDAPUrl(
    lat: number,
    lon: number,
    year: number,
    month: number,
    day: number,
    variable: string
  ): string {
    // MERRA-2 uses 0.5° x 0.625° grid
    // We need to find the nearest grid point
    const gridLat = Math.round(lat * 2) / 2; // Round to nearest 0.5°
    const gridLon = Math.round(lon * 1.6) / 1.6; // Round to nearest 0.625°

    // Calculate grid indices
    // MERRA-2 latitude: -90 to 90 (361 points, 0.5° spacing)
    // MERRA-2 longitude: -180 to 180 (576 points, 0.625° spacing)
    const latIndex = Math.round((gridLat + 90) / 0.5);
    const lonIndex = Math.round((gridLon + 180) / 0.625);

    // Format date (MERRA-2 uses YYYYMMDD)
    const dateStr = `${year}${String(month).padStart(2, '0')}${String(
      day
    ).padStart(2, '0')}`;

    // Map variable names to MERRA-2 variable codes
    const variableMap = {
      precipitation: 'PRECTOT', // Total precipitation
      temperature: 'T2M', // 2-meter air temperature
      wind_speed: 'SPEED', // Wind speed
      humidity: 'QV2M', // 2-meter specific humidity
    };

    const merra2Var = variableMap[variable as keyof typeof variableMap];

    // Build OPeNDAP subset URL
    // Format: baseUrl/YEAR/MONTH/FILENAME.nc4?VARIABLE[time_index][lat_index][lon_index]
    const filename = `MERRA2_400.tavg1_2d_slv_Nx.${dateStr}.nc4`;
    const url = `${this.baseUrl}/${year}/${String(month).padStart(
      2,
      '0'
    )}/${filename}`;

    // Add OPeNDAP subsetting query
    // We're requesting one time point (index 0-23 for hourly), specific lat/lon
    const subsetQuery = `?${merra2Var}[0:23][${latIndex}][${lonIndex}]`;

    return url + subsetQuery;
  }

  /**
   * Extract value from NetCDF reader
   */
  private extractValue(reader: NetCDFReader, variable: string): number {
    const variableMap = {
      precipitation: 'PRECTOT',
      temperature: 'T2M',
      wind_speed: 'SPEED',
      humidity: 'QV2M',
    };

    const merra2Var = variableMap[variable as keyof typeof variableMap];
    const data = reader.getDataVariable(merra2Var);

    // Data is 3D array: [time, lat, lon]
    // We requested single lat/lon point, so extract all time values
    const values = Array.from(data.values() as any);

    // Calculate daily average (MERRA-2 is hourly data)
    const dailyAverage =
      values.reduce((sum, val) => sum + val, 0) / values.length;

    // Convert units if needed
    if (variable === 'precipitation') {
      // MERRA-2 precipitation is in kg/m²/s
      // Convert to mm/day: multiply by 86400 (seconds in a day)
      return dailyAverage * 86400;
    }

    if (variable === 'temperature') {
      // Convert Kelvin to Celsius
      return dailyAverage - 273.15;
    }

    return dailyAverage;
  }

  /**
   * Simple test function to verify NASA connection
   */
  async testConnection(): Promise<boolean> {
    try {
      // Try to fetch a single day of data
      const testData = await this.fetchSingleDay(
        47.6, // Seattle latitude
        -122.3, // Seattle longitude
        2020,
        7,
        15,
        'precipitation'
      );

      console.log('NASA connection test successful:', testData);
      return true;
    } catch (error) {
      console.error('NASA connection test failed:', error);
      return false;
    }
  }
}
```

---

### Step 1.3: Test NASA Service Locally

Create `scripts/test-nasa.ts`:

```typescript
import { MERRA2Service } from '../lib/nasa-api/merra2-service';

async function testNASA() {
  console.log('🚀 Testing NASA MERRA-2 Service...\n');

  const service = new MERRA2Service();

  // Test 1: Connection test
  console.log('Test 1: Connection test');
  const connected = await service.testConnection();
  console.log(`Result: ${connected ? '✅ Connected' : '❌ Failed'}\n`);

  if (!connected) {
    console.error('Fix authentication before proceeding!');
    return;
  }

  // Test 2: Fetch historical data
  console.log('Test 2: Fetch 5 years of July 15th data for Seattle');
  const historicalData = await service.fetchHistoricalData({
    lat: 47.6062,
    lon: -122.3321,
    startYear: 2019,
    endYear: 2023,
    variable: 'precipitation',
    monthDay: '07-15',
  });

  console.log('Result:');
  console.table(historicalData);

  console.log('\n✅ All tests passed!');
}

testNASA().catch(console.error);
```

Run the test:

```bash
# Add to package.json scripts:
# "test:nasa": "tsx scripts/test-nasa.ts"

pnpm add -D tsx  # TypeScript executor
pnpm test:nasa
```

**Expected Output:**

```
🚀 Testing NASA MERRA-2 Service...

Test 1: Connection test
Result: ✅ Connected

Test 2: Fetch 5 years of July 15th data for Seattle
┌─────────┬──────┬───────┬─────┬────────┬───────────────┐
│ (index) │ year │ month │ day │  value │   variable    │
├─────────┼──────┼───────┼─────┼────────┼───────────────┤
│    0    │ 2019 │   7   │ 15  │  0.3   │ precipitation │
│    1    │ 2020 │   7   │ 15  │  1.2   │ precipitation │
│    2    │ 2021 │   7   │ 15  │  0.0   │ precipitation │
│    3    │ 2022 │   7   │ 15  │  2.1   │ precipitation │
│    4    │ 2023 │   7   │ 15  │  0.8   │ precipitation │
└─────────┴──────┴───────┴─────┴────────┴───────────────┘

✅ All tests passed!
```

---

## 🧮 Phase 2: Statistical Analysis Engine (Day 4-5)

### Step 2.1: Probability Calculator

Create `lib/statistical-analysis/probability-calculator.ts`:

```typescript
import { mean, standardDeviation, linearRegression } from 'simple-statistics';
import { HistoricalDataPoint } from '../nasa-api/merra2-service';

export interface ThresholdCondition {
  variable: string;
  operator: '>' | '<' | '>=' | '<=' | '==';
  value: number;
}

export interface ProbabilityResult {
  // Core probability
  likelihood: number; // 0.68 = 68%
  confidenceInterval: number; // ±0.05 = ±5%

  // Statistical summary
  historicalMean: number;
  historicalMedian: number;
  historicalStdDev: number;
  minValue: number;
  maxValue: number;

  // Trend analysis
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  trendMagnitude: number; // % change over period
  trendSlope: number;

  // Metadata
  yearsAnalyzed: number;
  dataPoints: HistoricalDataPoint[];
  threshold: ThresholdCondition;
}

export class ProbabilityCalculator {
  /**
   * Calculate probability of threshold being exceeded
   */
  calculate(
    historicalData: HistoricalDataPoint[],
    threshold: ThresholdCondition
  ): ProbabilityResult {
    if (historicalData.length === 0) {
      throw new Error('No historical data provided');
    }

    // Step 1: Extract values and filter invalid data
    const values = historicalData
      .map((d) => d.value)
      .filter((v) => !isNaN(v) && isFinite(v));

    if (values.length === 0) {
      throw new Error('No valid data points');
    }

    // Step 2: Count how many times threshold was exceeded
    const exceedances = historicalData.filter((d) =>
      this.meetsThreshold(d.value, threshold)
    );

    const probability = exceedances.length / historicalData.length;

    // Step 3: Calculate confidence interval
    // Using binomial proportion confidence interval (Wilson score)
    const confidenceInterval = this.calculateConfidenceInterval(
      probability,
      historicalData.length
    );

    // Step 4: Statistical summary
    const sortedValues = [...values].sort((a, b) => a - b);
    const medianIndex = Math.floor(sortedValues.length / 2);

    const stats = {
      historicalMean: mean(values),
      historicalMedian: sortedValues[medianIndex],
      historicalStdDev: standardDeviation(values),
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };

    // Step 5: Trend analysis
    const trend = this.analyzeTrend(historicalData);

    return {
      likelihood: probability,
      confidenceInterval,
      ...stats,
      ...trend,
      yearsAnalyzed: historicalData.length,
      dataPoints: historicalData,
      threshold,
    };
  }

  /**
   * Check if value meets threshold condition
   */
  private meetsThreshold(
    value: number,
    threshold: ThresholdCondition
  ): boolean {
    switch (threshold.operator) {
      case '>':
        return value > threshold.value;
      case '<':
        return value < threshold.value;
      case '>=':
        return value >= threshold.value;
      case '<=':
        return value <= threshold.value;
      case '==':
        return Math.abs(value - threshold.value) < 0.01;
      default:
        return false;
    }
  }

  /**
   * Calculate 95% confidence interval
   * Uses Wilson score interval for binomial proportions
   */
  private calculateConfidenceInterval(p: number, n: number): number {
    const z = 1.96; // 95% confidence
    const denominator = 1 + (z * z) / n;
    const centre = p + (z * z) / (2 * n);
    const spread = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));

    const lower = (centre - spread) / denominator;
    const upper = (centre + spread) / denominator;

    return (upper - lower) / 2; // Return ± value
  }

  /**
   * Analyze trend using linear regression
   */
  private analyzeTrend(data: HistoricalDataPoint[]): {
    trendDirection: 'increasing' | 'decreasing' | 'stable';
    trendMagnitude: number;
    trendSlope: number;
  } {
    // Prepare data for linear regression
    const points = data.map((d, index) => [index, d.value]);

    // Calculate linear regression
    const regression = linearRegression(points);
    const slope = regression.m;

    // Calculate % change over the entire period
    const firstValue = data[0].value;
    const totalChange = slope * (data.length - 1);
    const percentChange =
      firstValue !== 0 ? Math.abs((totalChange / firstValue) * 100) : 0;

    // Determine direction (using threshold of 5% change)
    let direction: 'increasing' | 'decreasing' | 'stable';
    if (percentChange < 5) {
      direction = 'stable';
    } else if (slope > 0) {
      direction = 'increasing';
    } else {
      direction = 'decreasing';
    }

    return {
      trendDirection: direction,
      trendMagnitude: percentChange,
      trendSlope: slope,
    };
  }

  /**
   * Generate human-readable summary
   */
  generateSummary(result: ProbabilityResult): string {
    const percentage = (result.likelihood * 100).toFixed(0);
    const ci = (result.confidenceInterval * 100).toFixed(1);

    let summary = `Based on ${result.yearsAnalyzed} years of NASA satellite data, `;
    summary += `there is a ${percentage}% (±${ci}%) probability that `;
    summary += `${result.threshold.variable} will be ${result.threshold.operator} `;
    summary += `${result.threshold.value}.`;

    if (result.trendDirection !== 'stable') {
      summary += ` This condition has been ${result.trendDirection} by `;
      summary += `${result.trendMagnitude.toFixed(
        1
      )}% over the analyzed period.`;
    }

    return summary;
  }
}
```

---

### Step 2.2: Test Probability Calculator

Create `scripts/test-probability.ts`:

```typescript
import { MERRA2Service } from '../lib/nasa-api/merra2-service';
import { ProbabilityCalculator } from '../lib/statistical-analysis/probability-calculator';

async function testProbability() {
  console.log('🧮 Testing Probability Calculator...\n');

  // Step 1: Fetch historical data
  const service = new MERRA2Service();
  const data = await service.fetchHistoricalData({
    lat: 47.6062,
    lon: -122.3321,
    startYear: 2005,
    endYear: 2024,
    variable: 'precipitation',
    monthDay: '07-15',
  });

  console.log(`Fetched ${data.length} years of data\n`);

  // Step 2: Calculate probability
  const calculator = new ProbabilityCalculator();
  const result = calculator.calculate(data, {
    variable: 'precipitation',
    operator: '>',
    value: 0.5, // >0.5mm precipitation
  });

  console.log('📊 Results:');
  console.log(`Probability: ${(result.likelihood * 100).toFixed(1)}%`);
  console.log(
    `Confidence Interval: ±${(result.confidenceInterval * 100).toFixed(1)}%`
  );
  console.log(`Mean: ${result.historicalMean.toFixed(2)}mm`);
  console.log(`Std Dev: ${result.historicalStdDev.toFixed(2)}mm`);
  console.log(
    `Trend: ${result.trendDirection} by ${result.trendMagnitude.toFixed(1)}%`
  );
  console.log(`\n📝 Summary:`);
  console.log(calculator.generateSummary(result));
}

testProbability().catch(console.error);
```

```bash
pnpm add -D @types/simple-statistics
pnpm test:probability
```

---

## 🚀 Phase 3: API Routes (Day 6-7)

### Step 3.1: Create NASA API Route

Create `app/api/nasa/historical/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { MERRA2Service } from '@/lib/nasa-api/merra2-service';
import { ProbabilityCalculator } from '@/lib/statistical-analysis/probability-calculator';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const { lat, lon, targetDate, variable, threshold, yearsBack = 15 } = body;

    if (!lat || !lon || !targetDate || !variable) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Parse target date to get month-day
    const date = new Date(targetDate);
    const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}`;

    // Fetch historical data
    const service = new MERRA2Service();
    const currentYear = new Date().getFullYear();

    const historicalData = await service.fetchHistoricalData({
      lat,
      lon,
      startYear: currentYear - yearsBack,
      endYear: currentYear - 1, // Don't include current incomplete year
      variable,
      monthDay,
    });

    // Calculate probability
    const calculator = new ProbabilityCalculator();
    const result = calculator.calculate(historicalData, threshold);

    // Generate summary
    const summary = calculator.generateSummary(result);

    return NextResponse.json({
      success: true,
      data: result,
      summary,
    });
  } catch (error) {
    console.error('NASA API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch NASA data', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  return NextResponse.json({
    message: 'NASA Historical Data API',
    endpoints: {
      POST: {
        description: 'Fetch historical probability',
        parameters: {
          lat: 'number (latitude)',
          lon: 'number (longitude)',
          targetDate: 'ISO date string',
          variable: 'precipitation | temperature | wind_speed | humidity',
          threshold: { operator: '> | < | >= | <=', value: 'number' },
          yearsBack: 'number (default: 15)',
        },
      },
    },
  });
}
```

---

## 🧪 Testing Your Implementation

### Manual Test via Thunder Client / Postman

```bash
POST http://localhost:3000/api/nasa/historical
Content-Type: application/json

{
  "lat": 47.6062,
  "lon": -122.3321,
  "targetDate": "2025-07-15",
  "variable": "precipitation",
  "threshold": {
    "operator": ">",
    "value": 0.5
  },
  "yearsBack": 20
}
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "likelihood": 0.65,
    "confidenceInterval": 0.08,
    "historicalMean": 1.2,
    "historicalMedian": 0.8,
    "historicalStdDev": 1.5,
    "minValue": 0.0,
    "maxValue": 5.3,
    "trendDirection": "increasing",
    "trendMagnitude": 12.5,
    "trendSlope": 0.03,
    "yearsAnalyzed": 20,
    "dataPoints": [...],
    "threshold": {
      "variable": "precipitation",
      "operator": ">",
      "value": 0.5
    }
  },
  "summary": "Based on 20 years of NASA satellite data, there is a 65% (±8.0%) probability that precipitation will be > 0.5. This condition has been increasing by 12.5% over the analyzed period."
}
```

---

## ⚡ Next Steps

1. **Add Caching** (see NASA_DATA_ARCHITECTURE.md Phase 3)
2. **Create UI Components** (HistoricalProbabilityCard)
3. **Integrate with existing weather tabs**
4. **Add export to CSV/JSON**
5. **Performance testing**

---

## 🆘 Troubleshooting

### Issue: "401 Unauthorized" from NASA

**Solution:** Check your .netrc file permissions and credentials

### Issue: "NetCDF parsing error"

**Solution:** Verify the OPeNDAP URL is correct, try accessing in browser first

### Issue: "Timeout after 30 seconds"

**Solution:** Reduce yearsBack parameter, implement caching

### Issue: "No data returned"

**Solution:** Check if lat/lon are within MERRA-2 coverage (-90 to 90, -180 to 180)

---

**Ready to implement?** Start with Phase 1, test each step, then move to Phase 2! 🚀