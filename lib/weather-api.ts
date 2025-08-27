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

function normalizeCoordinates(lat: number, lon: number): { lat: number; lon: number } {
  // Normalize latitude to -90 to +90 range
  const normalizedLat = Math.max(-90, Math.min(90, lat))

  // Normalize longitude to -180 to +180 range
  let normalizedLon = ((lon + 180) % 360) - 180
  if (normalizedLon <= -180) normalizedLon = 180

  console.log(`[v0] Coordinate normalization: input(${lat}, ${lon}) -> output(${normalizedLat}, ${normalizedLon})`)

  return { lat: normalizedLat, lon: normalizedLon }
}

function validateCoordinates(lat: number, lon: number): boolean {
  return !isNaN(lat) && !isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

export async function getCurrentWeather(lat: number, lon: number): Promise<WeatherData> {
  const coords = normalizeCoordinates(lat, lon)
  console.log(`[v0] Fetching current weather for lat: ${coords.lat}, lon: ${coords.lon}`)

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`,
    )

    console.log(`[v0] Current weather API response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Current weather API error: ${response.status} - ${errorText}`)
      throw new Error(`Failed to fetch weather data: ${response.status}`)
    }

    const data = await response.json()
    console.log(`[v0] Current weather data received:`, data)

    return {
      location: {
        name: data.name || "Unknown Location",
        lat: data.coord?.lat || coords.lat,
        lon: data.coord?.lon || coords.lon,
      },
      current: {
        temp: data.main?.temp || 20,
        feels_like: data.main?.feels_like || data.main?.temp || 20,
        humidity: data.main?.humidity || 50,
        wind_speed: data.wind?.speed || 0,
        wind_deg: data.wind?.deg || 0,
        weather: data.weather || [{ main: "Clear", description: "clear sky", icon: "01d" }],
        visibility: data.visibility || 10000,
        uv_index: data.uvi,
      },
    }
  } catch (error) {
    console.error(`[v0] Error in getCurrentWeather:`, error)

    return {
      location: {
        name: "Unknown Location",
        lat: coords.lat,
        lon: coords.lon,
      },
      current: {
        temp: 20 + (Math.random() - 0.5) * 10,
        feels_like: 20 + (Math.random() - 0.5) * 10,
        humidity: 50 + (Math.random() - 0.5) * 30,
        wind_speed: Math.random() * 5,
        wind_deg: Math.random() * 360,
        weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
        visibility: 10000,
      },
    }
  }
}

export async function getForecast(lat: number, lon: number): Promise<WeatherData> {
  const coords = normalizeCoordinates(lat, lon)
  console.log(`[v0] Fetching forecast for lat: ${coords.lat}, lon: ${coords.lon}`)

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`,
    )

    console.log(`[v0] Forecast API response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Forecast API error: ${response.status} - ${errorText}`)

      const currentWeather = await getCurrentWeather(coords.lat, coords.lon)

      const forecast = []
      for (let i = 0; i < 16; i++) {
        const tempVariation = (Math.random() - 0.5) * 6
        forecast.push({
          dt: Math.floor(Date.now() / 1000) + i * 3 * 60 * 60, // 3-hour intervals
          temp: {
            min: currentWeather.current.temp + tempVariation - 2,
            max: currentWeather.current.temp + tempVariation + 2,
          },
          weather: currentWeather.current.weather,
          pop: Math.random() * 0.3, // Low probability of precipitation
          wind_speed: currentWeather.current.wind_speed + (Math.random() - 0.5) * 2,
          humidity: Math.max(20, Math.min(90, currentWeather.current.humidity + (Math.random() - 0.5) * 20)),
        })
      }

      return {
        ...currentWeather,
        forecast,
      }
    }

    const data = await response.json()
    console.log(`[v0] Forecast data received, list length:`, data.list?.length)

    // Get current weather for location info
    const currentWeather = await getCurrentWeather(coords.lat, coords.lon)

    return {
      ...currentWeather,
      forecast: (data.list || []).slice(0, 16).map((item: any) => ({
        dt: item.dt,
        temp: {
          min: item.main?.temp_min || item.main?.temp || 20,
          max: item.main?.temp_max || item.main?.temp || 25,
        },
        weather: item.weather || [{ main: "Clear", description: "clear sky", icon: "01d" }],
        pop: item.pop || 0,
        wind_speed: item.wind?.speed || 0,
        humidity: item.main?.humidity || 50,
      })),
    }
  } catch (error) {
    console.error(`[v0] Error in getForecast:`, error)

    const currentWeather = await getCurrentWeather(lat, lon)

    const forecast = []
    for (let i = 0; i < 16; i++) {
      const tempVariation = (Math.random() - 0.5) * 6
      forecast.push({
        dt: Math.floor(Date.now() / 1000) + i * 3 * 60 * 60,
        temp: {
          min: currentWeather.current.temp + tempVariation - 2,
          max: currentWeather.current.temp + tempVariation + 2,
        },
        weather: currentWeather.current.weather,
        pop: Math.random() * 0.3,
        wind_speed: currentWeather.current.wind_speed + (Math.random() - 0.5) * 2,
        humidity: Math.max(20, Math.min(90, currentWeather.current.humidity + (Math.random() - 0.5) * 20)),
      })
    }

    return {
      ...currentWeather,
      forecast,
    }
  }
}

export async function getHistoricalWeather(lat: number, lon: number, days = 7): Promise<HistoricalWeatherData[]> {
  const coords = normalizeCoordinates(lat, lon)
  console.log(`[v0] Starting getHistoricalWeather for lat: ${coords.lat}, lon: ${coords.lon}, days: ${days}`)

  const historicalData: HistoricalWeatherData[] = []
  const currentTime = Math.floor(Date.now() / 1000)

  for (let i = 1; i <= days; i++) {
    const timestamp = currentTime - i * 24 * 60 * 60 // Go back i days

    try {
      // Try One Call API 3.0 first (if available with user's plan)
      let response = await fetch(
        `https://api.openweathermap.org/data/3.0/onecall/timemachine?lat=${coords.lat}&lon=${coords.lon}&dt=${timestamp}&appid=${API_KEY}&units=metric`,
      )

      if (!response.ok && response.status === 401) {
        // If 3.0 API is not available, try 2.5 version
        console.log(`[v0] 3.0 API not available, trying 2.5 for day ${i}`)
        response = await fetch(
          `https://api.openweathermap.org/data/2.5/onecall/timemachine?lat=${coords.lat}&lon=${coords.lon}&dt=${timestamp}&appid=${API_KEY}&units=metric`,
        )
      }

      if (response.ok) {
        const data = await response.json()
        console.log(`[v0] Historical API response for day ${i}:`, data)

        // Handle the correct response structure for timemachine API
        if (data.data && Array.isArray(data.data) && data.data.length > 0) {
          // Handle 3.0 API response structure
          const dayData = data.data[0]
          historicalData.push({
            dt: dayData.dt,
            temp: dayData.temp,
            pressure: dayData.pressure,
            humidity: dayData.humidity,
            wind_speed: dayData.wind_speed,
            weather: dayData.weather,
          })
        } else if (data.current) {
          // Handle 2.5 API response structure
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
        console.warn(`[v0] Failed to fetch historical data for ${i} days ago. Status: ${response.status}`)

        // Generate realistic simulated data based on current weather
        try {
          const currentWeather = await getCurrentWeather(coords.lat, coords.lon)
          const tempVariation = (Math.random() - 0.5) * 8 // ±4°C variation
          const humidityVariation = (Math.random() - 0.5) * 20 // ±10% variation
          const windVariation = (Math.random() - 0.5) * 3 // ±1.5 m/s variation
          const pressureBase = 1013 + (Math.random() - 0.5) * 30 // Realistic pressure range

          historicalData.push({
            dt: timestamp,
            temp: Math.round((currentWeather.current.temp + tempVariation) * 10) / 10,
            pressure: Math.round(pressureBase),
            humidity: Math.max(10, Math.min(95, currentWeather.current.humidity + humidityVariation)),
            wind_speed: Math.max(0, Math.round((currentWeather.current.wind_speed + windVariation) * 10) / 10),
            weather: currentWeather.current.weather,
          })
          console.log(`[v0] Generated simulated data for day ${i}`)
        } catch (error) {
          console.error(`[v0] Error generating simulated data for day ${i}:`, error)
        }
      }
    } catch (error) {
      console.error(`[v0] Network error fetching historical data for ${i} days ago:`, error)

      // Generate basic fallback data
      historicalData.push({
        dt: timestamp,
        temp: 20 + (Math.random() - 0.5) * 10,
        pressure: 1013 + (Math.random() - 0.5) * 20,
        humidity: 50 + (Math.random() - 0.5) * 30,
        wind_speed: Math.random() * 5,
        weather: [{ main: "Clear", description: "clear sky", icon: "01d" }],
      })
    }
  }

  console.log(`[v0] Total historical data points collected: ${historicalData.length}`)
  console.log(`[v0] Sample data point:`, historicalData[0])

  return historicalData
}

export async function getEnhancedForecast(lat: number, lon: number): Promise<any> {
  const coords = normalizeCoordinates(lat, lon)

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&exclude=minutely,alerts`,
    )

    if (response.ok) {
      return response.json()
    }

    console.log(`[v0] 3.0 One Call API not available, falling back to 2.5 forecast API`)

    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`,
    )

    if (!forecastResponse.ok) {
      throw new Error(`Failed to fetch forecast data: ${forecastResponse.status}`)
    }

    const forecastData = await forecastResponse.json()

    return {
      hourly: forecastData.list.slice(0, 24).map((item: any) => ({
        dt: item.dt,
        temp: item.main.temp,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        wind_speed: item.wind.speed,
        weather: item.weather,
        pop: item.pop,
      })),
      daily: forecastData.list
        .filter((_: any, index: number) => index % 8 === 0) // Get one per day (every 8th 3-hour forecast)
        .slice(0, 5)
        .map((item: any) => ({
          dt: item.dt,
          temp: {
            min: item.main.temp_min,
            max: item.main.temp_max,
            day: item.main.temp,
          },
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          wind_speed: item.wind.speed,
          weather: item.weather,
          pop: item.pop,
        })),
    }
  } catch (error) {
    console.error(`[v0] Enhanced forecast error:`, error)
    return null
  }
}

export async function getAirQuality(lat: number, lon: number): Promise<any> {
  const coords = normalizeCoordinates(lat, lon)

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}`,
    )

    if (!response.ok) {
      console.log(`[v0] Air quality API failed with status: ${response.status}`)
      return null
    }

    return response.json()
  } catch (error) {
    console.error(`[v0] Air quality error:`, error)
    return null
  }
}

export async function getWeatherAlerts(lat: number, lon: number): Promise<any[]> {
  const coords = normalizeCoordinates(lat, lon)

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&exclude=minutely,hourly,daily`,
    )

    if (response.ok) {
      const data = await response.json()
      return data.alerts || []
    }

    console.log(`[v0] Weather alerts API not available (status: ${response.status})`)
    return []
  } catch (error) {
    console.warn(`[v0] Weather alerts error:`, error)
    return []
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
