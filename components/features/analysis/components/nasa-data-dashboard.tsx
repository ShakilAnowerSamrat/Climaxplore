'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Activity,
  AlertTriangle,
  CloudRain,
  Thermometer,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface NASADataDashboardProps {
  location: { lat: number; lon: number };
  locationName: string;
  date?: string;
}

export function NASADataDashboard({
  location,
  locationName,
  date,
}: NASADataDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any[]>([]);
  const [temporalData, setTemporalData] = useState<any[]>([]);

  useEffect(() => {
    fetchNASAData();
  }, [location.lat, location.lon, date]);

  const fetchNASAData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Determine date to analyze
      const targetDate = date ? new Date(date) : new Date();
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();

      // 1. Fetch Dashboard Data (Historical Analysis)
      const dashboardParams = new URLSearchParams({
        lat: location.lat.toString(),
        lon: location.lon.toString(),
        month: month.toString(),
        day: day.toString(),
        years: '10',
      });

      const dashboardRes = await fetch(
        `/api/weather/dashboard?${dashboardParams}`
      );
      if (dashboardRes.ok) {
        const dashboardJson = await dashboardRes.json();
        setDashboardData(dashboardJson);
      }

      // 2. Fetch 7-Day Forecast
      const forecastParams = new URLSearchParams({
        lat: location.lat.toString(),
        lon: location.lon.toString(),
        start_date: targetDate.toISOString().split('T')[0],
        days: '7',
      });

      const forecastRes = await fetch(
        `/api/weather/nasa/forecast?${forecastParams}`
      );
      if (forecastRes.ok) {
        const forecastJson = await forecastRes.json();
        setForecastData(forecastJson.forecast || []);
      }

      // 3. Fetch 30-Day Historical Temporal Data
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      const temporalParams = new URLSearchParams({
        lat: location.lat.toString(),
        lon: location.lon.toString(),
        start: startDate.toISOString().split('T')[0].replace(/-/g, ''),
        end: endDate.toISOString().split('T')[0].replace(/-/g, ''),
      });

      const temporalRes = await fetch(
        `/api/weather/nasa/temporal/daily?${temporalParams}`
      );
      if (temporalRes.ok) {
        const temporalJson = await temporalRes.json();
        setTemporalData(temporalJson.data || []);
      }
    } catch (err) {
      console.error('[climaxplore] NASA data fetch error:', err);
      setError('Failed to fetch NASA data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Calculate weather warnings
  const warnings = generateWeatherWarnings(dashboardData);

  return (
    <div className="space-y-6">
      {/* Weather Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          {warnings.map((warning, idx) => (
            <Alert
              key={idx}
              variant={
                warning.severity === 'high'
                  ? 'destructive'
                  : warning.severity === 'medium'
                  ? 'default'
                  : 'default'
              }
              className={
                warning.severity === 'medium'
                  ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-950'
                  : ''
              }
            >
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{warning.title}</AlertTitle>
              <AlertDescription>{warning.message}</AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Rain Probability */}
        <Card className="mission-control-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <CloudRain className="h-8 w-8 text-blue-500" />
              <Badge
                variant={
                  (dashboardData?.precipitation?.probability || 0) > 70
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {(dashboardData?.precipitation?.probability || 0) > 70
                  ? 'HIGH'
                  : 'LOW'}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              {dashboardData?.precipitation?.probability || 0}%
            </div>
            <p className="text-sm text-muted-foreground">Rain Probability</p>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {dashboardData?.period?.years_analyzed || 0} years
            </p>
          </CardContent>
        </Card>

        {/* Average Temperature */}
        <Card className="mission-control-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Thermometer className="h-8 w-8 text-orange-500" />
              <Badge variant="outline">AVG</Badge>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              {dashboardData?.temperature?.avg_celsius || 0}
              °C
            </div>
            <p className="text-sm text-muted-foreground">Temperature</p>
            <p className="text-xs text-muted-foreground mt-1">
              Range: {dashboardData?.temperature?.min_celsius || 0}°C -{' '}
              {dashboardData?.temperature?.max_celsius || 0}°C
            </p>
          </CardContent>
        </Card>

        {/* Extreme Heat Days */}
        <Card className="mission-control-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-8 w-8 text-red-500" />
              <Badge
                variant={
                  (dashboardData?.extreme_events?.heat_waves?.probability ||
                    0) > 30
                    ? 'destructive'
                    : 'secondary'
                }
              >
                {(dashboardData?.extreme_events?.heat_waves?.probability || 0) >
                30
                  ? 'WARNING'
                  : 'NORMAL'}
              </Badge>
            </div>
            <div className="text-3xl font-bold text-primary mb-1">
              {dashboardData?.extreme_events?.heat_waves?.probability || 0}%
            </div>
            <p className="text-sm text-muted-foreground">Heat Wave Risk</p>
            <p className="text-xs text-muted-foreground mt-1">
              Historical extreme events
            </p>
          </CardContent>
        </Card>

        {/* Data Quality */}
        <Card className="mission-control-panel">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <Activity className="h-8 w-8 text-green-500" />
              <Badge
                variant={
                  dashboardData?.metadata?.data_quality === 'complete'
                    ? 'default'
                    : 'secondary'
                }
              >
                {dashboardData?.metadata?.data_quality === 'complete'
                  ? 'FULL'
                  : 'PARTIAL'}
              </Badge>
            </div>
            <div className="text-2xl font-bold text-primary mb-1">
              {dashboardData?.metadata?.data_quality === 'complete'
                ? '100%'
                : '75%'}
            </div>
            <p className="text-sm text-muted-foreground">Data Quality</p>
            <p className="text-xs text-muted-foreground mt-1">
              {dashboardData?.metadata?.source || 'NASA POWER API'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 30-Day Temperature Trend */}
      {temporalData.length > 0 && (
        <Card className="mission-control-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              30-Day Temperature Trend (NASA Historical Data)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={temporalData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: 'Temperature (°C)',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString();
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="temp_max"
                  stackId="1"
                  stroke="#f97316"
                  fill="#f97316"
                  fillOpacity={0.6}
                  name="Max Temp"
                />
                <Area
                  type="monotone"
                  dataKey="temp_min"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                  name="Min Temp"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* 7-Day Forecast */}
      {forecastData.length > 0 && (
        <Card className="mission-control-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              7-Day Forecast (NASA Probability Model)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    });
                  }}
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  label={{
                    value: 'Probability %',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="precipitation_probability"
                  fill="#3b82f6"
                  name="Rain %"
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="heat_wave_probability"
                  fill="#f97316"
                  name="Heat Wave %"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Historical Precipitation Pattern */}
      {dashboardData?.precipitation && (
        <Card className="mission-control-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudRain className="h-5 w-5 text-primary" />
              Historical Precipitation Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Rain Probability</span>
                <span className="text-2xl font-bold text-primary">
                  {dashboardData.precipitation.probability}%
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{
                    width: `${dashboardData.precipitation.probability}%`,
                  }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <p className="text-sm text-muted-foreground">Rainy Days</p>
                  <p className="text-xl font-bold">
                    {dashboardData.precipitation.rainy_days || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Years</p>
                  <p className="text-xl font-bold">
                    {dashboardData.period?.years_analyzed || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground border-t pt-4">
                {dashboardData.precipitation.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function generateWeatherWarnings(data: any): Array<{
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
}> {
  const warnings: Array<{
    severity: 'high' | 'medium' | 'low';
    title: string;
    message: string;
  }> = [];

  if (!data) return warnings;

  // High rain probability warning
  if ((data.precipitation?.probability || 0) > 70) {
    warnings.push({
      severity: 'high',
      title: '⚠️ High Rain Probability',
      message: `${data.precipitation.probability}% chance of rain based on ${data.period?.years_analyzed} years of data. Plan indoor alternatives.`,
    });
  }

  // Heat wave warning
  if ((data.extreme_events?.heat_waves?.probability || 0) > 30) {
    warnings.push({
      severity: 'high',
      title: '🔥 Heat Wave Risk',
      message: `${data.extreme_events.heat_waves.probability}% probability of extreme heat. Stay hydrated and avoid prolonged sun exposure.`,
    });
  }

  // Cold weather warning
  if ((data.extreme_events?.cold_snaps?.probability || 0) > 30) {
    warnings.push({
      severity: 'medium',
      title: '❄️ Cold Weather Alert',
      message: `${data.extreme_events.cold_snaps.probability}% probability of unusually cold temperatures. Dress warmly.`,
    });
  }

  // Heavy rain warning
  if ((data.extreme_events?.heavy_rain?.probability || 0) > 20) {
    warnings.push({
      severity: 'medium',
      title: '🌧️ Heavy Rainfall Possible',
      message: `${data.extreme_events.heavy_rain.probability}% chance of heavy rainfall. Be prepared for potential flooding.`,
    });
  }

  // Data quality warning
  if (data.metadata?.data_quality === 'partial') {
    warnings.push({
      severity: 'low',
      title: 'ℹ️ Partial Data',
      message: `Some NASA data sources were unavailable. Using estimated fallback data: ${data.metadata.warnings?.join(
        ', '
      )}`,
    });
  }

  return warnings;
}