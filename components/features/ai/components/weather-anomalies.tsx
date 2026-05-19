"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import { AnomalyAnalysis } from "../hooks/use-ai-insights"

interface WeatherAnomaliesProps {
  anomalies: AnomalyAnalysis
  getSeverityColor: (severity: string) => string
}

export function WeatherAnomalies({ anomalies, getSeverityColor }: WeatherAnomaliesProps) {
  if (anomalies.anomalies.length === 0) return null

  return (
    <Card className="bg-white dark:bg-slate-900/80 border border-rose-200 dark:border-rose-900/40 shadow-sm backdrop-blur-sm">
      <CardHeader className="pb-3 bg-rose-50/50 dark:bg-rose-950/20 border-b border-rose-100 dark:border-rose-900/20">
        <CardTitle className="text-rose-800 dark:text-rose-400 flex items-center gap-2 text-base font-semibold">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-500" />
          Weather Anomalies Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Alert className="mb-4 border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20">
          <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          <AlertDescription className="text-rose-800 dark:text-rose-300 text-sm font-medium">
            Unusual weather patterns detected. Review recommendations carefully.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {anomalies.anomalies.map((anomaly, index) => (
            <div
              key={index}
              className="border border-slate-100 dark:border-slate-800/50 rounded-lg p-4 bg-slate-50/50 dark:bg-slate-800/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <Badge className={getSeverityColor(anomaly.severity)}>{anomaly.type}</Badge>
                <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                  Confidence: {anomalies.confidence}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{anomaly.description}</p>
            </div>
          ))}
        </div>

        {anomalies.implications && (
          <div className="mt-4 p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-lg border border-slate-100 dark:border-slate-800/50">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm mb-1">Implications:</h4>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">{anomalies.implications}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}