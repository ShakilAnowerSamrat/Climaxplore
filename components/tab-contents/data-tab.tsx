"use client"

import { DataManagement } from "@/components/features/data/data-management"

interface DataTabProps {
  onLocationSelect: (lat: number, lon: number, name: string) => Promise<void>
}

export function DataTab({ onLocationSelect }: DataTabProps) {
  return <DataManagement onLocationSelect={onLocationSelect} />
}