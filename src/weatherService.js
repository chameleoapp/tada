/**
 * Weather service for automatic weather forecast integration
 */

const WEATHER_CACHE_KEY = "tada_weather_cache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

/**
 * Get user's location using browser geolocation API
 */
export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    // Check if running in secure context (HTTPS or localhost)
    if (window.location.protocol !== 'https:' && 
        window.location.hostname !== 'localhost' && 
        window.location.hostname !== '127.0.0.1') {
      reject(new Error("Location access requires HTTPS. Please use a secure connection."));
      return;
    }

    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let errorMessage = "Location access denied";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied. Please enable location access in your browser settings.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = `Location error: ${error.message}`;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 5 * 60 * 1000, // Accept cached position up to 5 minutes old
      }
    );
  });
}

/**
 * Fetch weather data from Open-Meteo API (free, no API key required)
 */
export async function fetchWeatherData(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,precipitation,is_day&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }
    const data = await response.json();
    return parseWeatherData(data);
  } catch (error) {
    console.error("Failed to fetch weather:", error);
    throw error;
  }
}

/**
 * Parse Open-Meteo weather data into our app format
 */
function parseWeatherData(data) {
  const current = data.current;
  const temperature = Math.round(current.temperature_2m);
  const weatherCode = current.weather_code;
  const precipitation = current.precipitation || 0;

  // Map WMO weather codes to our sky conditions
  let skyCondition = "clear";
  
  // Snow conditions (71-77, 85-86)
  if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
    skyCondition = "snow";
  }
  // Rain conditions (51-67, 80-82)
  else if (
    (weatherCode >= 51 && weatherCode <= 67) ||
    (weatherCode >= 80 && weatherCode <= 82) ||
    precipitation > 0
  ) {
    skyCondition = "rain";
  }
  // Cloudy conditions (2-3)
  else if (weatherCode >= 2 && weatherCode <= 3) {
    skyCondition = "cloudy";
  }
  // Clear (0-1)
  else {
    skyCondition = "clear";
  }

  return {
    temperature,
    skyCondition,
    timestamp: Date.now(),
    location: {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
    },
  };
}

/**
 * Get cached weather data if still valid
 */
export function getCachedWeather() {
  try {
    const cached = localStorage.getItem(WEATHER_CACHE_KEY);
    if (!cached) return null;

    const data = JSON.parse(cached);
    const age = Date.now() - data.timestamp;

    if (age < CACHE_DURATION) {
      return data;
    }

    // Cache expired
    localStorage.removeItem(WEATHER_CACHE_KEY);
    return null;
  } catch (error) {
    console.error("Error reading weather cache:", error);
    return null;
  }
}

/**
 * Cache weather data
 */
export function cacheWeatherData(weatherData) {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(weatherData));
  } catch (error) {
    console.error("Error caching weather data:", error);
  }
}

/**
 * Get current weather automatically
 * Returns cached data if available, otherwise fetches fresh data
 */
export async function getCurrentWeather() {
  // Try cache first
  const cached = getCachedWeather();
  if (cached) {
    return cached;
  }

  // Get location and fetch weather
  const location = await getUserLocation();
  const weatherData = await fetchWeatherData(location.latitude, location.longitude);
  
  // Cache the result
  cacheWeatherData(weatherData);
  
  return weatherData;
}

/**
 * Format location for display
 */
export function formatLocation(weatherData) {
  if (!weatherData?.location) return "";
  const { latitude, longitude } = weatherData.location;
  return `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`;
}

/**
 * Clear weather cache (useful for testing or manual refresh)
 */
export function clearWeatherCache() {
  try {
    localStorage.removeItem(WEATHER_CACHE_KEY);
  } catch (error) {
    console.error("Error clearing weather cache:", error);
  }
}
