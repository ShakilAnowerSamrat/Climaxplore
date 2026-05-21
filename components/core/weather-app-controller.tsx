'use client';

import { WeatherHeader } from '@/components/core/weather-header';
import { WeatherTabs } from '@/components/core/weather-tabs';
import { NASAMissionControl } from '@/components/layout/dynamic-components';
import {
  ActivityTab,
  AIAssistantTab,
  AnalysisTab,
  DataTab,
  ForecastTab,
  HistoricalTab,
  MapTab,
  PreferencesTab,
  WeatherTab,
} from '@/components/tab-contents';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useWeatherContext } from '@/contexts/weather-context';
import { useAppState } from '@/hooks/use-app-state';

export function WeatherAppController() {
  const {
    weather,
    enhancedRiskAssessment,
    preferences,
    selectedActivity,
    currentLocationName,
    currentLocationCoords,
    loading,
    error,
    historicalData,
    weatherAnomalies,
    nasaData,
    nasaSelectedDate, // 🛰️ NASA hourly data for selected date
    selectedDate, // 📅 Currently selected date
    isClient,
    handleLocationSelect: baseHandleLocationSelect,
    handlePreferencesChange,
    handleActivityChange,
    handleDateSelect, // 📅 Date selection handler
  } = useWeatherContext();

  const { activeTab, setActiveTab, missionControlMode, setMissionControlMode } =
    useAppState();

  const handleLocationSelect = async (
    lat: number,
    lon: number,
    name: string
  ) => {
    await baseHandleLocationSelect(lat, lon, name);

    // Switch to weather tab if we're on the map tab
    if (activeTab === 'map') {
      setActiveTab('weather');
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (missionControlMode) {
    return (
      <div className="min-h-screen">
        <NASAMissionControl
          weatherData={weather?.current}
          location={currentLocationName}
          coordinates={currentLocationCoords || undefined}
          selectedDate={selectedDate}
          nasaData={nasaData}
          onLocationChange={() => {
            setMissionControlMode(false);
            setActiveTab('weather');
          }}
        />
        <div className="fixed top-4 right-4 z-50">
          <button
            onClick={() => setMissionControlMode(false)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-lg nasa-glow"
          >
            Exit Mission Control
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <WeatherHeader
          onMissionControlToggle={() => setMissionControlMode(true)}
          weatherAnomalies={weatherAnomalies}
        />

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <WeatherTabs activeTab={activeTab} onTabChange={setActiveTab} />

          <TabsContent value="weather" className="space-y-6">
            <WeatherTab
              weather={weather}
              enhancedRiskAssessment={enhancedRiskAssessment}
              selectedActivity={selectedActivity}
              currentLocationName={currentLocationName}
              preferences={preferences}
              historicalData={historicalData}
              nasaData={nasaData}
              nasaSelectedDate={nasaSelectedDate}
              selectedDate={selectedDate}
              onDateSelect={handleDateSelect}
              loading={loading}
              error={error}
              onLocationSelect={handleLocationSelect}
            />
          </TabsContent>

          <TabsContent value="forecast" className="space-y-6">
            <ForecastTab />
          </TabsContent>

          <TabsContent value="map" className="space-y-6">
            <MapTab
              currentLocationCoords={currentLocationCoords}
              currentLocationName={currentLocationName}
              selectedActivity={selectedActivity}
              preferences={preferences}
              onLocationSelect={handleLocationSelect}
            />
          </TabsContent>

          <TabsContent value="activity">
            <ActivityTab
              selectedActivity={selectedActivity}
              onActivityChange={handleActivityChange}
            />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesTab
              preferences={preferences}
              onPreferencesChange={handlePreferencesChange}
            />
          </TabsContent>

          <TabsContent value="data">
            <DataTab onLocationSelect={handleLocationSelect} />
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <AnalysisTab
              weather={weather}
              historicalData={historicalData}
              weatherAnomalies={weatherAnomalies}
              currentLocationName={currentLocationName}
            />
          </TabsContent>

          <TabsContent value="historical" className="space-y-6">
            <HistoricalTab
              currentLocationCoords={currentLocationCoords}
              currentLocationName={currentLocationName}
            />
          </TabsContent>

          <TabsContent value="ai-assistant" className="space-y-6">
            <AIAssistantTab
              weather={weather}
              currentLocationName={currentLocationName}
              selectedActivity={selectedActivity}
              preferences={preferences}
              enhancedRiskAssessment={enhancedRiskAssessment}
              historicalData={historicalData}
              loading={loading}
              error={error}
              onLocationSelect={handleLocationSelect}
            />
          </TabsContent>
        </Tabs>

        {/* 🌍 Premium Footer */}
        <footer className="mt-20 pt-8 pb-6 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500 dark:text-slate-400">
          <div className="flex flex-col gap-1 text-center sm:text-left">
            <p>
              Built for the{' '}
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                NASA Space Apps Challenge 2025
              </span>
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              An open source and open science platform designed to protect and empower communities through climate intelligence
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span>Crafted by</span>
            <a
              href="https://www.softsasi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-800 dark:text-slate-200 transition-all font-semibold hover:scale-105 active:scale-95 duration-100 uppercase tracking-wider font-mono cursor-pointer"
            >
              Softsasi
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}