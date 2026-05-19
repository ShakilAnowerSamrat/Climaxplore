"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, X } from "lucide-react"
import type { LocationResult } from "../hooks/use-location-search"

interface RecentLocationsProps {
  recentLocations: LocationResult[]
  onLocationSelect: (location: LocationResult) => void
  onClearRecentLocations: () => void
  formatLocationName: (location: LocationResult) => string
}

export function RecentLocations({
  recentLocations,
  onLocationSelect,
  onClearRecentLocations,
  formatLocationName,
}: RecentLocationsProps) {
  if (recentLocations.length === 0) return null

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Recent Locations
        </h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearRecentLocations}
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
            onClick={() => onLocationSelect(location)}
          >
            {formatLocationName(location)}
          </Badge>
        ))}
      </div>
    </div>
  )
}