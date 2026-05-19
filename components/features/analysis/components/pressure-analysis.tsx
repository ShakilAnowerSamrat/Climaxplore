'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, TrendingDown, TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  formatTooltipDate,
  formatTooltipValue,
} from '../utils/analysis-helpers';

interface PressureAnalysisProps {
  historicalData: any[];
  trends: any;
}

export function PressureAnalysis({
  historicalData,
  trends,
}: PressureAnalysisProps) {
  // Check if data is from NASA (has pressure, humidity, wind_speed fields)
  const isNASAData =
    historicalData.length > 0 && historicalData[0]?.pressure !== undefined;

  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gauge className="h-5 w-5 text-chart-2" />
            <span>PRESSURE ANALYSIS</span>
          </div>
          {isNASAData && (
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
              🛰️ NASA POWER
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {trends && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center space-x-2">
              {trends.pressure.trend === 'up' ? (
                <TrendingUp className="h-4 w-4 text-chart-2" />
              ) : (
                <TrendingDown className="h-4 w-4 text-chart-4" />
              )}
              <span className="text-sm font-medium">
                {trends.pressure.change} hPa{' '}
                {trends.pressure.trend === 'up' ? 'increase' : 'decrease'} trend
              </span>
            </div>
          </div>
        )}
        {Array.isArray(historicalData) && historicalData.length > 0 && (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={historicalData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dt"
                tickFormatter={(value) =>
                  new Date(value * 1000).toLocaleDateString()
                }
              />
              <YAxis />
              <Tooltip
                labelFormatter={formatTooltipDate}
                formatter={(value: number) =>
                  formatTooltipValue(value, 'pressure')
                }
              />
              <Area
                type="monotone"
                dataKey="pressure"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}