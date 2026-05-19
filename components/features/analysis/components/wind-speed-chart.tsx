"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface WindSpeedChartProps {
  historicalData: any[]
}

export function WindSpeedChart({ historicalData }: WindSpeedChartProps) {
  return (
    <Card className="mission-control-panel">
      <CardHeader>
        <CardTitle>Wind Speed History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 text-sm text-muted-foreground">Chart Data Points: {historicalData.length}</div>
        <div className="w-full h-[400px] border border-gray-300 dark:border-gray-600 rounded">
          {historicalData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={historicalData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="date"
                  stroke="#9CA3AF"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval={0}
                />
                <YAxis stroke="#9CA3AF" fontSize={12} />
                <Tooltip
                  labelFormatter={(label) => `Date: ${label}`}
                  formatter={(value: number) => [`${value.toFixed(1)} m/s`, "Wind Speed"]}
                  contentStyle={{
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    borderRadius: "6px",
                    color: "#F9FAFB",
                  }}
                />
                <Bar dataKey="wind_speed" fill="#06b6d4" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No wind speed data available
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}