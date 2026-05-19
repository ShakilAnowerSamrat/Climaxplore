'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, Satellite } from 'lucide-react';
import { useState } from 'react';

interface NASAHistoricalInsightsProps {
  data: any;
  locationName: string;
}

export function NASAHistoricalInsights({
  data,
  locationName,
}: NASAHistoricalInsightsProps) {
  const [expanded, setExpanded] = useState(false);

  if (!data) return null;

  return (
    <div className="mb-6">
      {/* Collapsed State - Just a badge/button */}
      {!expanded && (
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setExpanded(true)}
        >
          <div className="flex items-center gap-2">
            <Satellite className="h-4 w-4" />
            <span className="font-semibold">
              NASA Historical Analysis Available
            </span>
            <Badge variant="secondary" className="ml-2">
              {data.period?.years_analyzed || 0} years of satellite data
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}

      {/* Expanded State - Full NASA Data */}
      {expanded && (
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Satellite className="h-5 w-5 text-primary" />
                  NASA Historical Analysis
                </CardTitle>
                <CardDescription className="mt-2">
                  {locationName} • {data.date?.display || 'October 13'} • Based
                  on {data.period?.years_analyzed || 0} years of satellite
                  observations ({data.metadata?.data_source || 'NASA POWER API'}
                  )
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(false)}
                className="shrink-0"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
            </div>

            {/* Confidence Warning if low */}
            {data.period?.confidence_level === 'low' && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-400">
                  ⚠️ Limited historical data available. Requested 10 years,
                  found {data.period?.years_analyzed}. Results should be
                  considered with caution.
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Precipitation Analysis */}
            {data.precipitation && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  🌧️ Rain Probability
                </h3>
                <div className="bg-card border rounded-lg p-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-bold text-primary">
                      {data.precipitation.probability}%
                    </span>
                    <Badge
                      variant={
                        data.precipitation.probability > 70
                          ? 'destructive'
                          : data.precipitation.probability > 40
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {data.precipitation.probability > 70
                        ? 'HIGH'
                        : data.precipitation.probability > 40
                        ? 'MODERATE'
                        : 'LOW'}
                    </Badge>
                  </div>
                  <Progress
                    value={data.precipitation.probability}
                    className="h-2 mb-3"
                  />
                  <p className="text-sm text-muted-foreground mb-2">
                    {data.precipitation.rainy_days} of{' '}
                    {data.period?.years_analyzed} years had rain on this date
                  </p>
                  <p className="text-sm">{data.precipitation.description}</p>

                  {data.precipitation.avg_rainfall_mm > 0 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Average rainfall:{' '}
                      {data.precipitation.avg_rainfall_mm.toFixed(1)}mm (light
                      showers)
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Temperature Analysis */}
            {data.temperature && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  🌡️ Temperature Analysis
                </h3>
                <div className="bg-card border rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {data.temperature.avg_celsius}°C
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Average
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ({data.temperature.avg_fahrenheit}°F)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-orange-600">
                        {data.temperature.max_celsius}°C
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Hottest
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.temperature.hottest_year}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">
                        {data.temperature.min_celsius}°C
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Coldest
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {data.temperature.coldest_year}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm">{data.temperature.description}</p>
                </div>
              </div>
            )}

            {/* Extreme Events */}
            {data.extreme_events && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  ⚠️ Extreme Weather Events
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Hot Days */}
                  {data.extreme_events.hot_days && (
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">🔥</div>
                      <div className="text-xl font-bold text-orange-600">
                        {data.extreme_events.hot_days.probability}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Hot Days
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        30°C+ / 86°F+
                      </div>
                    </div>
                  )}

                  {/* Heat Waves */}
                  {data.extreme_events.heat_waves && (
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">🌡️</div>
                      <div className="text-xl font-bold text-red-600">
                        {data.extreme_events.heat_waves.probability}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Heat Waves
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        32°C+ / 90°F+
                      </div>
                    </div>
                  )}

                  {/* Heavy Rain */}
                  {data.extreme_events.heavy_rain && (
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">💧</div>
                      <div className="text-xl font-bold text-blue-600">
                        {data.extreme_events.heavy_rain.probability}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Heavy Rain
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        25mm+ / 1 inch+
                      </div>
                    </div>
                  )}

                  {/* Cold Snaps */}
                  {data.extreme_events.cold_snaps && (
                    <div className="bg-card border rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">❄️</div>
                      <div className="text-xl font-bold text-cyan-600">
                        {data.extreme_events.cold_snaps.probability}%
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Cold Snaps
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Below 0°C / 32°F
                      </div>
                    </div>
                  )}
                </div>

                {/* Explanation Note */}
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">
                    <strong>Note:</strong> High rain probability (
                    {data.precipitation?.probability}%) with low heavy rain risk
                    ({data.extreme_events.heavy_rain?.probability}%) indicates{' '}
                    <strong>light to moderate showers</strong>, not flooding
                    conditions.
                  </p>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {data.recommendation && data.recommendation.suggestions && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  💡 NASA-Based Recommendations
                </h3>
                <div className="bg-card border rounded-lg p-4">
                  <Badge
                    className="mb-3"
                    variant={
                      data.recommendation.overall_risk === 'high'
                        ? 'destructive'
                        : data.recommendation.overall_risk === 'moderate'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {data.recommendation.overall_risk.toUpperCase()} RISK
                  </Badge>
                  <ul className="space-y-2">
                    {data.recommendation.suggestions
                      .slice(0, 3)
                      .map((suggestion: string, idx: number) => (
                        <li
                          key={idx}
                          className="text-sm flex items-start gap-2"
                        >
                          <span className="text-primary">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Data: {data.metadata?.data_source || 'NASA POWER API'} • API v
                  {data.metadata?.api_version || '1'}
                </span>
                <span>
                  Response time:{' '}
                  {data.metadata?.response_time_ms
                    ? `${(data.metadata.response_time_ms / 1000).toFixed(1)}s`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}