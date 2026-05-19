"use client"

import { Badge } from "@/components/ui/badge"
import type { ActivityType } from "@/lib/risk-assessment"

interface ActivityRiskFactorsProps {
  selectedActivity: ActivityType
}

export function ActivityRiskFactors({ selectedActivity }: ActivityRiskFactorsProps) {
  return (
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
  )
}