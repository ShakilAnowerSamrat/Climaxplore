"use client"

import { ActivitySelector } from "@/components/features/weather/activity-selector"
import type { ActivityType } from "@/lib/risk-assessment"

interface ActivityTabProps {
  selectedActivity: ActivityType
  onActivityChange: (activity: ActivityType) => void
}

export function ActivityTab({ selectedActivity, onActivityChange }: ActivityTabProps) {
  return <ActivitySelector selectedActivity={selectedActivity} onActivityChange={onActivityChange} />
}