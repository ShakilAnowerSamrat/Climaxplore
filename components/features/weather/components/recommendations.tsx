"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"
import type { EnhancedRiskAssessment } from "@/lib/risk-assessment"

interface RecommendationsProps {
  riskAssessment: EnhancedRiskAssessment
}

export function Recommendations({ riskAssessment }: RecommendationsProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Recommendations & Advice
        </CardTitle>
        <CardDescription>Personalized suggestions based on current conditions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {riskAssessment.recommendations.map((rec, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                rec.priority === "high"
                  ? "border-l-destructive bg-destructive/5"
                  : rec.priority === "medium"
                    ? "border-l-accent bg-accent/5"
                    : "border-l-primary bg-primary/5"
              }`}
            >
              <div className="flex items-start gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    rec.priority === "high"
                      ? "border-destructive text-destructive"
                      : rec.priority === "medium"
                        ? "border-accent text-accent"
                        : "border-primary text-primary"
                  }`}
                >
                  {rec.priority.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm font-medium mt-2">{rec.message}</p>
              {rec.action && <p className="text-xs text-muted-foreground mt-1">{rec.action}</p>}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}