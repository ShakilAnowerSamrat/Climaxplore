"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { useLocationSearch } from "./hooks/use-location-search"
import { SearchInput } from "./components/search-input"
import { RecentLocations } from "./components/recent-locations"

interface LocationSearchProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void
  loading: boolean
  error: string
}

export function LocationSearch({ onLocationSelect, loading, error }: LocationSearchProps) {
  const {
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
  } = useLocationSearch({ onLocationSelect, loading, error })

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
        <SearchInput
          query={query}
          setQuery={setQuery}
          suggestions={suggestions}
          showSuggestions={showSuggestions}
          setShowSuggestions={setShowSuggestions}
          searchLoading={searchLoading}
          loading={loading}
          inputRef={inputRef}
          suggestionsRef={suggestionsRef}
          onLocationSelect={handleLocationSelect}
          onCurrentLocation={handleCurrentLocation}
        />

        {/* Recent Locations */}
        <RecentLocations
          recentLocations={recentLocations}
          onLocationSelect={handleLocationSelect}
          onClearRecentLocations={clearRecentLocations}
          formatLocationName={formatLocationName}
        />

        {/* Error Display */}
        {error && <div className="text-destructive text-sm bg-destructive/10 p-3 rounded-md">{error}</div>}
      </CardContent>
    </Card>
  )
}