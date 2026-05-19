export const getAirQualityStatus = (aqi: number) => {
  if (aqi <= 1) return { status: "Good", color: "bg-green-500", description: "Air quality is satisfactory" }
  if (aqi <= 2) return { status: "Fair", color: "bg-yellow-500", description: "Moderate air quality" }
  if (aqi <= 3) return { status: "Moderate", color: "bg-orange-500", description: "Unhealthy for sensitive groups" }
  if (aqi <= 4) return { status: "Poor", color: "bg-red-500", description: "Unhealthy air quality" }
  return { status: "Very Poor", color: "bg-purple-500", description: "Very unhealthy air quality" }
}

export const calculateTrends = (historicalData: any[]) => {
  if (!Array.isArray(historicalData) || historicalData.length < 2) return null

  const recent = historicalData.slice(-3)
  const older = historicalData.slice(0, 3)

  const recentAvgTemp = recent.reduce((sum, day) => sum + day.temp, 0) / recent.length
  const olderAvgTemp = older.reduce((sum, day) => sum + day.temp, 0) / older.length

  const recentAvgPressure = recent.reduce((sum, day) => sum + day.pressure, 0) / recent.length
  const olderAvgPressure = older.reduce((sum, day) => sum + day.pressure, 0) / older.length

  return {
    temperature: {
      trend: recentAvgTemp > olderAvgTemp ? "up" : "down",
      change: Math.abs(recentAvgTemp - olderAvgTemp).toFixed(1),
    },
    pressure: {
      trend: recentAvgPressure > olderAvgPressure ? "up" : "down",
      change: Math.abs(recentAvgPressure - olderAvgPressure).toFixed(1),
    },
  }
}

export const formatTooltipDate = (value: number) => new Date(value * 1000).toLocaleDateString()

export const formatTooltipValue = (value: number, name: string) => {
  if (name === "temp") return [`${value.toFixed(1)}°C`, "Temperature"]
  if (name === "humidity") return [`${value}%`, "Humidity"]
  if (name === "pressure") return [`${value.toFixed(1)} hPa`, "Pressure"]
  return [value, name]
}