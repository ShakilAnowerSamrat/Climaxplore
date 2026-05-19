"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, RotateCcw, Save } from "lucide-react"

interface PreferencesHeaderProps {
  hasChanges: boolean
  onSave: () => void
  onReset: () => void
}

export function PreferencesHeader({ hasChanges, onSave, onReset }: PreferencesHeaderProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Weather Preferences
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Badge variant="secondary" className="text-xs">
                Unsaved Changes
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={onReset}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={onSave} disabled={!hasChanges}>
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </CardTitle>
        <CardDescription>Customize your weather comfort levels to get personalized risk assessments</CardDescription>
      </CardHeader>
    </Card>
  )
}