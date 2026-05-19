'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ActivityType } from '@/lib/risk-assessment';
import { addMonths, format } from 'date-fns';
import {
  CalendarDays as CalendarDaysIcon,
  CloudRain,
  Droplets,
  Sun,
  Thermometer,
  Wind,
} from 'lucide-react';

interface MonthlyPredictionViewProps {
  monthlyPrediction: any;
  selectedMonth: string;
  activity: ActivityType;
  locationName: string;
}

export function MonthlyPredictionView({
  monthlyPrediction,
  selectedMonth,
  activity,
  locationName,
}: MonthlyPredictionViewProps) {
  const getMonthDisplayName = (monthKey: string) => {
    if (monthKey === 'current') return 'Current';
    const offset = Number.parseInt(monthKey.replace('month', ''));
    return format(addMonths(new Date(), offset), 'MMMM yyyy');
  };

  return (
    <div className="space-y-6">
      {/* Monthly Overview Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarDaysIcon className="h-8 w-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">
                  {getMonthDisplayName(selectedMonth)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Predicted Monthly Weather Pattern
                </div>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-4 py-2">
              PREDICTION
            </Badge>
          </CardTitle>
          <CardDescription className="flex items-center gap-2">
            <span>{locationName}</span>
            <span>•</span>
            <span>Based on historical patterns and current trends</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Monthly Temperature Range */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-card border rounded-lg">
              <Thermometer className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">
                {Math.round(monthlyPrediction.avgTemp.min)}°C
              </div>
              <div className="text-xs text-muted-foreground">Average Low</div>
            </div>
            <div className="text-center p-4 bg-primary/10 border-2 border-primary rounded-lg">
              <Thermometer className="h-6 w-6 mx-auto mb-2 text-primary" />
              <div className="text-3xl font-bold text-primary">
                {Math.round(monthlyPrediction.avgTemp.avg)}°C
              </div>
              <div className="text-xs text-muted-foreground font-semibold">
                Average Temperature
              </div>
            </div>
            <div className="text-center p-4 bg-card border rounded-lg">
              <Thermometer className="h-6 w-6 mx-auto mb-2 text-red-500" />
              <div className="text-2xl font-bold">
                {Math.round(monthlyPrediction.avgTemp.max)}°C
              </div>
              <div className="text-xs text-muted-foreground">Average High</div>
            </div>
          </div>

          {/* Monthly Conditions Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-card border rounded-lg">
              <Wind className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="font-semibold">
                {monthlyPrediction.avgWind.toFixed(1)} m/s
              </div>
              <div className="text-xs text-muted-foreground">Avg Wind</div>
            </div>
            <div className="text-center p-3 bg-card border rounded-lg">
              <Droplets className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="font-semibold">
                {Math.round(monthlyPrediction.avgHumidity)}%
              </div>
              <div className="text-xs text-muted-foreground">Avg Humidity</div>
            </div>
            <div className="text-center p-3 bg-card border rounded-lg">
              <CloudRain className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="font-semibold">
                {Math.round(monthlyPrediction.precipitationDays)}
              </div>
              <div className="text-xs text-muted-foreground">Rainy Days</div>
            </div>
            <div className="text-center p-3 bg-card border rounded-lg">
              <Sun className="h-5 w-5 mx-auto mb-2 text-muted-foreground" />
              <div className="font-semibold">
                {Math.round(monthlyPrediction.sunnyDays)}
              </div>
              <div className="text-xs text-muted-foreground">Sunny Days</div>
            </div>
          </div>

          {/* Weekly Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Weekly Breakdown</h4>
            {monthlyPrediction.weeklyData?.map((week: any, index: number) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Week {index + 1}</span>
                  <Badge variant="outline">{week.condition}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Temp: </span>
                    <span className="font-medium">
                      {Math.round(week.avgTemp)}°C
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Rain: </span>
                    <span className="font-medium">
                      {Math.round(week.precipitation * 100)}%
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wind: </span>
                    <span className="font-medium">
                      {week.wind.toFixed(1)} m/s
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Suitability for the Month */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Suitability for {activity.name}</CardTitle>
          <CardDescription>
            Predicted conditions for {getMonthDisplayName(selectedMonth)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center p-6 bg-muted/50 rounded-lg">
              <div className="text-4xl font-bold text-primary mb-2">
                {monthlyPrediction.activityScore}/100
              </div>
              <div className="text-sm text-muted-foreground mb-3">
                Monthly Activity Suitability Score
              </div>
              <Progress
                value={monthlyPrediction.activityScore}
                className="w-full h-3"
              />
            </div>

            <div className="grid gap-3">
              <div className="p-4 bg-card border rounded-lg">
                <h4 className="font-semibold mb-2">
                  Best Days for {activity.name}
                </h4>
                <p className="text-sm text-muted-foreground">
                  Approximately {monthlyPrediction.optimalDays} days this month
                  will have optimal conditions for your activity.
                </p>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <h4 className="font-semibold mb-2">Weather Patterns</h4>
                <p className="text-sm text-muted-foreground">
                  {monthlyPrediction.pattern}
                </p>
              </div>

              <div className="p-4 bg-card border rounded-lg">
                <h4 className="font-semibold mb-2">Recommendations</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {monthlyPrediction.recommendations?.map(
                    (rec: string, idx: number) => (
                      <li key={idx}>• {rec}</li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}