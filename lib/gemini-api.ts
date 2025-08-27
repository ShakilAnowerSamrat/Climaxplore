import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI("AIzaSyDtnP2mlFOjWlNJ9okzeY3IhH5C8phZzio")

export interface WeatherInsightRequest {
  weatherData: any
  userPreferences: any
  activity?: string
  location: string
}

export interface WeatherChatRequest {
  message: string
  weatherContext: any
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
}

export async function generateWeatherInsights(request: WeatherInsightRequest) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    You are a NASA-trained meteorological AI assistant specializing in weather risk assessment for outdoor activities.
    
    WEATHER DATA:
    ${JSON.stringify(request.weatherData, null, 2)}
    
    USER PREFERENCES:
    ${JSON.stringify(request.userPreferences, null, 2)}
    
    ACTIVITY: ${request.activity || "General outdoor activities"}
    LOCATION: ${request.location}
    
    Please provide a weather analysis with:
    1. A concise weather summary (2-3 sentences)
    2. Key risk factors and their severity (High/Medium/Low)
    3. Specific recommendations for the planned activity
    4. Alternative suggestions if conditions are unfavorable
    5. Any notable weather patterns or anomalies
    
    IMPORTANT: Respond ONLY with valid JSON in this exact format:
    {
      "summary": "Brief weather overview in 2-3 sentences",
      "riskFactors": [{"factor": "Temperature", "severity": "Medium", "explanation": "Detailed explanation"}],
      "recommendations": ["Specific actionable advice", "Another recommendation"],
      "alternatives": ["Alternative activity suggestions"],
      "patterns": "Notable weather patterns or trends"
    }
    
    Do not include any text before or after the JSON. Only return the JSON object.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text().trim()

    // Remove any markdown formatting or extra text
    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0].trim()
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0].trim()
    }

    // Remove any leading/trailing non-JSON text
    const jsonStart = text.indexOf("{")
    const jsonEnd = text.lastIndexOf("}")
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1)
    }

    console.log("[v0] Raw Gemini response:", text)

    try {
      const parsed = JSON.parse(text)
      console.log("[v0] Successfully parsed JSON:", parsed)
      return parsed
    } catch (parseError) {
      console.error("[v0] JSON parsing failed:", parseError)
      console.error("[v0] Attempted to parse:", text)

      return {
        summary: "Weather analysis is available, but there was a formatting issue with the AI response.",
        riskFactors: [
          {
            factor: "Data Processing",
            severity: "Medium",
            explanation: "AI response formatting needs adjustment. Please refresh for updated analysis.",
          },
        ],
        recommendations: ["Refresh the AI insights for properly formatted analysis"],
        alternatives: ["Check the weather data manually while we resolve the formatting issue"],
        patterns: "AI response formatting is being optimized for better display.",
      }
    }
  } catch (error) {
    console.error("Gemini API error:", error)
    return {
      summary: "Unable to generate AI insights at this time due to API connectivity issues.",
      riskFactors: [],
      recommendations: ["Please check your internet connection and try again"],
      alternatives: ["Use manual weather assessment based on the displayed data"],
      patterns: "",
    }
  }
}

export async function chatWithWeatherAssistant(request: WeatherChatRequest) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const conversationContext =
      request.conversationHistory?.map((msg) => `${msg.role}: ${msg.content}`).join("\n") || ""

    const prompt = `
    You are ARIA (Atmospheric Risk Intelligence Assistant), a NASA-trained weather AI specializing in outdoor activity safety.
    
    CURRENT WEATHER CONTEXT:
    ${JSON.stringify(request.weatherContext, null, 2)}
    
    CONVERSATION HISTORY:
    ${conversationContext}
    
    USER QUESTION: ${request.message}
    
    Respond as ARIA with:
    - Authoritative but friendly tone
    - Specific, actionable advice
    - Reference to current weather data when relevant
    - Safety-first approach
    - NASA-level precision and reliability
    
    Keep responses concise but comprehensive (2-4 sentences).
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Gemini chat error:", error)
    return "I'm experiencing technical difficulties. Please try again in a moment."
  }
}

export async function analyzeWeatherAnomalies(weatherData: any, historicalData: any[]) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    As a NASA meteorological AI, analyze this weather data for anomalies:
    
    CURRENT CONDITIONS:
    ${JSON.stringify(weatherData, null, 2)}
    
    HISTORICAL CONTEXT (last 30 days):
    ${JSON.stringify(historicalData.slice(-30), null, 2)}
    
    Identify unusual patterns and respond ONLY with valid JSON:
    {
      "anomalies": [{"type": "temperature", "severity": "high", "description": "Detailed description"}],
      "explanation": "Technical explanation of patterns",
      "implications": "What this means for users",
      "confidence": "high"
    }
    
    Do not include any text before or after the JSON.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text().trim()

    if (text.includes("```json")) {
      text = text.split("```json")[1].split("```")[0].trim()
    } else if (text.includes("```")) {
      text = text.split("```")[1].split("```")[0].trim()
    }

    const jsonStart = text.indexOf("{")
    const jsonEnd = text.lastIndexOf("}")
    if (jsonStart !== -1 && jsonEnd !== -1) {
      text = text.substring(jsonStart, jsonEnd + 1)
    }

    try {
      return JSON.parse(text)
    } catch {
      return {
        anomalies: [],
        explanation: "Anomaly analysis completed but response formatting needs adjustment.",
        implications: "Please refresh for properly formatted anomaly detection.",
        confidence: "medium",
      }
    }
  } catch (error) {
    console.error("Anomaly analysis error:", error)
    return {
      anomalies: [],
      explanation: "Unable to analyze weather anomalies at this time.",
      implications: "",
      confidence: "low",
    }
  }
}

export async function generateActivityPlan(weatherForecast: any[], activities: string[], userPreferences: any) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = `
    As ARIA, NASA's weather planning AI, create an optimal activity schedule:
    
    FORECAST DATA (next 5 days):
    ${JSON.stringify(weatherForecast, null, 2)}
    
    DESIRED ACTIVITIES:
    ${activities.join(", ")}
    
    USER PREFERENCES:
    ${JSON.stringify(userPreferences, null, 2)}
    
    Create a day-by-day plan with:
    1. Best time slots for each activity
    2. Weather-based reasoning
    3. Backup plans for poor conditions
    4. Safety considerations
    
    Format as JSON:
    {
      "dailyPlans": [
        {
          "date": "2024-01-01",
          "recommended": [{"activity": "hiking", "timeSlot": "morning", "reason": "..."}],
          "avoid": [{"activity": "cycling", "reason": "high winds expected"}],
          "backup": "Indoor climbing gym"
        }
      ],
      "overallStrategy": "Week-long planning summary"
    }
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    return response.text()
  } catch (error) {
    console.error("Activity planning error:", error)
    return "Unable to generate activity plan at this time."
  }
}
