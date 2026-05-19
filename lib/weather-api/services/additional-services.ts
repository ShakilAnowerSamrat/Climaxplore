import { API_KEY } from '../constants';
import { normalizeCoordinates } from '../utils';

export async function getAirQuality(lat: number, lon: number): Promise<any> {
  const coords = normalizeCoordinates(lat, lon);

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}`
    );

    if (!response.ok) {
      console.log(
        `[climaxplore] Air quality API failed with status: ${response.status}`
      );
      return null;
    }

    return response.json();
  } catch (error) {
    console.error(`[climaxplore] Air quality error:`, error);
    return null;
  }
}

export async function getWeatherAlerts(
  lat: number,
  lon: number
): Promise<any[]> {
  const coords = normalizeCoordinates(lat, lon);

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&exclude=minutely,hourly,daily`
    );

    if (response.ok) {
      const data = await response.json();
      return data.alerts || [];
    }

    console.log(
      `[climaxplore] Weather alerts API not available (status: ${response.status})`
    );
    return [];
  } catch (error) {
    console.warn(`[climaxplore] Weather alerts error:`, error);
    return [];
  }
}

export async function searchLocation(query: string) {
  const response = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(
      query
    )}&limit=5&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error('Failed to search locations');
  }

  return response.json();
}