import { ActivityType } from "./types"

export const ACTIVITY_TYPES: ActivityType[] = [
  {
    id: "general",
    name: "General Outdoor Activity",
    description: "Walking, casual outdoor events",
    weights: { temperature: 0.3, wind: 0.2, precipitation: 0.3, humidity: 0.1, visibility: 0.1 },
    optimalConditions: {
      tempRange: [15, 25],
      maxWind: 15,
      maxPrecipitation: 0.1,
      maxHumidity: 70,
      minVisibility: 5000,
    },
  },
  {
    id: "hiking",
    name: "Hiking & Trekking",
    description: "Mountain hiking, trail walking",
    weights: { temperature: 0.25, wind: 0.25, precipitation: 0.25, humidity: 0.15, visibility: 0.1 },
    optimalConditions: {
      tempRange: [10, 22],
      maxWind: 20,
      maxPrecipitation: 0.2,
      maxHumidity: 75,
      minVisibility: 3000,
    },
  },
  {
    id: "cycling",
    name: "Cycling",
    description: "Road cycling, mountain biking",
    weights: { temperature: 0.2, wind: 0.4, precipitation: 0.3, humidity: 0.05, visibility: 0.05 },
    optimalConditions: {
      tempRange: [12, 24],
      maxWind: 25,
      maxPrecipitation: 0.1,
      maxHumidity: 80,
      minVisibility: 8000,
    },
  },
  {
    id: "water_sports",
    name: "Water Sports",
    description: "Swimming, kayaking, sailing",
    weights: { temperature: 0.35, wind: 0.3, precipitation: 0.15, humidity: 0.05, visibility: 0.15 },
    optimalConditions: {
      tempRange: [20, 30],
      maxWind: 15,
      maxPrecipitation: 0.3,
      maxHumidity: 85,
      minVisibility: 2000,
    },
  },
  {
    id: "picnic",
    name: "Picnic & BBQ",
    description: "Outdoor dining, family gatherings",
    weights: { temperature: 0.25, wind: 0.25, precipitation: 0.4, humidity: 0.05, visibility: 0.05 },
    optimalConditions: {
      tempRange: [18, 28],
      maxWind: 12,
      maxPrecipitation: 0.05,
      maxHumidity: 75,
      minVisibility: 5000,
    },
  },
  {
    id: "photography",
    name: "Photography",
    description: "Outdoor photography sessions",
    weights: { temperature: 0.15, wind: 0.15, precipitation: 0.25, humidity: 0.1, visibility: 0.35 },
    optimalConditions: {
      tempRange: [5, 30],
      maxWind: 20,
      maxPrecipitation: 0.1,
      maxHumidity: 80,
      minVisibility: 10000,
    },
  },
]