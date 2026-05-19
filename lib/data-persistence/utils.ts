export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

export function getStorageUsage(): { used: number; available: number; percentage: number } {
  try {
    let used = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length
      }
    }

    const available = 5 * 1024 * 1024 // Assume 5MB limit
    const percentage = (used / available) * 100

    return { used, available, percentage }
  } catch (error) {
    return { used: 0, available: 0, percentage: 0 }
  }
}