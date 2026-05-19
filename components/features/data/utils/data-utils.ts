export const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export const getRiskColor = (risk: string) => {
  switch (risk.toLowerCase()) {
    case "low":
      return "bg-primary text-primary-foreground"
    case "medium":
      return "bg-accent text-accent-foreground"
    case "high":
      return "bg-destructive text-destructive-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 Bytes"
  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}