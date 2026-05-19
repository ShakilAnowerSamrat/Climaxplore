import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin,
  Thermometer,
  Wind,
  Droplets,
  Layers,
  Navigation,
  Eye,
  Gauge,
} from "lucide-react"
import type { MapMode } from "../utils/map-constants"

interface MapControlsProps {
  mapMode: MapMode
  is3DMode: boolean
  loading: boolean
  onMapModeChange: (mode: MapMode) => void
  on3DModeToggle: () => void
  onCurrentLocation: () => void
  onPopulateCities: () => void
  onClearAll: () => void
}

export const MapControls = ({
  mapMode,
  is3DMode,
  loading,
  onMapModeChange,
  on3DModeToggle,
  onCurrentLocation,
  onPopulateCities,
  onClearAll,
}: MapControlsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Interactive Weather Map
        </CardTitle>
        <CardDescription>
          Explore weather conditions across multiple locations with detailed overlays and risk assessments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mb-4">
          <Button variant="outline" size="sm" onClick={onCurrentLocation}>
            <Navigation className="h-4 w-4 mr-2" />
            Current Location
          </Button>
          <Button variant="outline" size="sm" onClick={onPopulateCities} disabled={loading}>
            <MapPin className="h-4 w-4 mr-2" />
            Show Major Cities
          </Button>
          <Button variant="outline" size="sm" onClick={onClearAll}>
            Clear All
          </Button>
          <Button variant={is3DMode ? "default" : "outline"} size="sm" onClick={on3DModeToggle}>
            <Layers className="h-4 w-4 mr-2" />
            {is3DMode ? "2D Map" : "3D Globe"}
          </Button>
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground">Weather Overlay:</span>
            <Tabs value={mapMode} onValueChange={(value) => onMapModeChange(value as MapMode)} className="w-auto">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="temperature" className="text-xs">
                  <Thermometer className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="wind" className="text-xs">
                  <Wind className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="precipitation" className="text-xs">
                  <Droplets className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="visibility" className="text-xs">
                  <Eye className="h-3 w-3" />
                </TabsTrigger>
                <TabsTrigger value="pressure" className="text-xs">
                  <Gauge className="h-3 w-3" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}