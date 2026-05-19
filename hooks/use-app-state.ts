"use client"

import { useState } from "react"

export function useAppState() {
  const [activeTab, setActiveTab] = useState("weather")
  const [missionControlMode, setMissionControlMode] = useState(false)

  return {
    activeTab,
    setActiveTab,
    missionControlMode,
    setMissionControlMode,
  }
}