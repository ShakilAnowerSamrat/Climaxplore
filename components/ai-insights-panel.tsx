"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, TrendingUp, AlertTriangle, Lightbulb, RefreshCw, Zap } from "lucide-react"
import { generateWeatherInsights, analyzeWeatherAnomalies } from "@/lib/gemini-api"

interface AIInsightsPanelProps {
  weatherData: any
  userPreferences: any
  activity?: string
  location: string
  historicalData?: any[]
}

interface WeatherInsights {
  summary: string
  riskFactors: Array<{
    factor: string
    severity: "High" | "Medium" | "Low"
    explanation: string
  }>
  recommendations: string[]
  alternatives: string[]
  patterns: string
}

interface AnomalyAnalysis {
  anomalies: Array<{
    type: string
    severity: string
    description: string
  }>
  explanation: string
  implications: string
  confidence: string
}

export default function AIInsightsPanel({
  weatherData,
  userPreferences,
  activity,
  location,
  historicalData = [],
}: AIInsightsPanelProps) {
  const [insights, setInsights] = useState<WeatherInsights | null>(null)
  const [anomalies, setAnomalies] = useState<AnomalyAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const generateInsights = async () => {
    if (!weatherData) return

    setIsLoading(true)
    try {
      const [insightsResult, anomaliesResult] = await Promise.all([
        generateWeatherInsights({
          weatherData,
          userPreferences,
          activity,
          location,
        }),
        historicalData.length > 0 ? analyzeWeatherAnomalies(weatherData, historicalData) : Promise.resolve(null),
      ])

      setInsights(insightsResult)
      setAnomalies(anomaliesResult)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to generate AI insights:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    generateInsights()
  }, [weatherData, userPreferences, activity, location])

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-600/50"
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-600/50"
      case "low":
        return "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-600/50"
      default:
        return "bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800/50 dark:text-slate-300 dark:border-slate-600/50"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-cyan-500" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">AI Weather Intelligence</h3>
          <Badge
            variant="outline"
            className="border-emerald-400 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
          >
            <Zap className="h-3 w-3 mr-1" />
            Powered by Gemini
          </Badge>
        </div>
        <Button
          onClick={generateInsights}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="border-slate-300 hover:border-cyan-400 bg-white dark:bg-slate-800 dark:border-slate-600 dark:hover:border-cyan-500/50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading && (
        <Card className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-700 dark:text-slate-300">ARIA is analyzing weather patterns...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {insights && (
        <>
          {/* Weather Summary */}
          <Card className="bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 shadow-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20">
              <CardTitle className="text-cyan-700 dark:text-cyan-400 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Weather Intelligence Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed text-base">{insights.summary}</p>
              {lastUpdated && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/50">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Risk Factors */}
          {insights.riskFactors.length > 0 && (
            <Card className="bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 shadow-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20">
                <CardTitle className="text-orange-700 dark:text-orange-400 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {insights.riskFactors.map((risk, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50"
                    >
                      <Badge className={`${getSeverityColor(risk.severity)} font-medium px-3 py-1`}>
                        {risk.severity}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-2">{risk.factor}</h4>
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{risk.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {insights.recommendations.length > 0 && (
            <Card className="bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 shadow-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20">
                <CardTitle className="text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {insights.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30"
                    >
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-800 dark:text-slate-200 leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Alternative Activities */}
          {insights.alternatives.length > 0 && (
            <Card className="bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 shadow-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <CardTitle className="text-blue-700 dark:text-blue-400">Alternative Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {insights.alternatives.map((alt, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-800 dark:text-slate-200 leading-relaxed">{alt}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Weather Patterns */}
          {insights.patterns && (
            <Card className="bg-white dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 shadow-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
                <CardTitle className="text-purple-700 dark:text-purple-400">Pattern Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{insights.patterns}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Anomaly Detection */}
      {anomalies && anomalies.anomalies.length > 0 && (
        <Card className="bg-white dark:bg-slate-800/30 border-red-200 dark:border-red-500/30 shadow-sm">
          <CardHeader className="pb-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20">
            <CardTitle className="text-red-700 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Weather Anomalies Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <Alert className="mb-4 border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                Unusual weather patterns detected. Review recommendations carefully.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              {anomalies.anomalies.map((anomaly, index) => (
                <div
                  key={index}
                  className="border border-slate-200 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={getSeverityColor(anomaly.severity)}>{anomaly.type}</Badge>
                    <span className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                      Confidence: {anomalies.confidence}
                    </span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-200 leading-relaxed">{anomaly.description}</p>
                </div>
              ))}
            </div>

            {anomalies.implications && (
              <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-700/50 rounded-lg border border-slate-200 dark:border-slate-600">
                <h4 className="font-semibold text-slate-900 dark:text-slate-200 mb-2">Implications:</h4>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{anomalies.implications}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
