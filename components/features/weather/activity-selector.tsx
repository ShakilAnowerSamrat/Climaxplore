"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Mountain, Bike, Waves, UtensilsCrossed, Camera } from "lucide-react"
import { ACTIVITY_TYPES, type ActivityType } from "@/lib/risk-assessment"
import { ActivityButton } from "./components/activity-button"
import { ActivityRiskFactors } from "./components/activity-risk-factors"

interface ActivitySelectorProps {
  selectedActivity: ActivityType
  onActivityChange: (activity: ActivityType) => void
}

const ACTIVITY_ICONS = {
  general: Activity,
  hiking: Mountain,
  cycling: Bike,
  water_sports: Waves,
  picnic: UtensilsCrossed,
  photography: Camera,
}

export function ActivitySelector({ selectedActivity, onActivityChange }: ActivitySelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Type
        </CardTitle>
        <CardDescription>Select your planned outdoor activity for personalized risk assessment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ACTIVITY_TYPES.map((activity) => {
            const IconComponent = ACTIVITY_ICONS[activity.id as keyof typeof ACTIVITY_ICONS]
            const isSelected = selectedActivity.id === activity.id

            return (
              <ActivityButton
                key={activity.id}
                activity={activity}
                isSelected={isSelected}
                IconComponent={IconComponent}
                onSelect={() => onActivityChange(activity)}
              />
            )
          })}
        </div>

        {selectedActivity && (
          <ActivityRiskFactors selectedActivity={selectedActivity} />
        )}
      </CardContent>
    </Card>
  )
}