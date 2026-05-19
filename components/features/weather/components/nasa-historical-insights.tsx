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
import { 
  ChevronDown, 
  ChevronUp, 
  Satellite, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  Flame, 
  CloudRain, 
  Snowflake, 
  Lightbulb 
} from 'lucide-react';
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
          className="w-full justify-between border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-mono text-xs uppercase tracking-wider"
          onClick={() => setExpanded(true)}
        >
          <div className="flex items-center gap-2">
            <Satellite className="h-4 w-4 text-cyan-500" />
            <span className="font-semibold">
              NASA Historical Analysis Available
            </span>
            <Badge variant="secondary" className="ml-2 font-mono text-[9px] uppercase">
              {data.period?.years_analyzed || 0} years data
            </Badge>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      )}

      {/* Expanded State - Full NASA Data */}
      {expanded && (
        <Card className="border border-slate-200/60 dark:border-slate-800/40 bg-white dark:bg-slate-900/60 shadow-sm rounded-lg overflow-hidden">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800/40 pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2 text-base font-semibold uppercase tracking-tight text-slate-900 dark:text-white">
                  <Satellite className="h-4 w-4 text-cyan-500" />
                  NASA Historical Observations
                </CardTitle>
                <CardDescription className="mt-1.5 font-mono text-[10px] uppercase tracking-wide">
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
              <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/15 border border-amber-100 dark:border-amber-900/20 rounded-md">
                <p className="text-[11px] font-mono uppercase tracking-tight text-amber-800 dark:text-amber-400">
                  Notice: Limited historical data available. Requested 10 years,
                  found {data.period?.years_analyzed}. Results should be
                  considered with caution.
                </p>
              </div>
            )}
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Precipitation Analysis */}
            {data.precipitation && (
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Droplets className="h-4 w-4 text-cyan-500" />
                  Rain Probability
                </h3>
                <div className="bg-slate-50/50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-800/40 rounded-md p-4">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
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
                      className="font-mono text-[9px] uppercase tracking-wider"
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
                    className="h-2 mb-3 bg-slate-200 dark:bg-slate-800"
                  />
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    {data.precipitation.rainy_days} of{' '}
                    {data.period?.years_analyzed} years had rain on this date
                  </p>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{data.precipitation.description}</p>

                  {data.precipitation.avg_rainfall_mm > 0 && (
                    <p className="text-[10px] font-mono text-slate-400 mt-2 uppercase tracking-wider">
                      Average rainfall:{' '}
                      {data.precipitation.avg_rainfall_mm.toFixed(1)}mm
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Temperature Analysis */}
            {data.temperature && (
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-slate-400" />
                  Temperature Analysis
                </h3>
                <div className="bg-slate-50/50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-800/40 rounded-md p-4">
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white">
                        {data.temperature.avg_celsius}°C
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Average
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        ({data.temperature.avg_fahrenheit}°F)
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-mono font-semibold text-amber-600">
                        {data.temperature.max_celsius}°C
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Hottest
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        {data.temperature.hottest_year}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-mono font-semibold text-cyan-600">
                        {data.temperature.min_celsius}°C
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Coldest
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        {data.temperature.coldest_year}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">{data.temperature.description}</p>
                </div>
              </div>
            )}

            {/* Extreme Events */}
            {data.extreme_events && (
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                  Extreme Weather Events
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {/* Hot Days */}
                  {data.extreme_events.hot_days && (
                    <div className="bg-slate-50/50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-800/40 rounded-md p-3 text-center">
                      <Flame className="h-4 w-4 mx-auto text-amber-500 mb-1.5" />
                      <div className="font-mono text-lg font-bold text-amber-600">
                        {data.extreme_events.hot_days.probability}%
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Hot Days
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        30°C+ / 86°F+
                      </div>
                    </div>
                  )}

                  {/* Heat Waves */}
                  {data.extreme_events.heat_waves && (
                    <div className="bg-slate-50/50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-800/40 rounded-md p-3 text-center">
                      <Thermometer className="h-4 w-4 mx-auto text-rose-500 mb-1.5" />
                      <div className="font-mono text-lg font-bold text-rose-600">
                        {data.extreme_events.heat_waves.probability}%
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Heat Waves
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        32°C+ / 90°F+
                      </div>
                    </div>
                  )}

                  {/* Heavy Rain */}
                  {data.extreme_events.heavy_rain && (
                    <div className="bg-slate-50/50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-800/40 rounded-md p-3 text-center">
                      <CloudRain className="h-4 w-4 mx-auto text-blue-500 mb-1.5" />
                      <div className="font-mono text-lg font-bold text-blue-600">
                        {data.extreme_events.heavy_rain.probability}%
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Heavy Rain
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        25mm+ / 1 inch+
                      </div>
                    </div>
                  )}

                  {/* Cold Snaps */}
                  {data.extreme_events.cold_snaps && (
                    <div className="bg-slate-50/50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-800/40 rounded-md p-3 text-center">
                      <Snowflake className="h-4 w-4 mx-auto text-cyan-500 mb-1.5" />
                      <div className="font-mono text-lg font-bold text-cyan-600">
                        {data.extreme_events.cold_snaps.probability}%
                      </div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        Cold Snaps
                      </div>
                      <div className="text-[9px] font-mono text-slate-400">
                        Below 0°C
                      </div>
                    </div>
                  )}
                </div>

                {/* Explanation Note */}
                <div className="bg-slate-50/30 dark:bg-slate-900/40 rounded-md p-3 border border-slate-100/50 dark:border-slate-800/40">
                  <p className="text-[10px] text-slate-400 uppercase tracking-tight">
                    <strong>Observation Note:</strong> High rain probability (
                    {data.precipitation?.probability}%) with low heavy rain risk
                    ({data.extreme_events.heavy_rain?.probability}%) indicates{' '}
                    <strong>light to moderate showers</strong>, not flash flooding
                    conditions.
                  </p>
                </div>
              </div>
            )}

            {/* Recommendations */}
            {data.recommendation && data.recommendation.suggestions && (
              <div className="space-y-3">
                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-amber-500" />
                  NASA-Based Recommendations
                </h3>
                <div className="bg-slate-50/50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-800/40 rounded-md p-4">
                  <Badge
                    className="mb-3 font-mono text-[9px] uppercase tracking-wider"
                    variant={
                      data.recommendation.overall_risk === 'high'
                        ? 'destructive'
                        : data.recommendation.overall_risk === 'moderate'
                        ? 'default'
                        : 'secondary'
                    }
                  >
                    {data.recommendation.overall_risk} RISK LEVEL
                  </Badge>
                  <ul className="space-y-2">
                    {data.recommendation.suggestions
                      .slice(0, 3)
                      .map((suggestion: string, idx: number) => (
                        <li
                          key={idx}
                          className="text-xs flex items-start gap-2 text-slate-600 dark:text-slate-300"
                        >
                          <span className="text-cyan-500 font-bold">•</span>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Metadata Footer */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40">
              <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-slate-400">
                <span>
                  Source: {data.metadata?.data_source || 'NASA POWER API'} • v
                  {data.metadata?.api_version || '1'}
                </span>
                <span>
                  Query Latency:{' '}
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