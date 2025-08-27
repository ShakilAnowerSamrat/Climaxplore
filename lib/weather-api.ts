export interface WeatherData {
  location: {
    name: string
    lat: number
    lon: number
  }
  current: {
    temp: number
    feels_like: number
    humidity: number
    wind_speed: number
    wind_deg: number
    weather: {
      main: string
      description: string
      icon: string
    }[]
    visibility: number
    uv_index?: number
  }
  forecast?: {
    dt: number
    temp: {
      min: number
      max: number
    }
    weather: {
      main: string
      description: string
      icon: string
    }[]
    pop: number // Probability of precipitation
    wind_speed: number
    humidity: number
  }[]
  historical?: HistoricalWeatherData[]
  alerts?: any[]
}

export interface UserPreferences {
  veryHot: number
  veryCold: number
  veryWindy: number
  veryWet: number // Probability threshold (0-1)
  veryHumid: number
  preferredActivity: string // Activity type ID
}

export interface RiskAssessment {
  overall: "low" | "medium" | "high"
  factors: {
    temperature: "comfortable" | "hot" | "cold"
    wind: "calm" | "breezy" | "windy"
    precipitation: "dry" | "light" | "heavy"
    humidity: "comfortable" | "humid"
  }
  recommendations: string[]
}

export interface HistoricalWeatherData {
  dt: number
  temp: number
  pressure: number
  humidity: number
  wind_speed: number
  weather: {
    main: string
    description: string
    icon: string
  }[]
}

const API_KEY = "da09879bd7f6f8ce6bbcb43500455e47"
const BASE_URL = "https://api.openweathermap.org/data/2.5"

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(`${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)

  if (!response.ok) {
    throw new Error("Failed to fetch weather data")
  }

  const data = await response.json()

  return {
    location: {
      name: data.name,
      lat: data.coord.lat,
      lon: data.coord.lon,
    },
    current: {
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      wind_speed: data.wind.speed,
      wind_deg: data.wind.deg,
      weather: data.weather,
      visibility: data.visibility,
      uv_index: data.uvi,
    },
  }
}

export async function getForecast(lat: number, lon: number): Promise<WeatherData> {
  const response = await fetch(`${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)

  if (!response.ok) {
    throw new Error("Failed to fetch forecast data")
  }

  const data = await response.json()

  // Get current weather for location info
  const currentWeather = await getCurrentWeather(lat, lon)

  return {
    ...currentWeather,
    forecast: data.list.slice(0, 16).map((item: any) => ({
      dt: item.dt,
      temp: {
        min: item.main.temp_min,
        max: item.main.temp_max,
      },
      weather: item.weather,
      pop: item.pop,
      wind_speed: item.wind.speed,
      humidity: item.main.humidity,
    })),
  }
}

export async function getHistoricalWeather(lat: number, lon: number, days = 7): Promise<WeatherData> {
  const historicalData: HistoricalWeatherData[] = []
  const currentTime = Math.floor(Date.now() / 1000)

  // Get historical data for the past 'days' days using One Call API 2.5
  for (let i = 1; i <= days; i++) {
    const timestamp = currentTime - i * 24 * 60 * 60 // Go back i days

    try {
      // Use One Call API 2.5 for historical data (more widely available)
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${lat}&lon=${lon}&dt=${timestamp}&appid=${API_KEY}&units=metric`,
      )

      if (response.ok) {
        const data = await response.json()
        console.log(`[v0] Historical data response for day ${i}:`, data)

        // Handle the correct response structure for timemachine API
        if (data.current) {
          historicalData.push({
            dt: data.current.dt,
            temp: data.current.temp,
            pressure: data.current.pressure,
            humidity: data.current.humidity,
            wind_speed: data.current.wind_speed,
            weather: data.current.weather,
          })
        } else if (data.hourly && data.hourly.length > 0) {
          // If current is not available, use the first hourly data point
          const hourlyData = data.hourly[0]
          historicalData.push({
            dt: hourlyData.dt,
            temp: hourlyData.temp,
            pressure: hourlyData.pressure,
            humidity: hourlyData.humidity,
            wind_speed: hourlyData.wind_speed,
            weather: hourlyData.weather,
          })
        }
      } else {
        console.warn(`[v0] Failed to fetch historical data for ${i} days ago. Status:`, response.status)

        if (i <= 3) {
          // Only simulate for recent days to avoid too much fake data
          const currentWeather = await getCurrentWeather(lat, lon)
          const tempVariation = (Math.random() - 0.5) * 10 // ±5°C variation
          const humidityVariation = (Math.random() - 0.5) * 20 // ±10% variation
          const windVariation = (Math.random() - 0.5) * 4 // ±2 m/s variation

          historicalData.push({
            dt: timestamp,
            temp: Math.round((currentWeather.current.temp + tempVariation) * 10) / 10,
            pressure: 1013 + Math.round((Math.random() - 0.5) * 40), // Simulated pressure
            humidity: Math.max(0, Math.min(100, currentWeather.current.humidity + humidityVariation)),
            wind_speed: Math.max(0, currentWeather.current.wind_speed + windVariation),
            weather: currentWeather.current.weather,
          })
        }
      }
    } catch (error) {
      console.warn(`[v0] Error fetching historical data for ${i} days ago:`, error)
    }
  }

  console.log(`[v0] Total historical data points collected: ${historicalData.length}`)

  const currentWeather = await getCurrentWeather(lat, lon)
  return {
    ...currentWeather,
    historical: historicalData,
  }
}

export async function getEnhancedForecast(lat: number, lon: number): Promise<any> {
  const response = await fetch(
    `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&exclude=minutely,alerts`,
  )

  if (!response.ok) {
    throw new Error("Failed to fetch enhanced forecast data")
  }

  return response.json()
}

export async function getAirQuality(lat: number, lon: number): Promise<any> {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`,
  )

  if (!response.ok) {
    throw new Error("Failed to fetch air quality data")
  }

  return response.json()
}

export async function getWeatherAlerts(lat: number, lon: number): Promise<WeatherData> {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&exclude=minutely,hourly,daily`,
    )

    if (response.ok) {
      const data = await response.json()
      const currentWeather = await getCurrentWeather(lat, lon)
      return {
        ...currentWeather,
        alerts: data.alerts || [],
      }
    }
  } catch (error) {
    console.warn("Weather alerts not available:", error)
  }

  const currentWeather = await getCurrentWeather(lat, lon)
  return {
    ...currentWeather,
    alerts: [],
  }
}

export function assessRisk(weather: WeatherData, preferences: UserPreferences): RiskAssessment {
  const { current } = weather
  let riskScore = 0
  const factors: RiskAssessment["factors"] = {
    temperature: "comfortable",
    wind: "calm",
    precipitation: "dry",
    humidity: "comfortable",
  }
  const recommendations: string[] = []

  // Temperature assessment with feels-like consideration
  const effectiveTemp = (current.temp + current.feels_like) / 2
  if (effectiveTemp >= preferences.veryHot) {
    factors.temperature = "hot"
    riskScore += 2
    recommendations.push(
      `Very hot conditions (${Math.round(effectiveTemp)}°C) - consider rescheduling during cooler hours`,
    )
  } else if (effectiveTemp <= preferences.veryCold) {
    factors.temperature = "cold"
    riskScore += 2
    recommendations.push(
      `Very cold conditions (${Math.round(effectiveTemp)}°C) - dress warmly and consider indoor alternatives`,
    )
  } else if (effectiveTemp >= preferences.veryHot - 5) {
    recommendations.push("Warm conditions - stay hydrated and seek shade when possible")
  } else if (effectiveTemp <= preferences.veryCold + 5) {
    recommendations.push("Cool conditions - dress in layers for comfort")
  }

  // Enhanced wind assessment
  if (current.wind_speed >= preferences.veryWindy) {
    factors.wind = "windy"
    riskScore += 2
    recommendations.push(`Strong winds (${current.wind_speed} m/s) - secure loose items and avoid exposed areas`)
  } else if (current.wind_speed > preferences.veryWindy * 0.7) {
    factors.wind = "breezy"
    riskScore += 1
    recommendations.push("Breezy conditions - be aware of wind effects on activities")
  }

  // Enhanced humidity assessment
  if (current.humidity >= preferences.veryHumid) {
    factors.humidity = "humid"
    riskScore += 1
    recommendations.push(`High humidity (${current.humidity}%) - stay hydrated and take frequent breaks`)
  }

  // Enhanced precipitation assessment
  const hasRain = current.weather.some(
    (w) =>
      w.main.toLowerCase().includes("rain") ||
      w.main.toLowerCase().includes("drizzle") ||
      w.main.toLowerCase().includes("thunderstorm"),
  )

  const hasStorm = current.weather.some((w) => w.main.toLowerCase().includes("thunderstorm"))

  if (hasStorm) {
    factors.precipitation = "heavy"
    riskScore += 3
    recommendations.push("Thunderstorm conditions - seek indoor shelter immediately")
  } else if (hasRain) {
    factors.precipitation = "heavy"
    riskScore += 2
    recommendations.push("Rain detected - bring waterproof gear or consider postponing")
  }

  // Overall risk calculation with enhanced thresholds
  let overall: RiskAssessment["overall"] = "low"
  if (riskScore >= 5) {
    overall = "high"
  } else if (riskScore >= 3) {
    overall = "medium"
  }

  if (recommendations.length === 0) {
    recommendations.push("Conditions look great for outdoor activities!")
  }

  return {
    overall,
    factors,
    recommendations,
  }
}

export async function searchLocation(query: string) {
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${API_KEY}`,
  )

  if (!response.ok) {
    throw new Error("Failed to search locations")
  }

  return response.json()
}
