'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { WeatherInsights } from '../hooks/use-ai-insights';

interface WeatherIntelligenceSummaryProps {
  insights: WeatherInsights;
  lastUpdated: Date | null;
}

export function WeatherIntelligenceSummary({
  insights,
  lastUpdated,
}: WeatherIntelligenceSummaryProps) {
  return (
    <Card
      className="
      bg-white/80
      dark:bg-slate-900/70
      border
      border-cyan-500/20
      dark:border-cyan-500/30
      shadow-md
      backdrop-blur-sm
    "
    >
      <CardHeader
        className="
        pb-3
        bg-gradient-to-r
        from-cyan-100/40
        to-blue-100/30
        dark:from-cyan-500/20
        dark:to-blue-500/20
        border-b
        border-cyan-200/40
        dark:border-cyan-500/20
      "
      >
        <CardTitle
          className="
          flex items-center gap-2
          text-cyan-700
          dark:text-cyan-300
          font-semibold
          text-base
        "
        >
          <TrendingUp className="h-5 w-5" />
          Weather Intelligence Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6">
        <p
          className="
          text-slate-700
          dark:text-slate-200
          leading-relaxed
          text-base
        "
        >
          {insights.summary}
        </p>

        {lastUpdated && (
          <p
            className="
            text-xs
            text-slate-500
            dark:text-slate-400
            mt-3 pt-3
            border-t
            border-slate-200/60
            dark:border-slate-700/50
          "
          >
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}