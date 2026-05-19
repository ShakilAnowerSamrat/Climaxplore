export function calculateFactorScore(
  value: number,
  optimal: [number, number] | number,
  acceptable: [number, number] | number,
  isHigherBetter = false,
): { score: number; status: "optimal" | "acceptable" | "poor" | "dangerous" } {
  let score = 0
  let status: "optimal" | "acceptable" | "poor" | "dangerous" = "dangerous"

  if (Array.isArray(optimal)) {
    // Range-based scoring (temperature)
    const [optMin, optMax] = optimal
    const [accMin, accMax] = acceptable as [number, number]

    if (value >= optMin && value <= optMax) {
      score = 100
      status = "optimal"
    } else if (value >= accMin && value <= accMax) {
      // Calculate score based on distance from optimal range
      const distanceFromOptimal = Math.min(
        Math.abs(value - optMin),
        Math.abs(value - optMax),
        value < optMin ? optMin - value : value - optMax,
      )
      const maxDistance = Math.max(optMin - accMin, accMax - optMax)
      score = Math.max(50, 100 - (distanceFromOptimal / maxDistance) * 50)
      status = "acceptable"
    } else {
      // Poor or dangerous based on how far outside acceptable range
      const distanceFromAcceptable = value < accMin ? accMin - value : value - accMax
      score = Math.max(0, 50 - distanceFromAcceptable * 2)
      status = score > 25 ? "poor" : "dangerous"
    }
  } else {
    // Threshold-based scoring (wind, precipitation, etc.)
    const optimalThreshold = optimal as number
    const acceptableThreshold = acceptable as number

    if (isHigherBetter) {
      if (value >= optimalThreshold) {
        score = 100
        status = "optimal"
      } else if (value >= acceptableThreshold) {
        score = 50 + ((value - acceptableThreshold) / (optimalThreshold - acceptableThreshold)) * 50
        status = "acceptable"
      } else {
        score = Math.max(0, (value / acceptableThreshold) * 50)
        status = score > 25 ? "poor" : "dangerous"
      }
    } else {
      if (value <= optimalThreshold) {
        score = 100
        status = "optimal"
      } else if (value <= acceptableThreshold) {
        score = 50 + ((acceptableThreshold - value) / (acceptableThreshold - optimalThreshold)) * 50
        status = "acceptable"
      } else {
        score = Math.max(0, 50 - ((value - acceptableThreshold) / acceptableThreshold) * 50)
        status = score > 25 ? "poor" : "dangerous"
      }
    }
  }

  return { score: Math.round(score), status }
}