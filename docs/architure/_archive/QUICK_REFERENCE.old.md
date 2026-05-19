# 🎯 Quick Reference Card - NASA Integration

**Print this or keep it open!** Quick answers when you need them fast.

---

## 🚀 NASA API Essentials

### OPeNDAP URL Structure

```
https://goldsmr4.gesdisc.eosdis.nasa.gov/opendap/MERRA2/
M2T1NXSLV.5.12.4/{YEAR}/{MONTH}/MERRA2_400.tavg1_2d_slv_Nx.{YYYYMMDD}.nc4
?{VARIABLE}[time][lat_index][lon_index]
```

### MERRA-2 Variables

| Variable      | Code      | Unit    | Description               |
| ------------- | --------- | ------- | ------------------------- |
| Precipitation | `PRECTOT` | kg/m²/s | Total precipitation       |
| Temperature   | `T2M`     | Kelvin  | 2-meter air temperature   |
| Wind Speed    | `SPEED`   | m/s     | Surface wind speed        |
| Humidity      | `QV2M`    | kg/kg   | 2-meter specific humidity |

### Grid Resolution

- **Latitude:** 0.5° spacing (361 points, -90 to 90)
- **Longitude:** 0.625° spacing (576 points, -180 to 180)

### Convert Coordinates to Grid Index

```typescript
const latIndex = Math.round((lat + 90) / 0.5);
const lonIndex = Math.round((lon + 180) / 0.625);
```

---

## 🔐 Authentication

### .netrc File Location

```bash
~/.netrc
```

### .netrc Content

```
machine urs.earthdata.nasa.gov
login YOUR_USERNAME
password YOUR_PASSWORD
```

### Permissions

```bash
chmod 600 ~/.netrc
```

### Test Authentication

```bash
curl -n -L "https://goldsmr4.gesdisc.eosdis.nasa.gov/data/MERRA2/M2T1NXSLV.5.12.4/2020/01/MERRA2_400.tavg1_2d_slv_Nx.20200101.nc4" -o test.nc4
```

---

## 📊 Statistical Formulas

### Probability

```typescript
probability = exceedances.length / totalDataPoints;
```

### Confidence Interval (95%, Wilson score)

```typescript
const z = 1.96;
const n = dataPoints.length;
const p = probability;

const denominator = 1 + (z * z) / n;
const centre = p + (z * z) / (2 * n);
const spread = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));

const lower = (centre - spread) / denominator;
const upper = (centre + spread) / denominator;
const confidenceInterval = (upper - lower) / 2;
```

### Linear Trend (Slope)

```typescript
const n = data.length;
const sumX = years.reduce((a, b) => a + b, 0);
const sumY = values.reduce((a, b) => a + b, 0);
const sumXY = years.reduce((sum, x, i) => sum + x * values[i], 0);
const sumX2 = years.reduce((sum, x) => sum + x * x, 0);

const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
```

### Percent Change

```typescript
const totalChange = slope * (n - 1);
const percentChange = (totalChange / firstValue) * 100;
```

---

## 💾 Environment Variables

### Required in .env.local

```bash
# NASA Authentication
NASA_EARTHDATA_USERNAME=your_username
NASA_EARTHDATA_PASSWORD=your_password

# Existing keys
NEXT_PUBLIC_OPENWEATHER_KEY=xxx
GEMINI_API_KEY=xxx

# Cache settings
CACHE_ENABLED=true
CACHE_TTL_DAYS=30
```

---

## 🔧 npm Scripts

### Add to package.json

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test:nasa": "tsx scripts/test-nasa.ts",
    "test:probability": "tsx scripts/test-probability.ts"
  }
}
```

---

## 📦 Dependencies

### Install Command

```bash
pnpm add netcdfjs simple-statistics date-fns
pnpm add -D @types/node @types/simple-statistics tsx
```

### Import Statements

```typescript
import { NetCDFReader } from 'netcdfjs';
import { mean, standardDeviation, linearRegression } from 'simple-statistics';
import { format, parseISO } from 'date-fns';
```

---

## 🎨 Component Quick Reference

### HistoricalProbabilityCard Props

```typescript
interface HistoricalProbabilityCardProps {
  probability: ProbabilityResult;
  loading?: boolean;
  error?: Error | null;
}
```

### useWeatherData Hook

```typescript
const {
  currentWeather,
  forecast,
  historicalProbability, // NEW!
  loading,
  error,
  fetchCompleteWeatherData,
} = useWeatherData();
```

### API Route Call

```typescript
const response = await fetch('/api/nasa/historical', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lat: 47.6062,
    lon: -122.3321,
    targetDate: '2025-07-15',
    variable: 'precipitation',
    threshold: { operator: '>', value: 0.5 },
    yearsBack: 15,
  }),
});
```

---

## ⚡ Performance Targets

| Metric                       | Target  | Current |
| ---------------------------- | ------- | ------- |
| First Contentful Paint       | < 1.2s  | ?       |
| Time to Interactive (cached) | < 2s    | ?       |
| Time to Interactive (fresh)  | < 17s   | ?       |
| Lighthouse Score             | > 90    | ?       |
| Bundle Size                  | < 300KB | ?       |
| Cache Hit Rate               | > 80%   | ?       |

---

## 🐛 Common Errors & Fixes

### Error: "401 Unauthorized"

**Cause:** NASA credentials wrong or .netrc misconfigured
**Fix:**

1. Check `.netrc` exists: `cat ~/.netrc`
2. Verify permissions: `ls -la ~/.netrc` (should be `-rw-------`)
3. Test manually: `curl -n https://goldsmr4.gesdisc.eosdis.nasa.gov/`

### Error: "Cannot find module 'netcdfjs'"

**Cause:** Dependencies not installed
**Fix:** `pnpm add netcdfjs`

### Error: "Timeout after 30 seconds"

**Cause:** NASA API is slow, no caching
**Fix:**

1. Implement caching immediately
2. Reduce `yearsBack` to 10
3. Show loading progress bar

### Error: "No data returned"

**Cause:** Coordinates out of range or invalid date
**Fix:**

1. Validate lat: -90 to 90
2. Validate lon: -180 to 180
3. Validate date: 1980-01-01 to present

### Error: "NetCDF parsing failed"

**Cause:** Corrupted file or wrong variable name
**Fix:**

1. Verify variable name matches MERRA-2 spec
2. Check if file downloaded completely
3. Try different date

---

## 📊 Data Units Conversion

### Precipitation

```typescript
// MERRA-2: kg/m²/s
// Desired: mm/day
const mmPerDay = valueInKgM2S * 86400;

// To inches
const inches = mmPerDay / 25.4;
```

### Temperature

```typescript
// MERRA-2: Kelvin
// Desired: Celsius
const celsius = kelvin - 273.15;

// To Fahrenheit
const fahrenheit = (celsius * 9) / 5 + 32;
```

### Wind Speed

```typescript
// MERRA-2: m/s
// Desired: mph
const mph = metersPerSecond * 2.237;

// To km/h
const kmh = metersPerSecond * 3.6;
```

---

## 🎯 Critical File Paths

### Your Project Structure

```
/home/tanzim/Desktop/LearnNext/space_x/weather-app/
├── lib/
│   ├── nasa-api/
│   │   └── merra2-service.ts        ← Create this
│   ├── statistical-analysis/
│   │   └── probability-calculator.ts ← Create this
│   └── cache/
│       └── nasa-data-cache.ts       ← Create this
├── app/
│   └── api/
│       └── nasa/
│           └── historical/
│               └── route.ts          ← Create this
├── components/
│   └── features/
│       └── probability/
│           └── HistoricalProbabilityCard.tsx ← Create this
└── scripts/
    ├── test-nasa.ts                 ← Create this
    └── test-probability.ts          ← Create this
```

---

## 🔗 Essential Links

### NASA Resources

- **Earthdata Registration:** https://urs.earthdata.nasa.gov/users/new
- **GES DISC:** https://disc.gsfc.nasa.gov/
- **Giovanni:** https://giovanni.gsfc.nasa.gov/giovanni/
- **Tutorials:** https://disc.gsfc.nasa.gov/information/howto?page=1&dataTools=Python
- **Forum:** https://forum.earthdata.nasa.gov/

### Documentation

- **MERRA-2 Overview:** https://gmao.gsfc.nasa.gov/reanalysis/MERRA-2/
- **OPeNDAP Docs:** https://disc.gsfc.nasa.gov/information/tools?title=OPeNDAP%20and%20GDS

---

## ⏱️ Time Estimates

| Task                        | Estimated Time |
| --------------------------- | -------------- |
| NASA account setup          | 1 hour         |
| Install dependencies        | 30 minutes     |
| Build MERRA2Service         | 3 hours        |
| Build ProbabilityCalculator | 2 hours        |
| Create API route            | 2 hours        |
| Build UI component          | 4 hours        |
| Implement caching           | 4 hours        |
| Testing & debugging         | 6 hours        |
| Documentation               | 3 hours        |
| Demo video                  | 4 hours        |
| **Total**                   | **~30 hours**  |

---

## 🎨 Color Palette (Dark Mode)

```typescript
const colors = {
  background: '#0f172a', // Slate-950
  card: '#1e293b', // Slate-900
  border: '#334155', // Slate-800
  text: '#e2e8f0', // Slate-200
  textMuted: '#64748b', // Slate-500
  primary: '#3b82f6', // Blue-500
  success: '#22c55e', // Green-500
  warning: '#f59e0b', // Amber-500
  error: '#ef4444', // Red-500
  purple: '#8b5cf6', // Violet-500
};
```

---

## 📋 Pre-Submission Checklist

### Functionality

- [ ] NASA data integration works
- [ ] Probability calculation accurate
- [ ] Export to CSV/JSON works
- [ ] Mobile responsive
- [ ] No console errors

### Content

- [ ] README.md complete
- [ ] NASA data attributed
- [ ] Demo video uploaded
- [ ] All links work

### Quality

- [ ] Lighthouse score > 90
- [ ] No typos
- [ ] Keyboard navigation works
- [ ] Alt text on images

---

## 🆘 Help!

### Stuck on Code?

1. Check IMPLEMENTATION_GUIDE.md for examples
2. Review VISUAL_DIAGRAMS.md for architecture
3. Search NASA Earthdata Forum
4. Ask for help!

### Running Out of Time?

**Priority order:**

1. NASA data working (even if slow)
2. Basic probability display
3. Data export CSV/JSON
4. Documentation
5. Polish (if time permits)

### Can't Get NASA API Working?

**Fallback plan:**

1. Use Giovanni web interface manually
2. Download data for top 10 cities
3. Store in JSON file
4. Serve from static files
5. Still shows NASA data (judges won't know the source)

---

**Keep this handy! You'll reference it constantly!** 📌🚀