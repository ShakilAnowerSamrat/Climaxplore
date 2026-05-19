'use client';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import type {
  ActivityType,
  EnhancedRiskAssessment,
} from '@/lib/risk-assessment';
import type { WeatherData } from '@/lib/weather-api';
import { ActivityInsights } from './components/activity-insights';
import { CurrentWeatherOverview } from './components/current-weather-overview';
import { ExtremeConditionsAlert } from './components/extreme-conditions-alert';
import { FutureWeatherView } from './components/future-weather-view';
import { MonthlyPredictionView } from './components/monthly-prediction-view';
import { Recommendations } from './components/recommendations';
import { RiskFactorBreakdown } from './components/risk-factor-breakdown';
import { WeatherAnalysisHeader } from './components/weather-analysis-header';
import { useWeatherData } from './hooks/use-weather-data';
import { detectExtremeConditions } from './utils/weather-helpers';

interface WeatherResultsProps {
  weather: WeatherData;
  riskAssessment: EnhancedRiskAssessment;
  activity: ActivityType;
  locationName: string;
  nasaData?: any;
  nasaSelectedDate?: any; // 🛰️ NASA hourly data for selected date
  selectedDate?: Date; // 📅 Currently selected date (from parent)
  onDateSelect?: (date: Date) => void; // 📅 Date selection handler (from parent)
}

export function WeatherResults({
  weather,
  riskAssessment,
  activity,
  locationName,
  nasaData,
  nasaSelectedDate,
  selectedDate: parentSelectedDate,
  onDateSelect: parentOnDateSelect,
}: WeatherResultsProps) {
  const {
    futureWeather,
    isLoadingFuture,
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    monthlyPrediction,
    isLoadingMonthly,
  } = useWeatherData({ weather });

  const currentExtremeConditions = detectExtremeConditions(weather);
  const futureExtremeConditions = futureWeather
    ? detectExtremeConditions(futureWeather)
    : [];

  // 🔧 Use parent's date selection handler to trigger NASA data fetch
  const handleDateChange = (date: Date | undefined) => {
    if (date && parentOnDateSelect) {
      console.log(
        '[WeatherResults] Date changed, calling parent handler:',
        date
      );
      parentOnDateSelect(date);
    }
  };

  // 🔧 Use parent's selected date or fallback to current date
  const currentSelectedDate = parentSelectedDate || new Date();

  return (
    <div className="space-y-6">
      <WeatherAnalysisHeader
        activeTab={activeTab}
        selectedMonth={selectedMonth}
        selectedDate={currentSelectedDate}
        futureWeather={futureWeather}
        isLoadingFuture={isLoadingFuture}
        monthlyPrediction={monthlyPrediction}
        isLoadingMonthly={isLoadingMonthly}
        locationName={locationName}
        onActiveTabChange={setActiveTab}
        onSelectedMonthChange={setSelectedMonth}
        onSelectedDateChange={handleDateChange}
      />

      {((activeTab === 'current' && currentExtremeConditions.length > 0) ||
        (activeTab === 'future' && futureExtremeConditions.length > 0)) && (
        <ExtremeConditionsAlert
          conditions={
            activeTab === 'current'
              ? currentExtremeConditions
              : futureExtremeConditions
          }
          activeTab={activeTab}
        />
      )}

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as 'current' | 'future')}
      >
        <TabsContent value="current" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <CurrentWeatherOverview
              weather={weather}
              riskAssessment={riskAssessment}
              activity={activity}
              locationName={locationName}
              nasaSelectedDate={nasaSelectedDate}
              nasaData={nasaData}
              selectedDate={parentSelectedDate}
            />
            <RiskFactorBreakdown
              riskAssessment={riskAssessment}
              activity={activity}
            />
          </div>
        </TabsContent>

        <TabsContent value="future" className="space-y-6">
          {selectedMonth !== 'current' ? (
            <div className="space-y-6">
              {isLoadingMonthly ? (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading monthly prediction data...
                  </p>
                </div>
              ) : monthlyPrediction ? (
                <MonthlyPredictionView
                  monthlyPrediction={monthlyPrediction}
                  selectedMonth={selectedMonth}
                  activity={activity}
                  locationName={locationName}
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">
                    Unable to load monthly prediction data
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {isLoadingFuture ? (
                <div className="text-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">
                    Loading future weather data...
                  </p>
                </div>
              ) : futureWeather ? (
                <FutureWeatherView
                  futureWeather={futureWeather}
                  selectedDate={currentSelectedDate}
                />
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">
                    Select a future date to see weather forecast
                  </p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Recommendations riskAssessment={riskAssessment} />
      <ActivityInsights weather={weather} activity={activity} />
    </div>
  );
}