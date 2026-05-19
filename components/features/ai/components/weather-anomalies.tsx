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
    <Card className="bg-slate-900/80 dark:bg-slate-800/50 border-red-500/50 dark:border-red-500/50 shadow-lg backdrop-blur-sm">
      <CardHeader className="pb-3 bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30">
        <CardTitle className="text-red-400 dark:text-red-300 flex items-center gap-2 text-base">
          <AlertTriangle className="h-5 w-5" />
          Weather Anomalies Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Alert className="mb-4 border-red-500/50 bg-red-500/10 dark:border-red-500/50 dark:bg-red-500/10">
          <AlertTriangle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-200 dark:text-red-200">
            Unusual weather patterns detected. Review recommendations carefully.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          {anomalies.anomalies.map((anomaly, index) => (
            <div
              key={index}
              className="border border-slate-700 dark:border-slate-600 rounded-lg p-4 bg-slate-800/50 dark:bg-slate-800/50"
            >
              <div className="flex items-center gap-3 mb-3">
                <Badge className={getSeverityColor(anomaly.severity)}>{anomaly.type}</Badge>
                <span className="text-xs text-slate-300 dark:text-slate-400 bg-slate-700/50 dark:bg-slate-700 px-2 py-1 rounded">
                  Confidence: {anomalies.confidence}
                </span>
              </div>
              <p className="text-slate-100 dark:text-slate-200 leading-relaxed">{anomaly.description}</p>
            </div>
          ))}
        </div>

        {anomalies.implications && (
          <div className="mt-4 p-4 bg-slate-800/50 dark:bg-slate-700/50 rounded-lg border border-slate-700 dark:border-slate-600">
            <h4 className="font-semibold text-slate-100 dark:text-slate-200 mb-2">Implications:</h4>
            <p className="text-slate-300 dark:text-slate-300 leading-relaxed">{anomalies.implications}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}