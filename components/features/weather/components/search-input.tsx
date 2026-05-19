"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"
import type { LocationResult } from "../hooks/use-location-search"

interface SearchInputProps {
  query: string
  setQuery: (query: string) => void
  suggestions: LocationResult[]
  showSuggestions: boolean
  setShowSuggestions: (show: boolean) => void
  searchLoading: boolean
  loading: boolean
  inputRef: React.RefObject<HTMLInputElement>
  suggestionsRef: React.RefObject<HTMLDivElement>
  onLocationSelect: (location: LocationResult) => void
  onCurrentLocation: () => void
}

export function SearchInput({
  query,
  setQuery,
  suggestions,
  showSuggestions,
  setShowSuggestions,
  searchLoading,
  loading,
  inputRef,
  suggestionsRef,
  onLocationSelect,
  onCurrentLocation,
}: SearchInputProps) {
  return (
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
        <Button variant="outline" onClick={onCurrentLocation} disabled={loading}>
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
              onClick={() => onLocationSelect(location)}
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
  )
}