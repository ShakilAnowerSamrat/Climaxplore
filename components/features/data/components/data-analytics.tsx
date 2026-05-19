"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Star, Activity, AlertCircle } from "lucide-react"
import { formatBytes } from "../utils/data-utils"

interface DataAnalyticsProps {
  usageStats: any
  storageUsage: any
}

export function DataAnalytics({ usageStats, storageUsage }: DataAnalyticsProps) {
  return (
    <div className="space-y-4">
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
    </div>
  )
}