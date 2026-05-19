"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"

interface DataCleanupProps {
  onCleanupData: () => void
  onClearCache: () => void
}

export function DataCleanup({ onCleanupData, onClearCache }: DataCleanupProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Cleanup</CardTitle>
        <CardDescription>Manage your stored data and cache</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCleanupData}>
            <Trash2 className="h-4 w-4 mr-2" />
            Cleanup Old Data
          </Button>
          <Button variant="outline" onClick={onClearCache}>
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
  )
}