"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Database, Download, Upload, Trash2, BarChart3, MapPin, Clock, Activity, Star, AlertCircle } from "lucide-react"
import { dataPersistence, type WeatherQuery, type FavoriteLocation } from "@/lib/data-persistence"

interface DataManagementProps {
  onLocationSelect?: (lat: number, lon: number, name: string) => void
}

export function DataManagement({ onLocationSelect }: DataManagementProps) {
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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "low":
        return "bg-primary text-primary-foreground"
      case "medium":
        return "bg-accent text-accent-foreground"
      case "high":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Manage your weather data, preferences, and usage history</CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history">Query History</TabsTrigger>
          <TabsTrigger value="favorites">Favorite Locations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Data Settings</TabsTrigger>
        </TabsList>

        {/* Query History */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Weather Queries
                </div>
                <Button variant="outline" size="sm" onClick={handleClearHistory}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear History
                </Button>
              </CardTitle>
              <CardDescription>Your recent weather risk assessments</CardDescription>
            </CardHeader>
            <CardContent>
              {weatherHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No weather queries yet. Start exploring weather conditions to build your history!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {weatherHistory.map((query) => (
                    <div key={query.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{query.location.name}</div>
                          <div className="text-sm text-muted-foreground">{formatDate(query.timestamp)}</div>
                        </div>
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            <Activity className="h-3 w-3" />
                            <span className="capitalize">{query.activity}</span>
                          </div>
                          <div className="text-muted-foreground">
                            {query.weather.temp}°C, {query.weather.conditions}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold">{query.score}/100</div>
                          <Badge className={getRiskColor(query.riskLevel)} variant="outline">
                            {query.riskLevel}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onLocationSelect?.(query.location.lat, query.location.lon, query.location.name)
                          }
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Favorite Locations */}
        <TabsContent value="favorites" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Favorite Locations
              </CardTitle>
              <CardDescription>Your most frequently used locations</CardDescription>
            </CardHeader>
            <CardContent>
              {favoriteLocations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No favorite locations yet. Locations you search frequently will appear here automatically!</p>
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {favoriteLocations.map((location) => (
                    <div key={location.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Used {location.useCount} times • Last: {formatDate(location.lastUsed)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onLocationSelect?.(location.lat, location.lon, location.name)}
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveFavorite(location.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Total Queries</div>
                </div>
                <div className="text-2xl font-bold">{usageStats.totalQueries || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Favorite Locations</div>
                </div>
                <div className="text-2xl font-bold">{usageStats.favoriteLocationsCount || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Most Used Activity</div>
                </div>
                <div className="text-lg font-bold capitalize">{usageStats.mostUsedActivity || "None"}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Avg Risk Score</div>
                </div>
                <div className="text-2xl font-bold">{Math.round(usageStats.averageRiskScore || 0)}/100</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Usage Overview</CardTitle>
              <CardDescription>Your weather app usage patterns</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Account Age:</span>
                <span>{usageStats.accountAge || 0} days</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Storage Usage:</span>
                <span>
                  {formatBytes(storageUsage.used || 0)} / {formatBytes(storageUsage.available || 0)}
                </span>
              </div>
              <Progress value={storageUsage.percentage || 0} className="w-full" />
              {storageUsage.percentage > 80 && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <span>Storage is getting full. Consider cleaning up old data.</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Settings */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Export & Import</CardTitle>
              <CardDescription>Backup and restore your weather app data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Data
                </Button>
                <Button variant="outline" onClick={() => document.getElementById("import-file")?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import Data
                </Button>
                <input id="import-file" type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </div>
              <p className="text-sm text-muted-foreground">
                Export your data to backup your preferences, history, and favorite locations. Import to restore from a
                previous backup.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Cleanup</CardTitle>
              <CardDescription>Manage your stored data and cache</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleCleanupData}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Cleanup Old Data
                </Button>
                <Button variant="outline" onClick={handleClearCache}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cache
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Cleanup removes data older than 30 days. Clear cache removes temporarily stored weather data to free up
                space.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
