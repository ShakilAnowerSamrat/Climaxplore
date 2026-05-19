# ⚡ Quick Reference - NASA POWER API

**Project:** Will It Rain On My Parade?
**Status:** Championship-Ready
**Last Updated:** October 2025

---

## 🚀 Quick Start

### **1. Test NASA POWER API (Verify It Works)**

```bash
# Run test script (already working!)
pnpm exec tsx scripts/test-power-api.ts

# Expected output:
# ✅ Test 1: Seattle July 15 → 38.1% (3.54 seconds)
# ✅ Test 2: NYC 2020-2024 → 58.8% (1.99 seconds)
```

### **2. Use in Your Code**

```typescript
import { NASADataFetcher } from '@/lib/nasa-api/merra2-fetcher';

const fetcher = new NASADataFetcher();

// Get probability for specific date
const result = await fetcher.fetchDateProbability(
  47.6062, // Seattle latitude
  -122.3321, // Seattle longitude
  7, // July
  15, // 15th
  20 // Past 20 years
);

console.log(`Probability: ${result.probability}%`);
// Output: Probability: 38.1%
```

---

## 📋 Common Tasks

### **Get Rain Probability for Event**

```typescript
// User wants to know: Will it rain on their wedding?
// Event: July 15, 2025 in Seattle

const fetcher = new NASADataFetcher();
const data = await fetcher.fetchDateProbability(
  47.6062,  // Latitude
  -122.3321, // Longitude
  7,        // July
  15,       // 15th
  20        // Look back 20 years
);

// Response:
{
  probability: 38.1,           // 38.1% chance of rain
  rainy_days: 8,               // 8 out of 21 years had rain
  dry_days: 13,                // 13 years were dry
  dates: [...],                // All July 15 dates checked
  precipitation: [...],        // Daily precipitation values
  avg_precipitation: 0.35      // Average mm/day on rainy days
}
```

### **Get Full Historical Data**

```typescript
// Get all data for date range
const data = await fetcher.fetchHistoricalPrecipitation(
  40.7128,  // New York latitude
  -74.006,  // New York longitude
  2020,     // Start year
  2024      // End year
);

// Response:
{
  dates: ["2020-01-01", "2020-01-02", ...],  // 1,827 days
  precipitation: [0.5, 0.0, 2.3, ...],       // Daily values
  rainy_days: 1075,
  dry_days: 752,
  probability: 58.8,
  avg_precipitation: 3.87
}
```

---

## 🌍 Location Examples

### **Major Cities:**

```typescript
const cities = {
  seattle: { lat: 47.6062, lon: -122.3321 },
  new_york: { lat: 40.7128, lon: -74.006 },
  london: { lat: 51.5074, lon: -0.1278 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  dhaka: { lat: 23.8103, lon: 90.4125 },
  sydney: { lat: -33.8688, lon: 151.2093 },
};

// Use with fetcher
const { lat, lon } = cities.dhaka;
const result = await fetcher.fetchDateProbability(lat, lon, 7, 15);
```

---

## 📅 Date Helpers

### **Convert Date to Month/Day**

```typescript
// User picks date from calendar
const userDate = new Date('2025-07-15');

const month = userDate.getMonth() + 1; // 7 (JavaScript months are 0-indexed!)
const day = userDate.getDate(); // 15

const result = await fetcher.fetchDateProbability(lat, lon, month, day);
```

### **Generate Date Range**

```typescript
// Get data for past 20 years
const currentYear = new Date().getFullYear();
const startYear = currentYear - 20;

const data = await fetcher.fetchHistoricalPrecipitation(
  lat,
  lon,
  startYear,
  currentYear
);
```

---

## ⚡ Performance Tips

### **1. Cache Results (Optional)**

```typescript
// Use Redis or in-memory cache
const cacheKey = `precip:${lat}:${lon}:${month}:${day}`;

// Check cache first
let data = await cache.get(cacheKey);

if (!data) {
  // Cache miss - fetch from NASA
  data = await fetcher.fetchDateProbability(lat, lon, month, day);

  // Store in cache (24 hours)
  await cache.set(cacheKey, data, { ex: 86400 });
}

return data;
```

**Benefits:**

- First call: 3-5 seconds (NASA API)
- Repeat calls: <1 second (cache)

### **2. Parallel Requests**

```typescript
// Fetch multiple locations at once
const locations = [
  { lat: 47.6, lon: -122.3 }, // Seattle
  { lat: 40.7, lon: -74.0 }, // NYC
  { lat: 51.5, lon: -0.1 }, // London
];

const results = await Promise.all(
  locations.map(({ lat, lon }) => fetcher.fetchDateProbability(lat, lon, 7, 15))
);

// All 3 locations fetched in ~3-5 seconds (parallel!)
```

---

## 🛠️ Error Handling

### **Network Errors**

```typescript
try {
  const data = await fetcher.fetchDateProbability(lat, lon, month, day);
  return { success: true, data };
} catch (error) {
  if (error.response?.status === 503) {
    return { success: false, error: 'NASA API temporarily unavailable' };
  }

  if (error.code === 'ECONNABORTED') {
    return { success: false, error: 'Request timeout - try again' };
  }

  return { success: false, error: 'Unknown error occurred' };
}
```

### **Invalid Coordinates**

```typescript
// Validate coordinates before calling
function isValidCoordinate(lat: number, lon: number): boolean {
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}

if (!isValidCoordinate(lat, lon)) {
  throw new Error('Invalid coordinates');
}
```

---

## 📊 Data Interpretation

### **Probability Thresholds**

```typescript
function interpretProbability(probability: number): string {
  if (probability < 10) return 'Very unlikely to rain';
  if (probability < 30) return 'Low chance of rain';
  if (probability < 50) return 'Moderate chance of rain';
  if (probability < 70) return 'Likely to rain';
  return 'Very likely to rain';
}

const result = await fetcher.fetchDateProbability(lat, lon, 7, 15);
const message = interpretProbability(result.probability);

console.log(message);
// Output: "Moderate chance of rain" (for 38.1%)
```

### **Rainy Day Definition**

```typescript
// NASA POWER API considers >0.1mm as "rainy"
const RAIN_THRESHOLD = 0.1; // mm/day

// Count rainy days manually
const rainyDays = result.precipitation.filter((p) => p > RAIN_THRESHOLD).length;

// Or use the provided value
const rainyDays = result.rainy_days;
```

---

## 🔗 API URLs

### **NASA POWER API**

**Base URL:**

```
https://power.larc.nasa.gov/api/temporal/daily/point
```

**Example Request:**

```
https://power.larc.nasa.gov/api/temporal/daily/point?parameters=PRECTOTCORR&community=RE&longitude=-122.3321&latitude=47.6062&start=20050101&end=20241231&format=JSON
```

**Test in Browser:**

1. Copy URL above
2. Paste in browser
3. See JSON response instantly!

---

## 📝 TypeScript Types

### **Interfaces**

```typescript
interface HistoricalData {
  dates: string[]; // Array of dates ("YYYY-MM-DD")
  precipitation: number[]; // Daily precipitation (mm/day)
  rainy_days: number; // Count of rainy days (>0.1mm)
  dry_days: number; // Count of dry days
  probability: number; // Percentage (0-100)
  total_precipitation: number; // Sum of all precipitation
  avg_precipitation: number; // Average daily precipitation
}

interface PrecipitationData {
  date: string;
  latitude: number;
  longitude: number;
  precipitation_mm: number;
  source: 'nasa-power-merra2';
  quality: 'good' | 'fair' | 'poor';
}
```

---

## 🧪 Testing

### **Unit Test Example**

```typescript
import { NASADataFetcher } from '@/lib/nasa-api/merra2-fetcher';

describe('NASADataFetcher', () => {
  it('should fetch probability for Seattle July 15', async () => {
    const fetcher = new NASADataFetcher();
    const result = await fetcher.fetchDateProbability(47.6, -122.3, 7, 15, 20);

    expect(result.probability).toBeGreaterThanOrEqual(0);
    expect(result.probability).toBeLessThanOrEqual(100);
    expect(result.rainy_days + result.dry_days).toBeGreaterThan(0);
  });

  it('should handle invalid coordinates', async () => {
    const fetcher = new NASADataFetcher();

    await expect(
      fetcher.fetchDateProbability(999, 999, 7, 15)
    ).rejects.toThrow();
  });
});
```

---

## 🚀 Deployment

### **Environment Variables (Optional)**

```bash
# .env.local
UPSTASH_REDIS_URL=https://your-redis-url  # Optional caching
UPSTASH_REDIS_TOKEN=your_token
```

### **Vercel Deployment**

```bash
# Deploy to production
vercel deploy --prod

# Environment variables
vercel env add UPSTASH_REDIS_URL production
vercel env add UPSTASH_REDIS_TOKEN production
```

---

## 📈 Performance Benchmarks

| Operation             | Time        | Notes                      |
| --------------------- | ----------- | -------------------------- |
| **First API call**    | 3-5 seconds | NASA POWER API response    |
| **Cached call**       | <1 second   | With Redis/memory cache    |
| **Parallel 3 cities** | 3-5 seconds | Same as single (parallel!) |
| **20 years of data**  | 3-5 seconds | ~7,300 days processed      |
| **Response size**     | 50-100KB    | JSON payload               |

---

## 🎯 Common Use Cases

### **1. Event Planning**

```typescript
// "Will it rain on my wedding?"
const wedding = {
  date: new Date('2025-07-15'),
  location: { lat: 47.6, lon: -122.3 },
};

const result = await fetcher.fetchDateProbability(
  wedding.location.lat,
  wedding.location.lon,
  wedding.date.getMonth() + 1,
  wedding.date.getDate()
);

if (result.probability > 50) {
  console.log('🌧️ High chance of rain - book indoor venue!');
} else {
  console.log('☀️ Low chance of rain - outdoor venue OK!');
}
```

### **2. Travel Planning**

```typescript
// "What's the rain risk for my Tokyo trip?"
const tripDates = [
  { month: 7, day: 10 },
  { month: 7, day: 11 },
  { month: 7, day: 12 },
];

const tokyo = { lat: 35.6762, lon: 139.6503 };

const results = await Promise.all(
  tripDates.map(({ month, day }) =>
    fetcher.fetchDateProbability(tokyo.lat, tokyo.lon, month, day)
  )
);

const avgProbability =
  results.reduce((sum, r) => sum + r.probability, 0) / results.length;
console.log(`Average rain chance: ${avgProbability.toFixed(1)}%`);
```

### **3. Climate Trends**

```typescript
// "Is July getting rainier in my city?"
const recentYears = await fetcher.fetchHistoricalPrecipitation(
  lat,
  lon,
  2015,
  2024
);

const olderYears = await fetcher.fetchHistoricalPrecipitation(
  lat,
  lon,
  2005,
  2014
);

const recentRainDays = recentYears.rainy_days;
const olderRainDays = olderYears.rainy_days;

if (recentRainDays > olderRainDays) {
  console.log('📈 Rain is increasing (climate change indicator)');
} else {
  console.log('📉 Rain is decreasing');
}
```

---

## 🏆 Championship Tips

### **What Judges Look For:**

1. ✅ **Real NASA Data** - Not simulated
2. ✅ **Works for ANY location** - Not pre-defined cities
3. ✅ **Fast response** - <10 seconds
4. ✅ **Production-ready** - Error handling, caching
5. ✅ **Scalable** - Works for unlimited users

### **Demo Script:**

```
1. Show user input: "Seattle, July 15, 2025"
2. Show API call in browser DevTools (3-5 seconds)
3. Show result: "38.1% chance of rain based on 21 years of NASA data"
4. Change to different location: "Dhaka, Bangladesh"
5. Show it works instantly for ANY location!
6. Emphasize: "No pre-downloaded files, works globally!"
```

---

## 📚 Resources

- **NASA POWER API:** https://power.larc.nasa.gov/
- **API Docs:** https://power.larc.nasa.gov/docs/
- **MERRA-2 Info:** https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/
- **Test Script:** `/scripts/test-power-api.ts`
- **Fetcher Code:** `/lib/nasa-api/merra2-fetcher.ts`

---

## ⚡ TL;DR

```typescript
// Installation: NONE! Already working!

// Usage:
import { NASADataFetcher } from '@/lib/nasa-api/merra2-fetcher';

const fetcher = new NASADataFetcher();
const result = await fetcher.fetchDateProbability(lat, lon, month, day);

console.log(`${result.probability}% chance of rain`);

// That's it! 3-5 seconds for 20 years of NASA data!
```

**🎉 YOU'RE READY TO WIN! 🏆**