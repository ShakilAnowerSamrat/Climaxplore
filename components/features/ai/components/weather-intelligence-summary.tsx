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
    <Card className="bg-white/60 dark:bg-[#0E0F12]/60 border border-slate-200/50 dark:border-slate-800/40 shadow-sm backdrop-blur-md rounded-xl">
      <CardHeader className="pb-3 border-b border-slate-200/10 dark:border-slate-800/40">
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-sm font-bold uppercase tracking-wider">
          <TrendingUp className="h-4.5 w-4.5 text-slate-650 dark:text-slate-350" />
          Weather Intelligence Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs sm:text-sm">
          {insights.summary}
        </p>

        {lastUpdated && (
          <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-4 pt-3 border-t border-slate-200/50 dark:border-slate-800/40 uppercase tracking-wider">
            Last updated: {lastUpdated.toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
}