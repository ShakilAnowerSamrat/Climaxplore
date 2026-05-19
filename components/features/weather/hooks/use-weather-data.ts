import { useState, useEffect } from "react"
import type { WeatherData } from "@/lib/weather-api"
import { getForecast, getMonthlyPrediction } from "@/lib/weather-api"

export interface UseWeatherDataProps {
  weather: WeatherData
}

export function useWeatherData({ weather }: UseWeatherDataProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [futureWeather, setFutureWeather] = useState<WeatherData | null>(null)
  const [isLoadingFuture, setIsLoadingFuture] = useState(false)
  const [activeTab, setActiveTab] = useState<"current" | "future">("current")
  const [selectedMonth, setSelectedMonth] = useState<string>("current")
  const [monthlyPrediction, setMonthlyPrediction] = useState<any>(null)
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false)

  useEffect(() => {
    const loadFutureWeather = async () => {
      if (selectedMonth !== "current") {
        setFutureWeather(null)
        return
      }

      if (selectedDate.toDateString() === new Date().toDateString()) {
        setFutureWeather(null)
        return
      }

      setIsLoadingFuture(true)
      try {
        const forecast = await getForecast(weather.location.lat, weather.location.lon)
        setFutureWeather(forecast)
      } catch (error) {
        console.error("Failed to load future weather:", error)
      } finally {
        setIsLoadingFuture(false)
      }
    }

    loadFutureWeather()
  }, [selectedDate, weather.location, selectedMonth])

  useEffect(() => {
    const loadMonthlyPrediction = async () => {
      if (selectedMonth === "current") {
        setMonthlyPrediction(null)
        return
      }

      setIsLoadingMonthly(true)
      try {
        const monthOffset = Number.parseInt(selectedMonth.replace("month", ""))
        const prediction = await getMonthlyPrediction(weather.location.lat, weather.location.lon, monthOffset)
        setMonthlyPrediction(prediction)
      } catch (error) {
        console.error("Failed to load monthly prediction:", error)
      } finally {
        setIsLoadingMonthly(false)
      }
    }

    loadMonthlyPrediction()
  }, [selectedMonth, weather.location])

  return {
    selectedDate,
    setSelectedDate,
    futureWeather,
    isLoadingFuture,
    activeTab,
    setActiveTab,
    selectedMonth,
    setSelectedMonth,
    monthlyPrediction,
    isLoadingMonthly,
  }
}