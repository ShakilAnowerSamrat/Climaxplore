"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Search, Clock, X } from "lucide-react"
import { searchLocation } from "@/lib/weather-api"

interface LocationResult {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

interface LocationSearchProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void
  loading: boolean
  error: string
}

export function LocationSearch({ onLocationSelect, loading, error }: LocationSearchProps) {
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<LocationResult[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [recentLocations, setRecentLocations] = useState<LocationResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Load recent locations from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("recent-locations")
    if (saved) {
      try {
        setRecentLocations(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse recent locations:", e)
      }
    }
  }, [])

  // Debounced search for suggestions
  useEffect(() => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    const timeoutId = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const results = await searchLocation(query)
        setSuggestions(results.slice(0, 5))
        setShowSuggestions(true)
      } catch (err) {
        console.error("Search failed:", err)
        setSuggestions([])
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [query])

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLocationSelect = (location: LocationResult) => {
    const locationName = `${location.name}${location.state ? `, ${location.state}` : ""}, ${location.country}`

    // Add to recent locations
    const updatedRecent = [
      location,
      ...recentLocations.filter((loc) => !(loc.lat === location.lat && loc.lon === location.lon)),
    ].slice(0, 5)

    setRecentLocations(updatedRecent)
    localStorage.setItem("recent-locations", JSON.stringify(updatedRecent))

    // Clear search state
    setQuery("")
    setSuggestions([])
    setShowSuggestions(false)

    // Call parent handler
    onLocationSelect(location.lat, location.lon, locationName)
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        onLocationSelect(latitude, longitude, "Current Location")
      },
      (error) => {
        console.error("Geolocation error:", error)
      },
    )
  }

  const clearRecentLocations = () => {
    setRecentLocations([])
    localStorage.removeItem("recent-locations")
  }

  const formatLocationName = (location: LocationResult) => {
    return `${location.name}${location.state ? `, ${location.state}` : ""}, ${location.country}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
        <CardDescription>Enter a city name or use your current location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                ref={inputRef}
                placeholder="Search for a city..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                className="pl-10"
                disabled={loading}
              />
              {searchLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
            <Button variant="outline" onClick={handleCurrentLocation} disabled={loading}>
              Use Current Location
            </Button>
          </div>

          {/* Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute top-full left-0 right-0 z-10 mt-1 bg-card border border-border rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
              {suggestions.map((location, index) => (
                <button
                  key={index}
                  onClick={() => handleLocationSelect(location)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2 border-b border-border last:border-b-0"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div>
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {location.state && `${location.state}, `}
                      {location.country}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recent Locations */}
        {recentLocations.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Locations
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearRecentLocations}
                className="h-auto p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {recentLocations.map((location, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => handleLocationSelect(location)}
                >
                  {formatLocationName(location)}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>}
      </CardContent>
    </Card>
  )
}
