"use client"

import { useState, useEffect } from "react"
import { dataPersistence, type WeatherQuery, type FavoriteLocation } from "@/lib/data-persistence"

export function useDataManagement() {
  const [weatherHistory, setWeatherHistory] = useState<WeatherQuery[]>([])
  const [favoriteLocations, setFavoriteLocations] = useState<FavoriteLocation[]>([])
  const [usageStats, setUsageStats] = useState<any>({})
  const [storageUsage, setStorageUsage] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setWeatherHistory(dataPersistence.getWeatherHistory(20))
    setFavoriteLocations(dataPersistence.getFavoriteLocations())
    setUsageStats(dataPersistence.getUsageStats())
    setStorageUsage(dataPersistence.getStorageUsage())
  }

  const handleExportData = () => {
    try {
      const data = dataPersistence.exportUserData()
      const blob = new Blob([data], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `weather-app-data-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Export failed:", error)
    }
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string
        const success = dataPersistence.importUserData(data)
        if (success) {
          loadData()
          alert("Data imported successfully!")
        } else {
          alert("Failed to import data. Please check the file format.")
        }
      } catch (error) {
        alert("Failed to import data. Invalid file format.")
      }
    }
    reader.readAsText(file)
  }

  const handleClearHistory = () => {
    if (confirm("Are you sure you want to clear all weather history? This action cannot be undone.")) {
      dataPersistence.clearWeatherHistory()
      loadData()
    }
  }

  const handleClearCache = () => {
    dataPersistence.clearWeatherCache()
    loadData()
  }

  const handleCleanupData = () => {
    dataPersistence.cleanupOldData()
    loadData()
  }

  const handleRemoveFavorite = (id: string) => {
    dataPersistence.removeFavoriteLocation(id)
    loadData()
  }

  return {
    weatherHistory,
    favoriteLocations,
    usageStats,
    storageUsage,
    loading,
    loadData,
    handleExportData,
    handleImportData,
    handleClearHistory,
    handleClearCache,
    handleCleanupData,
    handleRemoveFavorite,
  }
}