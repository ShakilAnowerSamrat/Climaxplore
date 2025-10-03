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
          <Brain className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">AI Weather Intelligence</h3>
          <Badge
            variant="outline"
            className="border-cyan-500/50 text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 dark:bg-cyan-500/20"
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
          className="border-slate-700 hover:border-cyan-500 bg-slate-800 hover:bg-slate-700 text-white dark:border-slate-600 dark:hover:border-cyan-400"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {isLoading && (
        <Card className="bg-slate-900/50 dark:bg-slate-800/50 border-slate-700 dark:border-slate-700 shadow-lg backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-200 dark:text-slate-300">ARIA is analyzing weather patterns...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {insights && (
        <>
          <Card className="bg-slate-900/80 dark:bg-slate-800/50 border-cyan-500/30 dark:border-cyan-500/30 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-3 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-b border-cyan-500/20">
              <CardTitle className="text-cyan-400 dark:text-cyan-300 flex items-center gap-2 text-base">
                <TrendingUp className="h-5 w-5" />
                Weather Intelligence Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-slate-100 dark:text-slate-200 leading-relaxed text-base">{insights.summary}</p>
              {lastUpdated && (
                <p className="text-xs text-slate-400 dark:text-slate-400 mt-3 pt-3 border-t border-slate-700/50 dark:border-slate-700/50">
                  Last updated: {lastUpdated.toLocaleString()}
                </p>
              )}
            </CardContent>
          </Card>

          {insights.riskFactors.length > 0 && (
            <Card className="bg-slate-900/80 dark:bg-slate-800/50 border-orange-500/30 dark:border-orange-500/30 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 border-b border-orange-500/20">
                <CardTitle className="text-orange-400 dark:text-orange-300 flex items-center gap-2 text-base">
                  <AlertTriangle className="h-5 w-5" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {insights.riskFactors.map((risk, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 dark:bg-slate-800/50 border border-slate-700/50 dark:border-slate-700/50"
                    >
                      <Badge className={`${getSeverityColor(risk.severity)} font-medium px-3 py-1`}>
                        {risk.severity}
                      </Badge>
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-100 dark:text-slate-200 mb-2">{risk.factor}</h4>
                        <p className="text-slate-300 dark:text-slate-300 leading-relaxed">{risk.explanation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {insights.recommendations.length > 0 && (
            <Card className="bg-slate-900/80 dark:bg-slate-800/50 border-emerald-500/30 dark:border-emerald-500/30 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-b border-emerald-500/20">
                <CardTitle className="text-emerald-400 dark:text-emerald-300 flex items-center gap-2 text-base">
                  <Lightbulb className="h-5 w-5" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {insights.recommendations.map((rec, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-500/30 dark:border-emerald-500/30"
                    >
                      <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-100 dark:text-slate-200 leading-relaxed">{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {insights.alternatives.length > 0 && (
            <Card className="bg-slate-900/80 dark:bg-slate-800/50 border-blue-500/30 dark:border-blue-500/30 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-b border-blue-500/30">
                <CardTitle className="text-blue-400 dark:text-blue-300 text-base">Alternative Suggestions</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ul className="space-y-3">
                  {insights.alternatives.map((alt, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 dark:bg-blue-500/10 border border-blue-500/30 dark:border-blue-500/30"
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      <span className="text-slate-100 dark:text-slate-200 leading-relaxed">{alt}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {insights.patterns && (
            <Card className="bg-slate-900/80 dark:bg-slate-800/50 border-purple-500/30 dark:border-purple-500/30 shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-purple-500/30">
                <CardTitle className="text-purple-400 dark:text-purple-300 text-base">Pattern Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-slate-100 dark:text-slate-200 leading-relaxed">{insights.patterns}</p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {anomalies && anomalies.anomalies.length > 0 && (
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
      )}
    </div>
  )
}
