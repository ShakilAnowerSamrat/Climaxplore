'use client';

import { dataPersistence } from '@/lib/data-persistence';
import {
  ACTIVITY_TYPES,
  assessActivityRisk,
  type ActivityType,
  type EnhancedRiskAssessment,
} from '@/lib/risk-assessment';
import {
  assessRisk,
  getCurrentWeather,
  getForecast,
  getHistoricalWeather,
  type RiskAssessment,
  type UserPreferences,
  type WeatherData,
} from '@/lib/weather-api';
import type {
  NASADashboardResponse,
  NASAForecastResponse,
  NASASelectedDateResponse,
} from '@/types/nasa-api.types';
import { useEffect, useRef, useState } from 'react';

const defaultPreferences: UserPreferences = {
  veryHot: 30,
  veryCold: 5,
  veryWindy: 20,
  veryWet: 0.7,
  veryHumid: 80,
  preferredActivity: 'general',
};

export function useWeatherData() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(
    null
  );
  const [enhancedRiskAssessment, setEnhancedRiskAssessment] =
    useState<EnhancedRiskAssessment | null>(null);
  const [preferences, setPreferences] =
    useState<UserPreferences>(defaultPreferences);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(
    ACTIVITY_TYPES[0]
  );
  const [currentLocationName, setCurrentLocationName] = useState('');
  const [currentLocationCoords, setCurrentLocationCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [weatherAnomalies, setWeatherAnomalies] = useState<any[]>([]);
  const [nasaData, setNasaData] = useState<NASADashboardResponse | null>(null); // 🛰️ NASA dashboard data
  const [nasaSelectedDate, setNasaSelectedDate] =
    useState<NASASelectedDateResponse | null>(null); // 🛰️ NASA hourly data for selected date
  const [nasaForecast, setNasaForecast] = useState<NASAForecastResponse | null>(
    null
  ); // 🛰️ NASA 7-day forecast
  const [selectedDate, setSelectedDate] = useState<Date>(new Date()); // 📅 User-selected date
  const [isClient, setIsClient] = useState(false);

  // 🔧 Refs to hold latest state values (avoids stale closures)
  const weatherRef = useRef<WeatherData | null>(null);
  const coordsRef = useRef<{ lat: number; lon: number } | null>(null);

  //Loading states for NASA APIs
  const [isLoadingNASAHistory, setIsLoadingNASAHistory] = useState(false);
  const [isLoadingNASAForecast, setIsLoadingNASAForecast] = useState(false);
  const [nasaHistoryError, setNasaHistoryError] = useState<Error | null>(null);
  const [nasaForecastError, setNasaForecastError] = useState<Error | null>(
    null
  );

  // 🔧 Keep refs in sync with state
  useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  useEffect(() => {
    coordsRef.current = currentLocationCoords;
  }, [currentLocationCoords]);

  useEffect(() => {
    setIsClient(true);

    const profile = dataPersistence.getUserProfile();
    if (profile.preferences) {
      setPreferences(profile.preferences);
      const activity =
        ACTIVITY_TYPES.find(
          (a) => a.id === profile.preferences.preferredActivity
        ) || ACTIVITY_TYPES[0];
      setSelectedActivity(activity);
    }
  }, []);

  const detectWeatherAnomalies = (current: any, historical: any[]) => {
    const anomalies = [];

    if (historical.length > 0) {
      const avgTemp =
        historical.reduce((sum, day) => sum + day.temp, 0) / historical.length;
      const tempDiff = Math.abs(current.current.temp - avgTemp);

      if (tempDiff > 10) {
        anomalies.push({
          type: 'temperature',
          severity: tempDiff > 15 ? 'high' : 'moderate',
          message: `Temperature is ${tempDiff.toFixed(1)}°C ${
            current.current.temp > avgTemp ? 'above' : 'below'
          } historical average`,
        });
      }

      const avgPressure =
        historical.reduce((sum, day) => sum + day.pressure, 0) /
        historical.length;
      const pressureDiff = Math.abs(current.current.pressure - avgPressure);

      if (pressureDiff > 20) {
        anomalies.push({
          type: 'pressure',
          severity: pressureDiff > 30 ? 'high' : 'moderate',
          message: `Atmospheric pressure is ${pressureDiff.toFixed(1)} hPa ${
            current.current.pressure > avgPressure ? 'above' : 'below'
          } normal`,
        });
      }
    }

    return anomalies;
  };

  // 🛰️ Fetch NASA selected date and forecast data
  const fetchNasaDataForDate = async (lat: number, lon: number, date: Date) => {
    try {
      const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
      const month = date.getMonth() + 1;
      const day = date.getDate();

      console.log(`[NASA] 📅 Fetching data for selected date: ${dateStr}`);

      // ⚠️ IMPORTANT: Different APIs serve different purposes:
      // 1. DASHBOARD API: Historical pattern analysis (month/day across years)
      //    - Works for ANY date (past, today, future)
      //    - Calculates probabilities: "40% chance of rain based on 10 years"
      //    - This is the CORE of "Will It Rain On My Parade?" challenge
      //
      // 2. SELECTED-DATE API: Hourly breakdown for specific date
      //    - Only works for HISTORICAL dates (actual recorded data)
      //    - Provides hourly temperature/precipitation details
      //    - Cannot predict future (no data exists yet)
      //
      // 3. FORECAST API: Multi-day forecast
      //    - Works for TODAY and FUTURE dates
      //    - Provides 7-day ahead forecast
      //    - Not useful for historical dates

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDateMidnight = new Date(date);
      selectedDateMidnight.setHours(0, 0, 0, 0);

      const isHistoricalDate = selectedDateMidnight < today;
      const isTodayOrFuture = selectedDateMidnight >= today;

      console.log(`[NASA] 🔍 Date context:`, {
        selectedDate: dateStr,
        today: today.toISOString().split('T')[0],
        isHistorical: isHistoricalDate,
        isTodayOrFuture: isTodayOrFuture,
      });

      // Build conditional fetch promises
      const fetchPromises: Promise<Response>[] = [];

      // 1️⃣ Selected-date API: Only for historical dates (has hourly data)
      if (isHistoricalDate) {
        console.log(`[NASA] ✅ Fetching hourly data (historical date)`);
        fetchPromises.push(
          fetch(
            `/api/weather/nasa/selected-date?lat=${lat}&lon=${lon}&date=${dateStr}`
          )
        );
      } else {
        console.log(
          `[NASA] ⏭️ Skipping hourly data (today/future - no recorded data yet)`
        );
        fetchPromises.push(
          Promise.resolve(new Response(null, { status: 204 }))
        );
      }

      // 2️⃣ Forecast API: Only for today/future dates
      if (isTodayOrFuture) {
        console.log(`[NASA] ✅ Fetching 7-day forecast (today/future)`);
        fetchPromises.push(
          fetch(
            `/api/weather/nasa/forecast?lat=${lat}&lon=${lon}&start_date=${dateStr}&days=7`
          )
        );
      } else {
        console.log(
          `[NASA] ⏭️ Skipping forecast (historical date - not applicable)`
        );
        fetchPromises.push(
          Promise.resolve(new Response(null, { status: 204 }))
        );
      }

      // 3️⃣ Dashboard API: ALWAYS fetch (works for any date!)
      // This is the CORE functionality: historical pattern analysis
      console.log(
        `[NASA] ✅ Fetching probability analysis (historical patterns for ${month}/${day})`
      );
      fetchPromises.push(
        fetch(
          `/api/weather/dashboard?lat=${lat}&lon=${lon}&month=${month}&day=${day}&years=10`
        )
      );

      const [selectedDateResponse, forecastResponse, dashboardResponse] =
        await Promise.all(fetchPromises);

      // Process responses with proper error handling
      setIsLoadingNASAHistory(true);
      setIsLoadingNASAForecast(true);

      // Only process selected-date response if we actually fetched it (historical date)
      if (isHistoricalDate && selectedDateResponse.ok) {
        const response = await selectedDateResponse.json();

        console.log('[NASA] 📦 Selected date RAW response:', response);

        // ✅ Extract the actual data from the wrapper
        const extractedData = response.data || response;

        console.log('[NASA] 📊 Extracted data:', {
          hasTemperature: !!extractedData.temperature,
          hasStatistics: !!extractedData.temperature?.statistics,
          avgTemp: extractedData.temperature?.statistics?.avg_celsius,
          fullData: extractedData,
        });

        // Validate extracted data before setting state
        if (extractedData.temperature?.statistics?.avg_celsius) {
          setNasaSelectedDate(extractedData);
          setNasaHistoryError(null);
          console.log('[NASA] ✅ Selected date data set successfully');
        } else {
          console.warn(
            '[NASA] ⚠️ Selected date data invalid - no temperature statistics'
          );
          setNasaSelectedDate(null);
          setNasaHistoryError(new Error('Invalid temperature data structure'));
        }
      } else if (isHistoricalDate) {
        // Only log error if we actually tried to fetch (historical date)
        const errorText = await selectedDateResponse.text();
        console.error(
          '[NASA] ❌ Selected date API error:',
          selectedDateResponse.status,
          errorText
        );
        setNasaSelectedDate(null);
        setNasaHistoryError(
          new Error(`API error: ${selectedDateResponse.status}`)
        );
      }
      // else: Not historical, already handled above (set to null with appropriate error)

      setIsLoadingNASAHistory(false);

      // 🔮 FORECAST API: Only process if we fetched it (today/future dates)
      if (isTodayOrFuture) {
        if (forecastResponse.ok) {
          const response = await forecastResponse.json();

          console.log('[NASA] 📦 Forecast RAW response:', response);

          // ✅ Extract the actual data from the wrapper { success, data, metadata }
          const extractedData = response.data || response;

          console.log('[NASA] 📊 Forecast extracted:', {
            hasForecast: !!extractedData.forecast,
            forecastLength: extractedData.forecast?.length,
            firstDay: extractedData.forecast?.[0],
          });

          // Validate forecast array
          if (
            Array.isArray(extractedData.forecast) &&
            extractedData.forecast.length > 0
          ) {
            setNasaForecast(extractedData);
            setNasaForecastError(null);
            console.log(
              '[NASA] ✅ Forecast data fetched:',
              extractedData.forecast.length,
              'days'
            );
          } else {
            console.warn('[NASA] ⚠️ Forecast data invalid - no forecast array');
            setNasaForecast(null);
            setNasaForecastError(new Error('Invalid forecast data structure'));
          }
        } else {
          const errorText = await forecastResponse.text();
          console.error(
            '[NASA] ❌ Forecast API error:',
            forecastResponse.status,
            errorText
          );
          setNasaForecast(null);
          setNasaForecastError(
            new Error(`API error: ${forecastResponse.status}`)
          );
        }
      } else {
        // Not today/future - skip forecast processing
        console.log(
          '[NASA] ℹ️ Skipping forecast processing (not applicable for historical dates)'
        );
        setNasaForecast(null);
        setNasaForecastError(null);
      }

      setIsLoadingNASAForecast(false);

      // 🎯 DASHBOARD API: ALWAYS process (works for ANY date - historical pattern analysis)
      if (dashboardResponse.ok) {
        const response = await dashboardResponse.json();
        // ✅ Extract the actual data from the wrapper
        setNasaData(response.data || response);
        console.log('[NASA] ✅ Dashboard data fetched');
      } else {
        console.log('[NASA] ⚠️ Dashboard API error:', dashboardResponse.status);
      }
    } catch (err) {
      console.log('[NASA] ⚠️ Fetch error (non-critical):', err);
      // Don't break the app if NASA APIs fail
    }
  };

  // 📅 Handle date selection - refetch NASA data AND historical weather for new date
  const handleDateSelect = (date: Date) => {
    console.log(
      '[DATE] User selected new date:',
      date.toISOString().split('T')[0]
    );
    console.log(
      '[DATE] 🔍 DEBUG - currentLocationCoords:',
      currentLocationCoords
    );
    console.log('[DATE] 🔍 DEBUG - weather:', weather?.location);

    setSelectedDate(date);

    // Use current state values directly
    const coords = currentLocationCoords || weather?.location;

    if (coords) {
      console.log('[DATE] ✅ Calling fetchNasaDataForDate with:', {
        lat: coords.lat,
        lon: coords.lon,
        date: date.toISOString().split('T')[0],
      });

      // 🔄 Fetch both NASA data AND historical weather for AI insights to regenerate
      Promise.all([
        fetchNasaDataForDate(coords.lat, coords.lon, date),
        // Fetch historical weather for the selected date to trigger AI refresh
        (async () => {
          try {
            const historical = await getHistoricalWeather(
              coords.lat,
              coords.lon,
              7
            );
            console.log('[DATE] 📊 Historical data fetched for AI insights:', {
              count: historical.length,
              date: date.toISOString().split('T')[0],
            });
            setHistoricalData(historical);

            // Detect anomalies for this date
            const anomalies = detectWeatherAnomalies(weather, historical);
            setWeatherAnomalies(anomalies);
          } catch (err) {
            console.log('[DATE] ⚠️ Historical data fetch error:', err);
          }
        })(),
      ]).catch((error) => {
        console.error('[DATE] ❌ Error fetching date data:', error);
      });
    } else {
      console.warn('[DATE] ⚠️ No location data available - cannot fetch data!');
      console.warn('[DATE] ⚠️ currentLocationCoords:', currentLocationCoords);
      console.warn('[DATE] ⚠️ weather:', weather);
    }
  }; // ⚡ NO useCallback - will capture latest state

  const handleLocationSelect = async (
    lat: number,
    lon: number,
    name: string
  ) => {
    console.log('[climaxplore] handleLocationSelect called with:', {
      lat,
      lon,
      name,
    });

    setLoading(true);
    setError('');
    setCurrentLocationName(name);
    const coords = { lat, lon };
    setCurrentLocationCoords(coords);
    coordsRef.current = coords; // ⚡ Update ref immediately!
    console.log('[LOCATION] 🎯 coordsRef updated to:', coordsRef.current);

    try {
      const locationKey = `${lat.toFixed(2)},${lon.toFixed(2)}`;
      let weatherData = dataPersistence.getCachedWeatherData(locationKey);
      let forecastData = dataPersistence.getCachedWeatherData(
        `${locationKey}-forecast`
      );

      // 🛰️ ALWAYS fetch NASA data for selected date (regardless of cache)
      // NASA data depends on BOTH location AND date, so we need to fetch it every time
      console.log('[climaxplore] 🛰️ Fetching NASA data for:', {
        lat,
        lon,
        date: selectedDate.toISOString().split('T')[0],
      });
      fetchNasaDataForDate(lat, lon, selectedDate);

      if (!weatherData || !forecastData) {
        console.log('[climaxplore] Fetching fresh weather data for location:', {
          lat,
          lon,
          name,
        });

        const [fetchedWeather, fetchedForecast] = await Promise.all([
          getCurrentWeather(lat, lon),
          getForecast(lat, lon),
        ]);

        weatherData = fetchedWeather;
        forecastData = fetchedForecast;

        dataPersistence.cacheWeatherData(locationKey, weatherData);
        dataPersistence.cacheWeatherData(
          `${locationKey}-forecast`,
          forecastData
        );
        console.log(
          '[climaxplore] Weather data fetched and cached successfully'
        );
      } else {
        console.log(
          '[climaxplore] Using cached weather data for location:',
          name
        );
      }

      try {
        const historical = await getHistoricalWeather(lat, lon, 7);
        setHistoricalData(historical);

        const anomalies = detectWeatherAnomalies(weatherData, historical);
        setWeatherAnomalies(anomalies);
      } catch (err) {
        console.log('Historical data not available:', err);
      }

      const combinedWeatherData = {
        ...weatherData,
        forecast: forecastData.forecast,
      };

      const risk = assessRisk(combinedWeatherData, preferences);
      const enhancedRisk = assessActivityRisk(
        combinedWeatherData,
        selectedActivity,
        preferences
      );

      console.log('[climaxplore] Updating weather state with:', {
        location: name,
        temp: weatherData.current.temp,
        riskLevel: enhancedRisk.overall,
      });

      setWeather(combinedWeatherData);
      weatherRef.current = combinedWeatherData; // ⚡ Update ref immediately!
      console.log(
        '[LOCATION] 🎯 weatherRef updated to:',
        weatherRef.current?.location
      );
      setRiskAssessment(risk);
      setEnhancedRiskAssessment(enhancedRisk);

      dataPersistence.addFavoriteLocation({ name, lat, lon });
      dataPersistence.addWeatherQuery({
        location: { name, lat, lon },
        activity: selectedActivity.id,
        riskLevel: enhancedRisk.overall,
        score: enhancedRisk.score,
        weather: {
          temp: weatherData.current.temp,
          humidity: weatherData.current.humidity,
          windSpeed: weatherData.current.wind_speed,
          conditions: weatherData.current.weather[0]?.description || 'Unknown',
        },
      });

      console.log('[climaxplore] Location selection completed successfully');
    } catch (err) {
      console.error('[climaxplore] Error in handleLocationSelect:', err);
      setError('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const handlePreferencesChange = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    const activity =
      ACTIVITY_TYPES.find((a) => a.id === newPreferences.preferredActivity) ||
      ACTIVITY_TYPES[0];
    setSelectedActivity(activity);

    const profile = dataPersistence.getUserProfile();
    profile.preferences = newPreferences;
    dataPersistence.saveUserProfile(profile);

    if (weather) {
      const risk = assessRisk(weather, newPreferences);
      const enhancedRisk = assessActivityRisk(
        weather,
        activity,
        newPreferences
      );
      setRiskAssessment(risk);
      setEnhancedRiskAssessment(enhancedRisk);
    }
  };

  const handleActivityChange = (activity: ActivityType) => {
    setSelectedActivity(activity);
    const newPrefs = { ...preferences, preferredActivity: activity.id };
    setPreferences(newPrefs);

    const profile = dataPersistence.getUserProfile();
    profile.preferences = newPrefs;
    dataPersistence.saveUserProfile(profile);

    if (weather) {
      const enhancedRisk = assessActivityRisk(weather, activity, newPrefs);
      setEnhancedRiskAssessment(enhancedRisk);
    }
  };

  return {
    weather,
    riskAssessment,
    enhancedRiskAssessment,
    preferences,
    selectedActivity,
    currentLocationName,
    currentLocationCoords,
    loading,
    error,
    historicalData,
    weatherAnomalies,
    nasaData, // 🛰️ NASA dashboard data
    nasaSelectedDate, // 🛰️ NASA hourly data for selected date
    nasaForecast, // 🛰️ NASA 7-day forecast
    selectedDate, // 📅 Currently selected date
    isClient,
    // Loading states for NASA APIs
    isLoadingNASAHistory,
    isLoadingNASAForecast,
    nasaHistoryError,
    nasaForecastError,
    handleLocationSelect,
    handlePreferencesChange,
    handleActivityChange,
    handleDateSelect, // 📅 Handler for date selection
  };
}