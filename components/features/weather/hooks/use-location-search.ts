import { useState, useEffect, useRef } from "react"
import { searchLocation } from "@/lib/weather-api"

export interface LocationResult {
  name: string
  country: string
  state?: string
  lat: number
  lon: number
}

export interface UseLocationSearchProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void
  loading: boolean
  error: string
}

export function useLocationSearch({ onLocationSelect, loading, error }: UseLocationSearchProps) {
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

    console.log("I am tiggered");
    
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

  return {
    query,
    setQuery,
    suggestions,
    showSuggestions,
    setShowSuggestions,
    recentLocations,
    searchLoading,
    inputRef,
    suggestionsRef,
    handleLocationSelect,
    handleCurrentLocation,
    clearRecentLocations,
    formatLocationName,
  }
}