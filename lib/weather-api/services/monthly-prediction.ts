import type { MonthlyPrediction } from '../types';
import { addMonths, format, normalizeCoordinates } from '../utils';
import { getCurrentWeather } from './current-weather';
import { getHistoricalWeather } from './historical-weather';

export async function getMonthlyPrediction(
  lat: number,
  lon: number,
  monthOffset: number
): Promise<MonthlyPrediction> {
  const coords = normalizeCoordinates(lat, lon);
  console.log(
    `[climaxplore] Generating monthly prediction for ${monthOffset} month(s) ahead`
  );

  try {
    // Get current weather and historical data to establish patterns
    const [currentWeather, historicalData] = await Promise.all([
      getCurrentWeather(coords.lat, coords.lon),
      getHistoricalWeather(coords.lat, coords.lon, 30), // Get 30 days of historical data
    ]);

    // Calculate historical averages
    const historicalAvgTemp =
      historicalData.reduce((sum, day) => sum + day.temp, 0) /
      historicalData.length;
    const historicalAvgWind =
      historicalData.reduce((sum, day) => sum + day.wind_speed, 0) /
      historicalData.length;
    const historicalAvgHumidity =
      historicalData.reduce((sum, day) => sum + day.humidity, 0) /
      historicalData.length;

    const targetDate = addMonths(new Date(), monthOffset);
    const targetMonth = targetDate.getMonth();
    const currentMonth = new Date().getMonth();

    // Determine hemisphere based on latitude
    const isNorthernHemisphere = coords.lat >= 0;

    // Enhanced seasonal temperature adjustment with hemisphere awareness
    let tempAdjustment = 0;
    let seasonalWindFactor = 1.0;
    let seasonalHumidityAdjustment = 0;

    // Define seasonal patterns based on hemisphere
    if (isNorthernHemisphere) {
      // Northern Hemisphere: Summer (Jun-Aug), Winter (Dec-Feb)
      if (targetMonth >= 5 && targetMonth <= 7) {
        // Summer
        tempAdjustment = 5 + Math.random() * 3; // +5 to +8°C
        seasonalWindFactor = 0.8; // Calmer winds
        seasonalHumidityAdjustment = 5 + Math.random() * 10; // Higher humidity
      } else if (targetMonth >= 11 || targetMonth <= 1) {
        // Winter
        tempAdjustment = -5 - Math.random() * 3; // -5 to -8°C
        seasonalWindFactor = 1.3; // Stronger winds
        seasonalHumidityAdjustment = -5 - Math.random() * 10; // Lower humidity
      } else if (targetMonth >= 2 && targetMonth <= 4) {
        // Spring
        tempAdjustment = -1 + Math.random() * 4; // -1 to +3°C
        seasonalWindFactor = 1.1; // Slightly windier
        seasonalHumidityAdjustment = Math.random() * 5; // Moderate humidity
      } else {
        // Fall
        tempAdjustment = 2 - Math.random() * 4; // -2 to +2°C
        seasonalWindFactor = 1.1; // Slightly windier
        seasonalHumidityAdjustment = -Math.random() * 5; // Slightly lower humidity
      }
    } else {
      // Southern Hemisphere: Summer (Dec-Feb), Winter (Jun-Aug)
      if (targetMonth >= 11 || targetMonth <= 1) {
        // Summer
        tempAdjustment = 5 + Math.random() * 3;
        seasonalWindFactor = 0.8;
        seasonalHumidityAdjustment = 5 + Math.random() * 10;
      } else if (targetMonth >= 5 && targetMonth <= 7) {
        // Winter
        tempAdjustment = -5 - Math.random() * 3;
        seasonalWindFactor = 1.3;
        seasonalHumidityAdjustment = -5 - Math.random() * 10;
      } else if (targetMonth >= 8 && targetMonth <= 10) {
        // Spring
        tempAdjustment = -1 + Math.random() * 4;
        seasonalWindFactor = 1.1;
        seasonalHumidityAdjustment = Math.random() * 5;
      } else {
        // Fall
        tempAdjustment = 2 - Math.random() * 4;
        seasonalWindFactor = 1.1;
        seasonalHumidityAdjustment = -Math.random() * 5;
      }
    }

    // Add uncertainty factor for longer-range predictions
    const uncertaintyFactor = 1 + (monthOffset / 12) * 0.3; // Up to 30% more variation for 12-month predictions
    tempAdjustment *= uncertaintyFactor;

    // Calculate predicted monthly averages
    const predictedAvgTemp = historicalAvgTemp + tempAdjustment;
    const predictedMinTemp =
      predictedAvgTemp - (5 + Math.random() * 2) * uncertaintyFactor;
    const predictedMaxTemp =
      predictedAvgTemp + (5 + Math.random() * 2) * uncertaintyFactor;
    const predictedAvgWind = Math.max(
      0,
      historicalAvgWind * seasonalWindFactor + (Math.random() - 0.5) * 1
    );
    const predictedAvgHumidity = Math.max(
      30,
      Math.min(
        85,
        historicalAvgHumidity +
          seasonalHumidityAdjustment +
          (Math.random() - 0.5) * 10
      )
    );

    // Estimate precipitation and sunny days with seasonal variation
    let basePrecipitationDays = 8;
    if (targetMonth >= 2 && targetMonth <= 4) {
      basePrecipitationDays = 10; // Spring tends to be wetter
    } else if (targetMonth >= 5 && targetMonth <= 7) {
      basePrecipitationDays = 6; // Summer tends to be drier (Northern Hemisphere)
    }

    const precipitationDays = Math.round(
      basePrecipitationDays + Math.random() * 8
    ); // Variation
    const sunnyDays = Math.max(
      5,
      30 - precipitationDays - Math.round(Math.random() * 5)
    );

    // Generate weekly breakdown
    const weeklyData = [];
    for (let week = 0; week < 4; week++) {
      const weekTempVariation = (Math.random() - 0.5) * 6 * uncertaintyFactor;
      const weekPrecipitation = Math.random() * 0.4 + 0.1; // 10-50%
      const weekWind = predictedAvgWind + (Math.random() - 0.5) * 2;

      let condition = 'Partly Cloudy';
      if (weekPrecipitation > 0.35) condition = 'Rainy';
      else if (weekPrecipitation < 0.15) condition = 'Sunny';
      else if (Math.random() > 0.7) condition = 'Cloudy';

      weeklyData.push({
        week: week + 1,
        avgTemp: predictedAvgTemp + weekTempVariation,
        precipitation: weekPrecipitation,
        wind: weekWind,
        condition,
      });
    }

    // Calculate activity suitability score (simplified)
    let activityScore = 70; // Base score

    // Adjust based on temperature
    if (predictedAvgTemp >= 15 && predictedAvgTemp <= 25) {
      activityScore += 15;
    } else if (predictedAvgTemp >= 10 && predictedAvgTemp <= 30) {
      activityScore += 5;
    } else if (predictedAvgTemp < 0 || predictedAvgTemp > 35) {
      activityScore -= 20;
    } else {
      activityScore -= 10;
    }

    // Adjust based on precipitation
    if (precipitationDays < 8) {
      activityScore += 10;
    } else if (precipitationDays > 15) {
      activityScore -= 15;
    }

    // Adjust based on wind
    if (predictedAvgWind < 5) {
      activityScore += 5;
    } else if (predictedAvgWind > 10) {
      activityScore -= 10;
    }

    // Reduce confidence for longer-range predictions
    if (monthOffset > 6) {
      activityScore = Math.round(activityScore * 0.9); // 10% reduction for 7-12 month predictions
    }

    activityScore = Math.max(0, Math.min(100, activityScore));

    // Estimate optimal days
    const optimalDays = Math.round((activityScore / 100) * 20); // 0-20 optimal days

    // Generate pattern description with uncertainty acknowledgment
    let pattern = '';

    if (monthOffset > 6) {
      pattern = 'Long-range prediction (reduced confidence): ';
    }

    if (tempAdjustment > 3) {
      pattern +=
        'Significantly warmer than average temperatures expected with ';
    } else if (tempAdjustment > 1) {
      pattern += 'Warmer than average temperatures expected with ';
    } else if (tempAdjustment < -3) {
      pattern +=
        'Significantly cooler than average temperatures expected with ';
    } else if (tempAdjustment < -1) {
      pattern += 'Cooler than average temperatures expected with ';
    } else {
      pattern += 'Near-average temperatures expected with ';
    }

    if (precipitationDays > 15) {
      pattern += 'significantly above-average rainfall throughout the month.';
    } else if (precipitationDays > 12) {
      pattern += 'above-average rainfall throughout the month.';
    } else if (precipitationDays < 6) {
      pattern +=
        'significantly below-average rainfall and mostly dry conditions.';
    } else if (precipitationDays < 8) {
      pattern += 'below-average rainfall and mostly dry conditions.';
    } else {
      pattern += 'typical precipitation patterns for this time of year.';
    }

    // Generate recommendations
    const recommendations = [];

    if (monthOffset > 6) {
      recommendations.push(
        'Note: Long-range predictions have higher uncertainty - check closer to date'
      );
    }

    if (predictedAvgTemp > 30) {
      recommendations.push(
        'Expect very hot conditions - plan activities during cooler hours'
      );
      recommendations.push(
        'Ensure adequate hydration and sun protection measures'
      );
    } else if (predictedAvgTemp > 25) {
      recommendations.push(
        'Plan activities during cooler morning or evening hours'
      );
      recommendations.push('Ensure adequate hydration and sun protection');
    } else if (predictedAvgTemp < 5) {
      recommendations.push(
        'Expect very cold conditions - dress in multiple warm layers'
      );
      recommendations.push(
        'Consider indoor alternatives during coldest periods'
      );
    } else if (predictedAvgTemp < 10) {
      recommendations.push('Dress in warm layers for outdoor activities');
      recommendations.push('Monitor weather closely as conditions approach');
    } else {
      recommendations.push(
        'Excellent temperature range for most outdoor activities'
      );
    }

    if (precipitationDays > 15) {
      recommendations.push(
        'Expect frequent rain - have backup indoor plans ready'
      );
      recommendations.push('Waterproof gear essential for outdoor activities');
    } else if (precipitationDays > 12) {
      recommendations.push('Have backup indoor plans ready for rainy days');
      recommendations.push(
        'Waterproof gear recommended for outdoor activities'
      );
    } else if (precipitationDays < 6) {
      recommendations.push(
        'Excellent dry conditions expected for outdoor planning'
      );
    } else {
      recommendations.push(
        'Generally favorable conditions for outdoor planning'
      );
    }

    if (predictedAvgWind > 12) {
      recommendations.push(
        'Expect strong winds - avoid exposed areas and secure equipment'
      );
    } else if (predictedAvgWind > 8) {
      recommendations.push(
        'Be prepared for windy conditions, especially in exposed areas'
      );
    }

    return {
      month: format(targetDate, 'MMMM yyyy'),
      avgTemp: {
        min: predictedMinTemp,
        max: predictedMaxTemp,
        avg: predictedAvgTemp,
      },
      avgWind: predictedAvgWind,
      avgHumidity: predictedAvgHumidity,
      precipitationDays,
      sunnyDays,
      weeklyData,
      activityScore,
      optimalDays,
      pattern,
      recommendations,
    };
  } catch (error) {
    console.error(`[climaxplore] Error generating monthly prediction:`, error);
    throw error;
  }
}