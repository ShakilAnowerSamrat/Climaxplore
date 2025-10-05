# 🌍 Climaxplore - Advanced Weather Risk Assessment System

[![NASA Space Apps Challenge 2025](https://img.shields.io/badge/NASA%20Space%20Apps-2025-blue.svg)](https://www.spaceappschallenge.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**Will It Rain On My Parade?** - An AI-powered weather intelligence platform that transforms meteorological data into actionable insights for safer, smarter decision-making.

🔗 **Live Demo:** [climaxplore.vercel.app](https://climaxplore.vercel.app)  
📦 **Repository:** [github.com/ShakilAnowerSamrat/Climaxplore](https://github.com/ShakilAnowerSamrat/Climaxplore)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Benefits the World](#how-it-benefits-the-world)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [How to Use](#how-to-use)
- [API Configuration](#api-configuration)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🌟 Overview

**Climaxplore** is an advanced weather risk assessment system developed for the NASA Space Apps Challenge 2025. It combines real-time meteorological data with AI-powered analysis to provide users with comprehensive weather insights, activity-specific risk assessments, and long-term predictions up to 12 months ahead.

Unlike traditional weather apps that provide generic forecasts, Climaxplore transforms raw weather data into personalized, actionable intelligence tailored to your specific activities and preferences.

### What Makes Climaxplore Different?

- **AI-Powered Intelligence**: Uses Google Gemini 2.0 Flash for advanced weather analysis and natural language interactions
- **Extended Predictions**: Provides monthly weather predictions up to 12 months ahead, far beyond standard 5-7 day forecasts
- **Activity-Centric Design**: Personalized risk assessments based on specific activity requirements
- **Anomaly Detection**: Identifies unusual weather patterns that may indicate significant events
- **Interactive Visualization**: 2D and 3D weather maps with real-time overlays
- **Conversational AI**: ARIA chatbot assistant for intuitive weather queries

---

## 🚀 Key Features

### 1. Intelligent Weather Analysis
- **Real-time Conditions**: Current temperature, humidity, wind speed, UV index, air quality, and atmospheric pressure
- **5-Day Detailed Forecasts**: Hourly breakdowns with precipitation probability and weather conditions
- **12-Month Predictions**: Extended monthly forecasts with seasonal adjustments and confidence indicators
- **Historical Data Analysis**: Trend visualization and pattern recognition from past weather data
- **Anomaly Detection**: Automatic identification of unusual weather patterns

### 2. AI-Powered Risk Assessment
- **Activity-Specific Scoring**: Risk levels calculated for 15+ activity types including:
  - Outdoor events (concerts, weddings, sports)
  - Agricultural operations (planting, harvesting)
  - Construction projects
  - Aviation and marine activities
  - Hiking, camping, and outdoor recreation
- **Smart Recommendations**: AI-generated suggestions for optimal timing and precautions
- **Multi-Factor Analysis**: Considers temperature, wind, precipitation, humidity, UV, and air quality
- **Risk Levels**: Clear categorization (Low, Moderate, High, Extreme) with detailed explanations

### 3. Interactive Weather Maps
- **2D Map View**: SVG-based world map with clickable locations
- **3D Globe**: Three.js-powered interactive Earth visualization
- **Weather Overlays**: Temperature, wind, precipitation, clouds, and pressure layers
- **Major Cities**: Quick access to weather data for 50+ global cities
- **Custom Markers**: Add and track multiple locations simultaneously

### 4. ARIA - AI Weather Assistant
- **Natural Language Queries**: Ask questions in plain English
- **Contextual Responses**: Understands your location, activity, and preferences
- **Weather Insights**: Explains complex meteorological phenomena in simple terms
- **Activity Planning**: Suggests optimal times for your planned activities
- **Historical Comparisons**: Compares current conditions with historical averages

### 5. NASA Mission Control Mode
- **Space-Themed Interface**: Immersive NASA-inspired design
- **Real-Time Monitoring**: Mission control-style weather dashboard
- **Critical Alerts**: Prominent display of extreme weather conditions
- **System Status**: Visual indicators for all weather parameters

### 6. Data Management & Persistence
- **Favorite Locations**: Save frequently checked locations
- **Query History**: Track past weather searches and risk assessments
- **Export/Import**: Download your data in JSON format
- **Local Storage**: Automatic caching for faster load times
- **User Preferences**: Customizable thresholds for temperature, wind, humidity, and precipitation

---

## 🌍 How It Benefits the World

### 1. Enhanced Safety & Risk Mitigation
- **Prevents Weather-Related Accidents**: Helps users avoid dangerous conditions during outdoor activities
- **Emergency Preparedness**: Early warnings for extreme weather events enable better preparation
- **Aviation & Marine Safety**: Critical weather information for pilots and sailors
- **Construction Safety**: Reduces workplace accidents by identifying hazardous weather conditions

### 2. Economic Impact
- **Reduced Financial Losses**: Better planning prevents weather-related cancellations and damages
- **Agricultural Optimization**: Farmers can time planting, irrigation, and harvesting for maximum yield
- **Event Planning**: Organizers can schedule outdoor events with confidence
- **Insurance Industry**: More accurate risk assessment for weather-related claims

### 3. Climate Awareness & Education
- **Anomaly Detection**: Helps identify climate change patterns and unusual weather events
- **Historical Analysis**: Enables users to understand long-term weather trends
- **Data Accessibility**: Democratizes access to advanced weather intelligence
- **Scientific Literacy**: Educates users about meteorological concepts through AI explanations

### 4. Resource Optimization
- **Energy Management**: Utilities can predict demand based on weather forecasts
- **Water Conservation**: Irrigation scheduling based on precipitation predictions
- **Supply Chain Efficiency**: Logistics companies can optimize routes and schedules
- **Tourism Planning**: Travelers can choose optimal times for destinations

### 5. Global Accessibility
- **Free to Use**: No subscription fees or paywalls
- **Multi-Location Support**: Track weather anywhere in the world
- **Mobile-Responsive**: Works on all devices (desktop, tablet, mobile)
- **Open Source**: Community-driven development and improvements

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (React 18)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **3D Graphics**: Three.js (for 3D globe)
- **Charts**: Recharts
- **Animations**: Framer Motion

### Backend & APIs
- **Weather Data**: OpenWeather API
  - Current Weather API
  - 5-Day Forecast API
  - Historical Weather API
  - Air Quality API
  - Geocoding API
- **AI Integration**: Google Gemini 2.0 Flash API
- **Deployment**: Vercel

### Data Management
- **State Management**: React Hooks + SWR
- **Local Storage**: Browser localStorage API
- **Caching**: Custom caching layer for API responses

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or Bun
- npm, yarn, or pnpm package manager
- OpenWeather API key (free tier available)
- Google Gemini API key (free tier available)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone https://github.com/ShakilAnowerSamrat/Climaxplore.git
cd Climaxplore
\`\`\`

2. **Install dependencies**
\`\`\`bash
npm install
# or
yarn install
# or
pnpm install
\`\`\`

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

\`\`\`env
# OpenWeather API
OPENWEATHER_API_KEY=your_openweather_api_key_here

# Google Gemini AI API
GEMINI_API_KEY=your_gemini_api_key_here
\`\`\`

**How to get API keys:**

- **OpenWeather API**: 
  1. Visit [openweathermap.org](https://openweathermap.org/api)
  2. Sign up for a free account
  3. Navigate to API Keys section
  4. Copy your API key

- **Gemini API**:
  1. Visit [ai.google.dev](https://ai.google.dev/)
  2. Click "Get API Key"
  3. Sign in with Google account
  4. Create a new API key
  5. Copy your API key

4. **Run the development server**
\`\`\`bash
npm run dev
# or
yarn dev
# or
pnpm dev
\`\`\`

5. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000)

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

---

## 📖 How to Use

### 1. Getting Started - Location Selection

**Option A: Search for a Location**
1. Click on the search bar at the top of the page
2. Type a city name (e.g., "New York", "London", "Tokyo")
3. Select from the autocomplete suggestions
4. Weather data will load automatically

**Option B: Use Current Location**
1. Click the "Use Current Location" button
2. Allow browser location access when prompted
3. Your current weather will display immediately

**Option C: Interactive Map**
1. Navigate to the "Interactive Map" tab
2. Click anywhere on the map to select a location
3. Or click "Show Major Cities" for quick access to 50+ cities
4. Toggle between 2D map and 3D globe views

### 2. Understanding Weather & Risk Assessment

**Weather Analysis Section:**
- **Current Conditions**: Real-time temperature, humidity, wind, UV index, and air quality
- **Feels Like Temperature**: Accounts for humidity and wind chill
- **Risk Level Badge**: Color-coded indicator (Green=Low, Yellow=Moderate, Orange=High, Red=Extreme)
- **Activity Suitability Score**: 0-100 rating for your selected activity

**AI Weather Intelligence:**
- **Weather Summary**: Natural language description of current conditions
- **Risk Assessment Cards**: Detailed breakdown of specific risk factors
- **Recommendations**: AI-generated suggestions for your activity
- **Anomaly Alerts**: Warnings for unusual weather patterns

### 3. Viewing Forecasts

**5-Day Forecast:**
1. Click the "Forecast" tab
2. View daily summaries with high/low temperatures
3. Click on any day to see hourly breakdown
4. Check precipitation probability and wind conditions

**12-Month Predictions:**
1. In the "Weather Analysis" section, look for the month selector
2. Choose any month up to 12 months ahead
3. View predicted monthly averages and patterns
4. See weekly breakdowns within each month
5. Check activity suitability scores for long-term planning

### 4. Customizing Your Experience

**Activity Selection:**
1. Go to "Activity Setup" tab
2. Choose from 15+ activity types:
   - General outdoor activities
   - Sports (running, cycling, golf, etc.)
   - Events (concerts, weddings, festivals)
   - Work (construction, agriculture, aviation)
   - Recreation (hiking, camping, beach)
3. Each activity has unique weather sensitivity parameters

**Setting Preferences:**
1. Navigate to "Preferences" tab
2. Adjust your comfort thresholds:
   - **Very Hot**: Temperature you consider too hot (default: 30°C)
   - **Very Cold**: Temperature you consider too cold (default: 5°C)
   - **Very Windy**: Wind speed you consider too strong (default: 20 km/h)
   - **Very Wet**: Precipitation probability threshold (default: 70%)
   - **Very Humid**: Humidity level you find uncomfortable (default: 80%)
3. Changes apply immediately to risk calculations

### 5. Using ARIA - AI Assistant

**Starting a Conversation:**
1. Click the "AI Assistant" tab
2. Type your question in natural language
3. Examples:
   - "Is it safe to go hiking tomorrow?"
   - "What's the best time this week for an outdoor wedding?"
   - "Why is it so humid today?"
   - "Compare today's weather to last week"

**Advanced Queries:**
- Ask about specific weather parameters
- Request activity recommendations
- Get explanations of weather phenomena
- Compare historical data
- Plan multi-day events

### 6. Exploring Advanced Features

**Historical Data Analysis:**
1. Go to "Historical Data" tab
2. View weather trends over the past 7-30 days
3. Compare current conditions to historical averages
4. Identify patterns and anomalies

**Advanced Analysis:**
1. Navigate to "Advanced Analysis" tab
2. View detailed charts and graphs
3. Analyze temperature, humidity, and pressure trends
4. Check anomaly detection results

**Data Management:**
1. Click "Data & History" tab
2. View your favorite locations
3. Check query history
4. Export your data as JSON
5. Import previously saved data

### 7. NASA Mission Control Mode

**Activating Mission Control:**
1. Click the "Mission Control" button in the header
2. Experience an immersive NASA-themed interface
3. View real-time weather monitoring dashboard
4. See critical alerts in mission control style
5. Click "Exit Mission Control" to return to normal view

---

## 🔑 API Configuration

### OpenWeather API

**Endpoints Used:**
- Current Weather: `https://api.openweathermap.org/data/2.5/weather`
- 5-Day Forecast: `https://api.openweathermap.org/data/2.5/forecast`
- Historical Data: `https://api.openweathermap.org/data/3.0/onecall/timemachine`
- Air Quality: `https://api.openweathermap.org/data/2.5/air_pollution`
- Geocoding: `https://api.openweathermap.org/geo/1.0/direct`

**Rate Limits (Free Tier):**
- 60 calls/minute
- 1,000,000 calls/month

### Google Gemini API

**Model Used:** `gemini-2.0-flash-exp`

**Features:**
- Weather insights generation
- Risk assessment analysis
- Conversational AI responses
- Activity planning recommendations
- Anomaly detection explanations

**Rate Limits (Free Tier):**
- 15 requests/minute
- 1,500 requests/day

---

## 📁 Project Structure

\`\`\`
Climaxplore/
├── app/
│   ├── globals.css          # Global styles with NASA theme
│   ├── layout.tsx            # Root layout component
│   └── page.tsx              # Main application page
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── activity-selector.tsx
│   ├── advanced-weather-analysis.tsx
│   ├── ai-insights-panel.tsx
│   ├── data-management.tsx
│   ├── forecast-display.tsx
│   ├── historical-weather-data.tsx
│   ├── location-search.tsx
│   ├── nasa-mission-control.tsx
│   ├── preferences-dashboard.tsx
│   ├── weather-chat-assistant.tsx
│   ├── weather-map.tsx
│   ├── weather-map-3d.tsx
│   └── weather-results.tsx
├── lib/
│   ├── data-persistence.ts   # Local storage management
│   ├── gemini-api.ts         # Gemini AI integration
│   ├── risk-assessment.ts    # Risk calculation logic
│   ├── utils.ts              # Utility functions
│   └── weather-api.ts        # OpenWeather API integration
├── types/
│   └── weather-map.ts        # TypeScript type definitions
├── public/                   # Static assets
├── .env.local               # Environment variables (create this)
├── next.config.mjs          # Next.js configuration
├── package.json             # Dependencies
├── tailwind.config.ts       # Tailwind CSS configuration
└── tsconfig.json            # TypeScript configuration
\`\`\`

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **Report Bugs**: Open an issue describing the bug and steps to reproduce
2. **Suggest Features**: Share your ideas for new features or improvements
3. **Submit Pull Requests**: Fix bugs or implement new features
4. **Improve Documentation**: Help make the docs clearer and more comprehensive
5. **Share Feedback**: Tell us about your experience using Climaxplore

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure all components are properly typed
- Test on multiple screen sizes

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **NASA Space Apps Challenge** for inspiring this project
- **OpenWeather** for providing comprehensive weather data APIs
- **Google** for the Gemini AI API
- **Vercel** for hosting and deployment platform
- **shadcn/ui** for beautiful UI components
- **The Open Source Community** for amazing tools and libraries

---

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/ShakilAnowerSamrat/Climaxplore/issues)
- **Email**: [Your contact email]
- **Website**: [climaxplore.vercel.app](https://climaxplore.vercel.app)

---

## 🌟 Star History

If you find Climaxplore useful, please consider giving it a star on GitHub! ⭐

---

**Built with ❤️ for NASA Space Apps Challenge 2025**

*Making weather intelligence accessible to everyone, everywhere.*
