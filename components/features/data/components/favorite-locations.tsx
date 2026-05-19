"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, MapPin, Trash2 } from "lucide-react"
import type { FavoriteLocation } from "@/lib/data-persistence"
import { formatDate } from "../utils/data-utils"

interface FavoriteLocationsProps {
  favoriteLocations: FavoriteLocation[]
  onLocationSelect: (lat: number, lon: number, name: string) => void
  onRemoveFavorite: (id: string) => void
}

export function FavoriteLocations({
  favoriteLocations,
  onLocationSelect,
  onRemoveFavorite,
}: FavoriteLocationsProps) {
  return (
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
                    onClick={() => onLocationSelect(location.lat, location.lon, location.name)}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onRemoveFavorite(location.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}