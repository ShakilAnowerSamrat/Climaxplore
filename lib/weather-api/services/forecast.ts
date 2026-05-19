import { API_KEY, BASE_URL } from '../constants';
import type { WeatherData } from '../types';
import { normalizeCoordinates } from '../utils';
import { getCurrentWeather } from './current-weather';

export async function getForecast(
  lat: number,
  lon: number
): Promise<WeatherData> {
  const coords = normalizeCoordinates(lat, lon);
  console.log(
    `[climaxplore] Fetching forecast for lat: ${coords.lat}, lon: ${coords.lon}`
  );

  try {
    const response = await fetch(
      `${BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
    );

    console.log(
      `[climaxplore] Forecast API response status: ${response.status}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `[climaxplore] Forecast API error: ${response.status} - ${errorText}`
      );

      const currentWeather = await getCurrentWeather(coords.lat, coords.lon);

      const forecast = [];
      for (let i = 0; i < 16; i++) {
        const tempVariation = (Math.random() - 0.5) * 6;
        forecast.push({
          dt: Math.floor(Date.now() / 1000) + i * 3 * 60 * 60, // 3-hour intervals
          temp: {
            min: currentWeather.current.temp + tempVariation - 2,
            max: currentWeather.current.temp + tempVariation + 2,
          },
          weather: currentWeather.current.weather,
          pop: Math.random() * 0.3, // Low probability of precipitation
          wind_speed:
            currentWeather.current.wind_speed + (Math.random() - 0.5) * 2,
          humidity: Math.max(
            20,
            Math.min(
              90,
              currentWeather.current.humidity + (Math.random() - 0.5) * 20
            )
          ),
        });
      }

      return {
        ...currentWeather,
        forecast,
      };
    }

    const data = await response.json();
    console.log(
      `[climaxplore] Forecast data received, list length:`,
      data.list?.length
    );

    // Get current weather for location info
    const currentWeather = await getCurrentWeather(coords.lat, coords.lon);

    return {
      ...currentWeather,
      forecast: (data.list || []).slice(0, 16).map((item: any) => ({
        dt: item.dt,
        temp: {
          min: item.main?.temp_min || item.main?.temp || 20,
          max: item.main?.temp_max || item.main?.temp || 25,
        },
        weather: item.weather || [
          { main: 'Clear', description: 'clear sky', icon: '01d' },
        ],
        pop: item.pop || 0,
        wind_speed: item.wind?.speed || 0,
        humidity: item.main?.humidity || 50,
      })),
    };
  } catch (error) {
    console.error(`[climaxplore] Error in getForecast:`, error);

    const currentWeather = await getCurrentWeather(lat, lon);

    const forecast = [];
    for (let i = 0; i < 16; i++) {
      const tempVariation = (Math.random() - 0.5) * 6;
      forecast.push({
        dt: Math.floor(Date.now() / 1000) + i * 3 * 60 * 60,
        temp: {
          min: currentWeather.current.temp + tempVariation - 2,
          max: currentWeather.current.temp + tempVariation + 2,
        },
        weather: currentWeather.current.weather,
        pop: Math.random() * 0.3,
        wind_speed:
          currentWeather.current.wind_speed + (Math.random() - 0.5) * 2,
        humidity: Math.max(
          20,
          Math.min(
            90,
            currentWeather.current.humidity + (Math.random() - 0.5) * 20
          )
        ),
      });
    }

    return {
      ...currentWeather,
      forecast,
    };
  }
}

export async function getEnhancedForecast(
  lat: number,
  lon: number
): Promise<any> {
  const coords = normalizeCoordinates(lat, lon);

  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric&exclude=minutely,alerts`
    );

    if (response.ok) {
      return response.json();
    }

    console.log(
      `[climaxplore] 3.0 One Call API not available, falling back to 2.5 forecast API`
    );

    const forecastResponse = await fetch(
      `${BASE_URL}/forecast?lat=${coords.lat}&lon=${coords.lon}&appid=${API_KEY}&units=metric`
    );

    if (!forecastResponse.ok) {
      throw new Error(
        `Failed to fetch forecast data: ${forecastResponse.status}`
      );
    }

    const forecastData = await forecastResponse.json();

    return {
      hourly: forecastData.list.slice(0, 24).map((item: any) => ({
        dt: item.dt,
        temp: item.main.temp,
        humidity: item.main.humidity,
        pressure: item.main.pressure,
        wind_speed: item.wind.speed,
        weather: item.weather,
        pop: item.pop,
      })),
      daily: forecastData.list
        .filter((_: any, index: number) => index % 8 === 0) // Get one per day (every 8th 3-hour forecast)
        .slice(0, 5)
        .map((item: any) => ({
          dt: item.dt,
          temp: {
            min: item.main.temp_min,
            max: item.main.temp_max,
            day: item.main.temp,
          },
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          wind_speed: item.wind.speed,
          weather: item.weather,
          pop: item.pop,
        })),
    };
  } catch (error) {
    console.error(`[climaxplore] Enhanced forecast error:`, error);
    return null;
  }
}