"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Upload } from "lucide-react"

interface DataExportImportProps {
  onExportData: () => void
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export function DataExportImport({ onExportData, onImportData }: DataExportImportProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Export & Import</CardTitle>
        <CardDescription>Backup and restore your weather app data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={onExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button variant="outline" onClick={() => document.getElementById("import-file")?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Import Data
          </Button>
          <input id="import-file" type="file" accept=".json" onChange={onImportData} className="hidden" />
        </div>
        <p className="text-sm text-muted-foreground">
          Export your data to backup your preferences, history, and favorite locations. Import to restore from a
          previous backup.
        </p>
      </CardContent>
    </Card>
  )
}