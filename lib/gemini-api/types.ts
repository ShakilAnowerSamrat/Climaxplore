export interface WeatherInsightRequest {
  weatherData: any;
  userPreferences: any;
  activity?: string;
  location: string;
}

export interface WeatherChatRequest {
  message: string;
  weatherContext: any;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface WeatherInsightResponse {
  summary: string;
  riskFactors: Array<{
    factor: string;
    severity: 'High' | 'Medium' | 'Low'; // ✅ Use union type instead of string
    explanation: string;
  }>;
  recommendations: string[];
  alternatives: string[];
  patterns: string;
}

export interface WeatherAnomalyResponse {
  anomalies: Array<{
    type: string;
    severity: string;
    description: string;
  }>;
  explanation: string;
  implications: string;
  confidence: string;
}

export interface ActivityPlanResponse {
  dailyPlans: Array<{
    date: string;
    recommended: Array<{
      activity: string;
      timeSlot: string;
      reason: string;
    }>;
    avoid: Array<{
      activity: string;
      reason: string;
    }>;
    backup: string;
  }>;
  overallStrategy: string;
}