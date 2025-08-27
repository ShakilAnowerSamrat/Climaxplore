"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Activity, Mountain, Bike, Waves, UtensilsCrossed, Camera } from "lucide-react"
import { ACTIVITY_TYPES, type ActivityType } from "@/lib/risk-assessment"

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
              <Button
                key={activity.id}
                variant={isSelected ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-start gap-2 text-left"
                onClick={() => onActivityChange(activity)}
              >
                <div className="flex items-center gap-2 w-full">
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  <span className="font-medium text-sm">{activity.name}</span>
                </div>
                <span className="text-xs text-muted-foreground">{activity.description}</span>
              </Button>
            )
          })}
        </div>

        {selectedActivity && (
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <h4 className="font-medium text-sm mb-2">Risk Factors for {selectedActivity.name}:</h4>
            <div className="flex flex-wrap gap-1">
              {Object.entries(selectedActivity.weights)
                .sort(([, a], [, b]) => b - a)
                .map(([factor, weight]) => (
                  <Badge key={factor} variant="secondary" className="text-xs">
                    {factor}: {Math.round(weight * 100)}%
                  </Badge>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
