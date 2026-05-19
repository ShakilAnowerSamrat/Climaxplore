"use client"

import { Button } from "@/components/ui/button"
import type { ActivityType } from "@/lib/risk-assessment"

interface ActivityButtonProps {
  activity: ActivityType
  isSelected: boolean
  IconComponent: any
  onSelect: () => void
}

export function ActivityButton({ activity, isSelected, IconComponent, onSelect }: ActivityButtonProps) {
  return (
    <Button
      variant={isSelected ? "default" : "outline"}
      className="h-auto p-4 flex flex-col items-start gap-2 text-left"
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 w-full">
        <IconComponent className="h-4 w-4 flex-shrink-0" />
        <span className="font-medium text-sm">{activity.name}</span>
      </div>
      <span className="text-xs text-muted-foreground">{activity.description}</span>
    </Button>
  )
}