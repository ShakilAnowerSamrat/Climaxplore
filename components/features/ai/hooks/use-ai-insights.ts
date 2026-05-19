import { useCallback, useEffect, useRef, useState } from 'react';

export interface WeatherInsights {
  summary: string;
  riskFactors: Array<{
    factor: string;
    severity: 'High' | 'Medium' | 'Low';
    explanation: string;
  }>;
  recommendations: string[];
  alternatives: string[];
  patterns: string;
}

export interface AnomalyAnalysis {
  anomalies: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  explanation: string;
  implications: string;
  confidence: string;
}

export function useAIInsights(
  weatherData: any,
  userPreferences: any,
  activity?: string,
  location?: string,
  historicalData: any[] = [],
  selectedDate?: Date
) {
  const [insights, setInsights] = useState<WeatherInsights | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Helpers to build lightweight signatures (avoid heavy JSON stringifying)
  const makeHistoricalSig = (hist: any[]) => {
    if (!Array.isArray(hist) || hist.length === 0) return 'hist:0';
    const first = hist[0];
    const last = hist[hist.length - 1];
    const fKey = first?.date || first?.dt || first?.time || 'f';
    const lKey = last?.date || last?.dt || last?.time || 'l';
    return `hist:${hist.length}:${fKey}:${lKey}`;
  };
  const makePrefsSig = (prefs: any) => {
    if (!prefs) return 'prefs:none';
    const {
      veryHot,
      veryCold,
      veryWindy,
      veryWet,
      veryHumid,
      preferredActivity,
    } = prefs;
    return `prefs:${veryHot}:${veryCold}:${veryWindy}:${veryWet}:${veryHumid}:${preferredActivity}`;
  };

  // ✅ Track previous data to prevent duplicate calls while considering date/month
  const previousDataRef = useRef<{
    location: string;
    selectedDateKey: string;
    historicalSig: string;
    activity?: string;
    prefsSig: string;
  } | null>(null);

  // ✅ Debounce timer to prevent rapid-fire calls
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const generateInsights = useCallback(async () => {
    if (!weatherData || !location) return;

    // ✅ Check if data actually changed (prevent unnecessary calls)
    const selectedDateKey = selectedDate
      ? new Date(selectedDate).toISOString().slice(0, 10)
      : 'none';
    const historicalSig = makeHistoricalSig(historicalData);
    const prefsSig = makePrefsSig(userPreferences);
    const dataKey = JSON.stringify({
      location,
      selectedDateKey,
      historicalSig,
      activity,
      prefsSig,
    });
    if (
      previousDataRef.current &&
      JSON.stringify(previousDataRef.current) === dataKey
    ) {
      console.log('[useAIInsights] Data unchanged, skipping API call');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ✅ Validate responses before using them
      const [insightsRes, anomaliesRes] = await Promise.all([
        fetch('/api/ai/insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            weatherData,
            userPreferences,
            activity,
            location,
            selectedDate: selectedDateKey,
          }),
        }),
        historicalData.length > 0
          ? fetch('/api/ai/anomalies', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                weatherData,
                historicalData,
                selectedDate: selectedDateKey,
              }),
            })
          : Promise.resolve(null),
      ]);

      // ✅ Check response status
      if (!insightsRes.ok) {
        throw new Error(
          `Insights API error: ${insightsRes.status} ${insightsRes.statusText}`
        );
      }

      const insightsResult = await insightsRes.json();

      // ✅ Validate insights structure
      if (!insightsResult?.summary) {
        throw new Error('Invalid insights response: missing summary');
      }

      let anomaliesResult = null;
      if (anomaliesRes) {
        if (!anomaliesRes.ok) {
          console.warn(
            `Anomalies API warning: ${anomaliesRes.status} ${anomaliesRes.statusText}`
          );
        } else {
          anomaliesResult = await anomaliesRes.json();
        }
      }

      setInsights(insightsResult);
      setAnomalies(anomaliesResult);
      setLastUpdated(new Date());

      // ✅ Update previous data reference with our signature
      previousDataRef.current = {
        location,
        selectedDateKey,
        historicalSig,
        activity,
        prefsSig,
      };
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      setError(
        error instanceof Error ? error.message : 'Failed to generate insights'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    weatherData,
    userPreferences,
    activity,
    location,
    historicalData,
    selectedDate,
  ]);

  useEffect(() => {
    // ✅ Clear previous timer to prevent multiple calls
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // ✅ Debounce API call by 500ms
    debounceTimerRef.current = setTimeout(() => {
      generateInsights();
    }, 500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [
    weatherData,
    userPreferences,
    activity,
    location,
    historicalData,
    generateInsights,
    selectedDate,
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600/50';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600/50';
      case 'low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600/50';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600/50';
    }
  };

  return {
    insights,
    anomalies,
    isLoading,
    lastUpdated,
    error,
    generateInsights,
    getSeverityColor,
  };
}