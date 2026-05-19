"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface ExtendedForecastProps {
  enhancedForecast: any
}

export function ExtendedForecast({ enhancedForecast }: ExtendedForecastProps) {
  const formatTooltipValue = (value: number, name: string) => [
    name === "temp" ? `${value.toFixed(1)}°C` : `${value}%`,
    name === "temp" ? "Temperature" : "Humidity",
  ]

  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <CardTitle>EXTENDED FORECAST ANALYSIS</CardTitle>
      </CardHeader>
      <CardContent>
        {enhancedForecast?.hourly ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={enhancedForecast.hourly.slice(0, 24)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="dt"
                tickFormatter={(value) => new Date(value * 1000).toLocaleTimeString("en-US", { hour: "2-digit" })}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value * 1000).toLocaleString()}
                formatter={formatTooltipValue}
              />
              <Line type="monotone" dataKey="temp" stroke="#0ea5e9" strokeWidth={2} name="temp" />
              <Line type="monotone" dataKey="humidity" stroke="#10b981" strokeWidth={2} name="humidity" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-muted-foreground">Extended forecast data not available</p>
        )}
      </CardContent>
    </Card>
  )
}