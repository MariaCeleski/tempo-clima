import type { WeatherData } from '../types/weather';
import { getClothingSuggestion, formatTemperature } from '../services/weatherApi';
import { LocalClock } from './LocalClock';
import { AirQuality } from './AirQuality';

interface WeatherCardProps {
  data: WeatherData;
  unit?: 'C' | 'F';
  airQuality?: number | null;
}

function formatTime(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function WeatherCard({ data, unit = 'C', airQuality }: WeatherCardProps) {
  const suggestion = getClothingSuggestion(data.temperature);

  return (
    <div className="animate-fadeInUp rounded-2xl border border-white/25 bg-white/10 p-6 backdrop-blur-md">
      <h2 className="mb-1 text-center text-2xl font-bold text-white">
        {data.city_name}
      </h2>
      {(data.state || data.country) && (
        <p className="mb-4 text-center text-sm text-white/60">
          {[data.state, data.country].filter(Boolean).join(' — ')}
        </p>
      )}

      <div className="flex flex-col items-center gap-4">
        <img
          src={data.icon_url}
          alt={data.description}
          className="animate-float h-24 w-24"
        />

        <div className="grid w-full gap-3 text-center">
          <p className="text-3xl font-bold text-pink-300">
            {formatTemperature(data.temperature, unit)}
          </p>
          <p className="text-sm text-white/60">
            Sensação: {formatTemperature(data.feels_like, unit)}
          </p>
          <p className="text-lg capitalize text-purple-300">
            {data.description}
          </p>

          <div className="flex justify-center gap-6">
            <p className="text-emerald-300">
              💧 {data.humidity}%
            </p>
            <p className="text-blue-300">
              💨 {data.wind_speed} m/s
            </p>
          </div>

          <div className="flex justify-center gap-6 text-sm text-white/70">
            <p>🌅 {formatTime(data.sunrise, data.timezone)}</p>
            <p>🌇 {formatTime(data.sunset, data.timezone)}</p>
          </div>

          <LocalClock timezone={data.timezone} />

          {airQuality != null && <AirQuality aqi={airQuality} />}

          <div className="mt-2 rounded-lg bg-white/5 px-3 py-2 text-sm text-amber-200">
            {suggestion}
          </div>
        </div>
      </div>
    </div>
  );
}
