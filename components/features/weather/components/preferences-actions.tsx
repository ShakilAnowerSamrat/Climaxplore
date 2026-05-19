"use client"

import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

interface PreferencesActionsProps {
  hasChanges: boolean
  onSave: () => void
  onClose?: () => void
}

export function PreferencesActions({ hasChanges, onSave, onClose }: PreferencesActionsProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="text-sm text-muted-foreground">
        {hasChanges ? "You have unsaved changes" : "All changes saved"}
      </div>
      <div className="flex gap-2">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        )}
        <Button onClick={onSave} disabled={!hasChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save Preferences
        </Button>
      </div>
    </div>
  )
}