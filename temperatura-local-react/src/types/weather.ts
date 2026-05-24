export interface WeatherData {
  city_name: string;
  state: string;        // ex: "Santa Catarina" ou sigla "SC"
  country: string;      // ex: "BR"
  lat: number;
  lon: number;
  temperature: number;
  description: string;
  humidity: number;
  wind_speed: number;
  icon_code: string;
  icon_url: string;
  feels_like: number;
  sunrise: number;    // unix timestamp
  sunset: number;     // unix timestamp
  timezone: number;   // offset in seconds from UTC
}

export interface ForecastItem {
  dt: number;           // unix timestamp
  temperature: number;
  temp_min: number;
  temp_max: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon_code: string;
  icon_url: string;
}

export interface ForecastDay {
  date: string;         // YYYY-MM-DD
  dt: number;           // representative timestamp (noon)
  temperature: number;  // noon temperature
  temp_min: number;     // min of the day
  temp_max: number;     // max of the day
  description: string;  // noon description
  icon_code: string;
  icon_url: string;
  periods: ForecastItem[];  // all 3h periods for this day
}

export interface WeatherAlert {
  event: string;
  description: string;
  severity: 'low' | 'moderate' | 'severe';
  start?: number;
  end?: number;
}

export interface ApiError {
  message: string;
}
