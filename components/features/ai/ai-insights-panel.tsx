'use client';

import { AIInsightsHeader } from './components/ai-insights-header';
import { AIInsightsLoading } from './components/ai-insights-loading';
import { AIRecommendations } from './components/ai-recommendations';
import { AlternativeSuggestions } from './components/alternative-suggestions';
import { PatternAnalysis } from './components/pattern-analysis';
import { RiskAssessment } from './components/risk-assessment';
import { WeatherAnomalies } from './components/weather-anomalies';
import { WeatherIntelligenceSummary } from './components/weather-intelligence-summary';
import type { AnomalyAnalysis, WeatherInsights } from './hooks/use-ai-insights';

interface AIInsightsPanelProps {
  insights: WeatherInsights | null;
  anomalies: AnomalyAnalysis | null;
  isLoading: boolean;
  error?: string | null;
  lastUpdated?: Date | null;
  onRefresh?: () => void;
}

function getSeverityColor(severity: string) {
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
}

export default function AIInsightsPanel({
  insights,
  anomalies,
  isLoading,
  error,
  lastUpdated,
  onRefresh,
}: AIInsightsPanelProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <AIInsightsHeader
        isLoading={isLoading}
        onRefresh={onRefresh || (() => {})}
      />

      {isLoading && <AIInsightsLoading />}

      {error && (
        <div className="text-red-500 p-4">
          <p>Error loading insights: {error}</p>
        </div>
      )}

      {insights && (
        <>
          <WeatherIntelligenceSummary
            insights={insights}
            lastUpdated={lastUpdated ?? null}
          />
          <RiskAssessment
            insights={insights}
            getSeverityColor={getSeverityColor}
          />
          <AIRecommendations insights={insights} />
          <AlternativeSuggestions insights={insights} />
          <PatternAnalysis insights={insights} />
        </>
      )}

      {anomalies && (
        <WeatherAnomalies
          anomalies={anomalies}
          getSeverityColor={getSeverityColor}
        />
      )}
    </div>
  );
}