import type { WeatherData, ForecastItem, ForecastDay, WeatherAlert } from '../types/weather';

const API_BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';
const FORECAST_BASE_URL = 'https://api.openweathermap.org/data/2.5/forecast';
const GEO_BASE_URL = 'https://api.openweathermap.org/geo/1.0';
const VIACEP_BASE_URL = 'https://viacep.com.br/ws';

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
    const url = `${GEO_BASE_URL}/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });

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
export function buildApiUrl(city: string): string {
  const apiKey = import.meta.env.VITE_API_KEY;
  return `${API_BASE_URL}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;
}

/**
 * Fetches weather data for a given city from OpenWeatherMap API.
 */
export async function fetchWeather(city: string): Promise<WeatherData> {
  const url = buildApiUrl(city);

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });

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
export async function fetchWeatherByCoords(lat: number, lon: number): Promise<WeatherData> {
  const apiKey = import.meta.env.VITE_API_KEY;
  const url = `${API_BASE_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });

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
    const date = new Date(item.dt * 1000);
    const dateKey = date.toISOString().slice(0, 10);

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

  const today = new Date().toISOString().slice(0, 10);

  return Array.from(dayMap.entries())
    .filter(([key]) => key !== today)
    .map(([dateKey, periods]) => {
      // Find the period closest to noon as representative
      const noonPeriod = periods.reduce((best, current) => {
        const bestHour = new Date(best.dt * 1000).getUTCHours();
        const currentHour = new Date(current.dt * 1000).getUTCHours();
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
export async function fetchForecast(city: string): Promise<ForecastDay[]> {
  const apiKey = import.meta.env.VITE_API_KEY;
  const url = `${FORECAST_BASE_URL}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric&lang=pt_br`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    return [];
  }

  const data: ForecastApiResponse = await response.json();
  return parseForecastResponse(data);
}

/**
 * Fetches forecast by coordinates.
 */
export async function fetchForecastByCoords(lat: number, lon: number): Promise<ForecastDay[]> {
  const apiKey = import.meta.env.VITE_API_KEY;
  const url = `${FORECAST_BASE_URL}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=pt_br`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });

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

  const url = `${VIACEP_BASE_URL}/${cleanCep}/json/`;

  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
  });

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
    return '🧥 Vista casaco pesado, luvas e cachecol!';
  } else if (temperature <= 14) {
    return '🧤 Leve um casaco ou jaqueta.';
  } else if (temperature <= 19) {
    return '👕 Uma blusa de manga longa é ideal.';
  } else if (temperature <= 25) {
    return '😎 Roupa leve, está agradável!';
  } else if (temperature <= 32) {
    return '☀️ Roupa leve e protetor solar!';
  } else {
    return '🥵 Muito quente! Hidrate-se bastante.';
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
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
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
