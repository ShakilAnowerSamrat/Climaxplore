"use client"

import { useState, useEffect } from "react"

export function useNasaMissionControl() {
  const [missionTime, setMissionTime] = useState(new Date())
  const [systemStatus, setSystemStatus] = useState("OPERATIONAL")

  useEffect(() => {
    const timer = setInterval(() => {
      setMissionTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const getAtmosphericPressureStatus = (pressure: number) => {
    if (pressure > 1020) return { status: "HIGH", color: "bg-chart-3", risk: "LOW" }
    if (pressure < 1000) return { status: "LOW", color: "bg-chart-5", risk: "MODERATE" }
    return { status: "NORMAL", color: "bg-chart-2", risk: "LOW" }
  }

  const getVisibilityStatus = (visibility: number) => {
    if (visibility >= 10000) return { status: "EXCELLENT", color: "bg-chart-2", risk: "LOW" }
    if (visibility >= 5000) return { status: "GOOD", color: "bg-chart-3", risk: "LOW" }
    if (visibility >= 1000) return { status: "MODERATE", color: "bg-chart-4", risk: "MODERATE" }
    return { status: "POOR", color: "bg-destructive", risk: "HIGH" }
  }

  const getUVIndexStatus = (uvIndex: number) => {
    if (uvIndex <= 2) return { status: "LOW", color: "bg-chart-2", risk: "LOW" }
    if (uvIndex <= 5) return { status: "MODERATE", color: "bg-chart-3", risk: "LOW" }
    if (uvIndex <= 7) return { status: "HIGH", color: "bg-chart-4", risk: "MODERATE" }
    if (uvIndex <= 10) return { status: "VERY HIGH", color: "bg-destructive", risk: "HIGH" }
    return { status: "EXTREME", color: "bg-destructive", risk: "CRITICAL" }
  }

  return {
    missionTime,
    systemStatus,
    getAtmosphericPressureStatus,
    getVisibilityStatus,
    getUVIndexStatus,
  }
}