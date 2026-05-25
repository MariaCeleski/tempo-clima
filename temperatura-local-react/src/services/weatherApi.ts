import type { WeatherData, ForecastItem, ForecastDay, WeatherAlert } from '../types/weather';

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0';
const VIACEP_BASE_URL = 'https://viacep.com.br/ws';

/** Proxy base URL from environment variable. If set, requests go through the proxy first. */
const PROXY_BASE_URL = import.meta.env.VITE_API_PROXY_URL || '';

/** Timeout for proxy requests in milliseconds */
const PROXY_TIMEOUT_MS = 5000;

/**
 * Determines if a fetch error or response should trigger a fallback to direct API.
 * Fallback triggers: network errors, timeouts, and 5xx responses.
 */
function shouldFallback(error?: unknown, response?: Response): boolean {
  if (error) return true;
  if (response && response.status >= 500) return true;
  return false;
}

/**
 * Fetches from the proxy URL first (with 5s timeout). If the proxy fails
 * (timeout, network error, or 5xx), falls back to the direct URL.
 * If VITE_API_PROXY_URL is not set, goes directly to the direct URL.
 *
 * Returns the Response object from whichever source succeeds.
 */
export async function fetchWithFallback(
  proxyUrl: string,
  directUrl: string,
  options?: { timeout?: number }
): Promise<Response> {
  const timeout = options?.timeout ?? 10000;

  // If no proxy configured, go directly to the direct URL
  if (!PROXY_BASE_URL) {
    return fetch(directUrl, { signal: AbortSignal.timeout(timeout) });
  }

  // Try proxy first with 5s timeout
  try {
    const response = await fetch(proxyUrl, {
      signal: AbortSignal.timeout(PROXY_TIMEOUT_MS),
    });

    // If proxy returns 5xx, fall back to direct
    if (shouldFallback(undefined, response)) {
      return fetch(directUrl, { signal: AbortSignal.timeout(timeout) });
    }

    return response;
  } catch {
    // Proxy failed (timeout, network error, etc.) — fall back to direct
    return fetch(directUrl, { signal: AbortSignal.timeout(timeout) });
  }
}

/** Map of Brazilian state names to their abbreviations */
const BRAZILIAN_STATES: Record<string, string> = {
  'Acre': 'AC', 'Alagoas': 'AL', 'Amapá': 'AP', 'Amazonas': 'AM',
  'Bahia': 'BA', 'Ceará': 'CE', 'Distrito Federal': 'DF', 'Espírito Santo': 'ES',
  'Goiás': 'GO', 'Maranhão': 'MA', 'Mato Grosso': 'MT', 'Mato Grosso do Sul': 'MS',
  'Minas Gerais': 'MG', 'Pará': 'PA', 'Paraíba': 'PB', 'Paraná': 'PR',
  'Pernambuco': 'PE', 'Piauí': 'PI', 'Rio de Janeiro': 'RJ',
  'Rio Grande do Norte': 'RN', 'Rio Grande do Sul': 'RS', 'Rondônia': 'RO',
  'Roraima': 'RR', 'Santa Catarina': 'SC', 'São Paulo': 'SP', 'Sergipe': 'SE',
  'Tocantins': 'TO',
};

function getStateAbbreviation(stateName: string): string {
  return BRAZILIAN_STATES[stateName] || stateName;
}

interface OpenWeatherMapResponse {
  name: string;
  coord: {
    lat: number;
    lon: number;
  };
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
    country: string;
  };
  timezone: number;
}

interface GeocodingResponse {
  name: string;
  state?: string;
  country: string;
}

interface ForecastApiResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      feels_like: number;
      humidity: number;
    };
    weather: Array<{ description: string; icon: string }>;
    wind: { speed: number };
  }>;
}

interface ViaCepResponse {
  localidade?: string;
  erro?: boolean;
}

/**
 * Rounds a number to one decimal place.
 */
export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * Converts i18n language code to OpenWeatherMap lang parameter.
 */
export function getApiLang(i18nLang: string): string {
  if (i18nLang.startsWith('pt')) return 'pt_br';
  if (i18nLang.startsWith('es')) return 'es';
  return 'en';
}

/**
 * Builds the icon URL from an icon code.
 */
export function buildIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}

/**
 * Validates user input. Returns an error message if invalid, or null if valid.
 */
export function validateInput(input: string): string | null {
  if (input.trim().length === 0) {
    return 'Digite o nome de uma cidade';
  }
  return null;
}

/**
 * Sanitizes user input by truncating to 100 characters if needed.
 */
export function sanitizeInput(input: string): string {
  if (input.length > 100) {
    return input.slice(0, 100);
  }
  return input;
}

/**
 * Transforms raw OpenWeatherMap API response into WeatherData.
 */
export function transformApiResponse(data: OpenWeatherMapResponse, state?: string): WeatherData {
  return {
    city_name: data.name,
    state: state || '',
    country: data.sys.country || '',
    lat: data.coord.lat,
    lon: data.coord.lon,
    temperature: roundToOneDecimal(data.main.temp),
    feels_like: roundToOneDecimal(data.main.feels_like),
    description: data.weather[0].description,
    humidity: data.main.humidity,
    wind_speed: roundToOneDecimal(data.wind.speed),
    icon_code: data.weather[0].icon,
    icon_url: buildIconUrl(data.weather[0].icon),
    sunrise: data.sys.sunrise,
    sunset: data.sys.sunset,
    timezone: data.timezone,
  };
}

/**
 * Fetches state/region info via reverse geocoding.
 */
async function fetchStateByCoords(lat: number, lon: number): Promise<string> {
  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    const directUrl = `${GEO_BASE_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const proxyUrl = PROXY_BASE_URL ? `${PROXY_BASE_URL}/api/geocode/reverse?lat=${lat}&lon=${lon}` : '';

    const response = await fetchWithFallback(proxyUrl, directUrl, { timeout: 5000 });

    if (!response.ok) return '';

    const data: GeocodingResponse[] = await response.json();
    if (data.length > 0 && data[0].state) {
      return getStateAbbreviation(data[0].state);
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Builds the API URL for a given city name.
 */
export function buildApiUrl(city: string, lang: string = 'pt_br'): string {
  const apiKey = import.meta.env.VITE_API_KEY;
  return `${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${lang}`;
}

/**
 * Fetches weather data for a given city from OpenWeatherMap API.
 */
export async function fetchWeather(city: string, lang: string = 'pt_br'): Promise<WeatherData> {
  const directUrl = buildApiUrl(city, lang);
  const proxyUrl = PROXY_BASE_URL
    ? `${PROXY_BASE_URL}/api/weather?q=${encodeURIComponent(city)}&units=metric&lang=${lang}`
    : '';

  const response = await fetchWithFallback(proxyUrl, directUrl, { timeout: 10000 });

  if (response.status === 404) {
    throw new Error(`Cidade '${city}' não encontrada. Verifique a ortografia.`);
  }

  if (response.status >= 500) {
    throw new Error('Dados climáticos temporariamente indisponíveis. Tente mais tarde.');
  }

  if (!response.ok) {
    throw new Error('Erro inesperado. Tente novamente.');
  }

  const data: OpenWeatherMapResponse = await response.json();

  // Fetch state info via reverse geocoding using the city's coordinates
  const state = await fetchStateByCoords(data.coord.lat, data.coord.lon);

  return transformApiResponse(data, state);
}

/**
 * Fetches weather data by geographic coordinates.
 */
export async function fetchWeatherByCoords(lat: number, lon: number, lang: string = 'pt_br'): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_API_KEY;
  const directUrl = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}`;
  const proxyUrl = PROXY_BASE_URL
    ? `${PROXY_BASE_URL}/api/weather?lat=${lat}&lon=${lon}&units=metric&lang=${lang}`
    : '';

  const response = await fetchWithFallback(proxyUrl, directUrl, { timeout: 10000 });

  if (!response.ok) {
    throw new Error('Não foi possível obter o clima da sua localização.');
  }

  const data: OpenWeatherMapResponse = await response.json();

  // Fetch state info via reverse geocoding
  const state = await fetchStateByCoords(lat, lon);

  return transformApiResponse(data, state);
}

/**
 * Parses forecast API response into ForecastDay array.
 */
function parseForecastResponse(data: ForecastApiResponse): ForecastDay[] {
  const dayMap = new Map<string, ForecastItem[]>();

  for (const item of data.list) {
    // Use local date for grouping (not UTC) so days align with user's timezone
    const date = new Date(item.dt * 1000);
    const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const forecastItem: ForecastItem = {
      dt: item.dt,
      temperature: roundToOneDecimal(item.main.temp),
      temp_min: roundToOneDecimal(item.main.temp_min),
      temp_max: roundToOneDecimal(item.main.temp_max),
      feels_like: roundToOneDecimal(item.main.feels_like),
      humidity: item.main.humidity,
      wind_speed: roundToOneDecimal(item.wind.speed),
      description: item.weather[0].description,
      icon_code: item.weather[0].icon,
      icon_url: buildIconUrl(item.weather[0].icon),
    };

    if (!dayMap.has(dateKey)) {
      dayMap.set(dateKey, []);
    }
    dayMap.get(dateKey)!.push(forecastItem);
  }

  // Use local date for "today" filter (not UTC)
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return Array.from(dayMap.entries())
    .filter(([key]) => key !== today)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 5)
    .map(([dateKey, periods]) => {
      // Find the period closest to noon as representative
      const noonPeriod = periods.reduce((best, current) => {
        const bestHour = new Date(best.dt * 1000).getHours();
        const currentHour = new Date(current.dt * 1000).getHours();
        return Math.abs(currentHour - 12) < Math.abs(bestHour - 12) ? current : best;
      });

      const tempMin = Math.min(...periods.map((p) => p.temp_min));
      const tempMax = Math.max(...periods.map((p) => p.temp_max));

      return {
        date: dateKey,
        dt: noonPeriod.dt,
        temperature: noonPeriod.temperature,
        temp_min: roundToOneDecimal(tempMin),
        temp_max: roundToOneDecimal(tempMax),
        description: noonPeriod.description,
        icon_code: noonPeriod.icon_code,
        icon_url: noonPeriod.icon_url,
        periods,
      };
    });
}

/**
 * Fetches forecast for a given city.
 * Returns all available days (up to 5) with detailed 3h periods.
 */
export async function fetchForecast(city: string, lang: string = 'pt_br'): Promise<ForecastDay[]> {
  const apiKey = import.meta.env.VITE_API_KEY;
  const directUrl = `${FORECAST_BASE_URL}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=${lang}`;
  const proxyUrl = PROXY_BASE_URL
    ? `${PROXY_BASE_URL}/api/forecast?q=${encodeURIComponent(city)}&units=metric&lang=${lang}`
    : '';

  const response = await fetchWithFallback(proxyUrl, directUrl, { timeout: 10000 });

  if (!response.ok) {
    return [];
  }

  const data: ForecastApiResponse = await response.json();
  return parseForecastResponse(data);
}

/**
 * Fetches forecast by coordinates.
 */
export async function fetchForecastByCoords(lat: number, lon: number, lang: string = 'pt_br'): Promise<ForecastDay[]> {
  const apiKey = import.meta.env.VITE_API_KEY;
  const directUrl = `${FORECAST_BASE_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=${lang}`;
  const proxyUrl = PROXY_BASE_URL
    ? `${PROXY_BASE_URL}/api/forecast?lat=${lat}&lon=${lon}&units=metric&lang=${lang}`
    : '';

  const response = await fetchWithFallback(proxyUrl, directUrl, { timeout: 10000 });

  if (!response.ok) {
    return [];
  }

  const data: ForecastApiResponse = await response.json();
  return parseForecastResponse(data);
}

/**
 * Validates CEP input. Returns an error message if invalid, or null if valid.
 */
export function validateCep(cep: string): string | null {
  const cleanCep = cep.replace(/\D/g, '');

  if (cleanCep.length === 0) {
    return 'Digite um CEP para buscar.';
  }

  if (cleanCep.length < 8) {
    return 'CEP incompleto. Digite os 8 dígitos (ex: 01001-000).';
  }

  if (cleanCep.length > 8) {
    return 'CEP inválido. O CEP deve ter exatamente 8 dígitos.';
  }

  return null;
}

/**
 * Looks up a city name from a Brazilian CEP using ViaCEP API.
 */
export async function fetchCityByCep(cep: string): Promise<string> {
  const cleanCep = cep.replace(/\D/g, '');

  if (cleanCep.length !== 8) {
    throw new Error('CEP inválido. Digite um CEP com 8 dígitos.');
  }

  const directUrl = `${VIACEP_BASE_URL}/${cleanCep}/json/`;
  const proxyUrl = PROXY_BASE_URL ? `${PROXY_BASE_URL}/api/cep/${cleanCep}` : '';

  const response = await fetchWithFallback(proxyUrl, directUrl, { timeout: 10000 });

  if (!response.ok) {
    throw new Error('Não foi possível consultar o CEP. Tente novamente.');
  }

  const data: ViaCepResponse = await response.json();

  if (data.erro) {
    throw new Error(`CEP '${cep}' não encontrado. Verifique se o CEP está correto.`);
  }

  if (!data.localidade) {
    throw new Error('Cidade não encontrada para este CEP.');
  }

  return data.localidade;
}

/**
 * Returns a clothing suggestion based on temperature.
 */
export function getClothingSuggestion(temperature: number): string {
  if (temperature <= 5) {
    return 'clothing.freezing';
  } else if (temperature <= 14) {
    return 'clothing.cold';
  } else if (temperature <= 19) {
    return 'clothing.cool';
  } else if (temperature <= 25) {
    return 'clothing.pleasant';
  } else if (temperature <= 32) {
    return 'clothing.warm';
  } else {
    return 'clothing.hot';
  }
}

/**
 * Converts Celsius to Fahrenheit, rounded to 1 decimal.
 */
export function celsiusToFahrenheit(celsius: number): number {
  return roundToOneDecimal(celsius * 9 / 5 + 32);
}

/**
 * Formats temperature with unit symbol.
 */
export function formatTemperature(celsius: number, unit: 'C' | 'F'): string {
  if (unit === 'F') {
    return `${celsiusToFahrenheit(celsius)}°F`;
  }
  return `${celsius}°C`;
}

/**
 * Fetches Air Quality Index for given coordinates.
 * Returns AQI on 1-5 scale, or null if unavailable.
 */
export async function fetchAirQuality(lat: number, lon: number): Promise<number | null> {
  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    const directUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    const proxyUrl = PROXY_BASE_URL ? `${PROXY_BASE_URL}/api/air-quality?lat=${lat}&lon=${lon}` : '';

    const response = await fetchWithFallback(proxyUrl, directUrl, { timeout: 5000 });
    if (!response.ok) return null;

    const data = await response.json();
    return data?.list?.[0]?.main?.aqi ?? null;
  } catch {
    return null;
  }
}


/**
 * Generates synthetic weather alerts based on current weather data.
 * Used as a fallback since the free API tier may not include alerts.
 */
export function generateAlerts(data: WeatherData): WeatherAlert[] {
  const alerts: WeatherAlert[] = [];

  if (data.temperature > 38) {
    alerts.push({
      event: 'Calor extremo',
      description: `Temperatura atual de ${data.temperature}°C. Risco de insolação e desidratação. Mantenha-se hidratado e evite exposição ao sol.`,
      severity: 'severe',
    });
  }

  if (data.temperature < -5) {
    alerts.push({
      event: 'Frio extremo',
      description: `Temperatura atual de ${data.temperature}°C. Risco de hipotermia. Use roupas adequadas e evite exposição prolongada ao frio.`,
      severity: 'severe',
    });
  }

  if (data.wind_speed > 15) {
    alerts.push({
      event: 'Ventos fortes',
      description: `Velocidade do vento de ${data.wind_speed} m/s. Cuidado com objetos soltos e estruturas frágeis.`,
      severity: 'moderate',
    });
  }

  if (data.description.toLowerCase().includes('thunderstorm') || data.description.toLowerCase().includes('trovoada')) {
    alerts.push({
      event: 'Tempestade',
      description: 'Condições de tempestade detectadas. Evite áreas abertas e procure abrigo.',
      severity: 'moderate',
    });
  }

  if (data.humidity > 90) {
    alerts.push({
      event: 'Umidade elevada',
      description: `Umidade relativa de ${data.humidity}%. Pode causar desconforto respiratório em pessoas sensíveis.`,
      severity: 'low',
    });
  }

  return alerts;
}

/**
 * Fetches weather alerts from the OpenWeatherMap One Call API 3.0.
 * Falls back to generating synthetic alerts from standard weather data.
 */
export async function fetchWeatherAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,daily&appid=${apiKey}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

    if (!response.ok) return [];

    const data = await response.json();

    if (data.alerts && Array.isArray(data.alerts) && data.alerts.length > 0) {
      return data.alerts.map((alert: { event: string; description: string; start: number; end: number }) => {
        const severity: WeatherAlert['severity'] =
          alert.event.toLowerCase().includes('extreme') || alert.event.toLowerCase().includes('warning')
            ? 'severe'
            : alert.event.toLowerCase().includes('watch') || alert.event.toLowerCase().includes('advisory')
              ? 'moderate'
              : 'low';

        return {
          event: alert.event,
          description: alert.description,
          severity,
          start: alert.start,
          end: alert.end,
        };
      });
    }

    return [];
  } catch {
    return [];
  }
}

/**
 * Estimates a synthetic UV index based on weather conditions and time of day.
 * Uses the sun position (relative to solar noon) and weather condition to approximate UV.
 *
 * @param data - Current weather data including sunrise, sunset, timezone, and icon_code
 * @returns Estimated UV index (0-11 scale)
 */
export function estimateUVIndex(data: WeatherData): number {
  const now = Math.floor(Date.now() / 1000);
  const localNow = now + data.timezone;
  const localSunrise = data.sunrise + data.timezone;
  const localSunset = data.sunset + data.timezone;

  // Nighttime: UV is 0
  if (localNow < localSunrise || localNow > localSunset) {
    return 0;
  }

  // Calculate solar noon and time-of-day factor (peaks at solar noon)
  const solarNoon = (localSunrise + localSunset) / 2;
  const halfDay = (localSunset - localSunrise) / 2;
  const distanceFromNoon = Math.abs(localNow - solarNoon);
  const timeFactor = Math.max(0, 1 - (distanceFromNoon / halfDay));

  // Base UV from weather condition (icon_code from OpenWeatherMap)
  const icon = data.icon_code.replace(/[dn]$/, ''); // Remove day/night suffix
  let conditionBase: number;

  switch (icon) {
    case '01': // clear sky
      conditionBase = 10;
      break;
    case '02': // few clouds
      conditionBase = 8;
      break;
    case '03': // scattered clouds
      conditionBase = 6;
      break;
    case '04': // broken/overcast clouds
      conditionBase = 4;
      break;
    case '09': // shower rain
    case '10': // rain
    case '11': // thunderstorm
      conditionBase = 2;
      break;
    case '13': // snow
    case '50': // mist/fog
      conditionBase = 1;
      break;
    default:
      conditionBase = 5;
  }

  // UV = condition base × time factor, rounded to nearest integer
  const uv = Math.round(conditionBase * timeFactor);
  return Math.min(11, Math.max(0, uv));
}
