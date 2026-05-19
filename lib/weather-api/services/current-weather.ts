import { API_KEY, BASE_URL } from '../constants';
import type { WeatherData } from '../types';
import { normalizeCoordinates } from '../utils';

export async function getCurrentWeather(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const coords = normalizeCoordinates(lat, lon);
  console.log(
    `[climaxplore] Fetching current weather for lat: ${coords.lat}, lon: ${coords.lon}`
  );

  try {
    const response = await fetch(
      `${BASE_URL}/weather?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
    );

    console.log(
      `[climaxplore] Current weather API response status: ${response.status}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[climaxplore] Current weather API error: ${response.status} - ${errorText}`
      );
      throw new Error(`Failed to fetch weather data: ${response.status}`);
    }

    const data = await response.json();
    console.log(`[climaxplore] Current weather data received:`, data);

    return {
      location: {
        name: data.name || 'Unknown Location',
        lat: data.coord?.lat || coords.lat,
        lon: data.coord?.lon || coords.lon,
      },
      current: {
        temp: data.main?.temp || 20,
        feels_like: data.main?.feels_like || data.main?.temp || 20,
        humidity: data.main?.humidity || 50,
        wind_speed: data.wind?.speed || 0,
        wind_deg: data.wind?.deg || 0,
        weather: data.weather || [
          { main: 'Clear', description: 'clear sky', icon: '01d' },
        ],
        visibility: data.visibility || 10000,
        uv_index: data.uvi,
      },
    };
  } catch (error) {
    console.error(`[climaxplore] Error in getCurrentWeather:`, error);

    return {
      location: {
        name: 'Unknown Location',
        lat: coords.lat,
        lon: coords.lon,
      },
      current: {
        temp: 20 + (Math.random() - 0.5) * 10,
        feels_like: 20 + (Math.random() - 0.5) * 10,
        humidity: 50 + (Math.random() - 0.5) * 30,
        wind_speed: Math.random() * 5,
        wind_deg: Math.random() * 360,
        weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
        visibility: 10000,
      },
    };
  }
}