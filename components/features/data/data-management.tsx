"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useDataManagement } from "./hooks/use-data-management"
import { DataHeader } from "./components/data-header"
import { QueryHistory } from "./components/query-history"
import { FavoriteLocations } from "./components/favorite-locations"
import { DataAnalytics } from "./components/data-analytics"
import { DataExportImport } from "./components/data-export-import"
import { DataCleanup } from "./components/data-cleanup"

interface DataManagementProps {
  onLocationSelect?: (lat: number, lon: number, name: string) => void
}

export function DataManagement({ onLocationSelect }: DataManagementProps) {
  const {
    weatherHistory,
    favoriteLocations,
    usageStats,
    storageUsage,
    handleExportData,
    handleImportData,
    handleClearHistory,
    handleClearCache,
    handleCleanupData,
    handleRemoveFavorite,
  } = useDataManagement()

  return (
    <div className="space-y-6">
      <DataHeader />

      <Tabs defaultValue="history" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history">Query History</TabsTrigger>
          <TabsTrigger value="favorites">Favorite Locations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Data Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="history" className="space-y-4">
          <QueryHistory
            weatherHistory={weatherHistory}
            onClearHistory={handleClearHistory}
            onLocationSelect={onLocationSelect || (() => {})}
          />
        </TabsContent>

        <TabsContent value="favorites" className="space-y-4">
          <FavoriteLocations
            favoriteLocations={favoriteLocations}
            onLocationSelect={onLocationSelect || (() => {})}
            onRemoveFavorite={handleRemoveFavorite}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <DataAnalytics usageStats={usageStats} storageUsage={storageUsage} />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <DataExportImport onExportData={handleExportData} onImportData={handleImportData} />
          <DataCleanup onCleanupData={handleCleanupData} onClearCache={handleClearCache} />
        </TabsContent>
      </Tabs>
    </div>
  )
}