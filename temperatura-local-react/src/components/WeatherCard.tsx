import { useTranslation } from 'react-i18next';
import type { WeatherData } from '../types/weather';
import { getClothingSuggestion, formatTemperature, estimateUVIndex } from '../services/weatherApi';
import { LocalClock } from './LocalClock';
import { AirQuality } from './AirQuality';
import { UVIndex } from './UVIndex';

interface WeatherCardProps {
  data: WeatherData;
  unit?: 'C' | 'F';
  airQuality?: number | null;
  tempMin?: number | null;
  tempMax?: number | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

function formatTime(timestamp: number, timezone: number): string {
  const date = new Date((timestamp + timezone) * 1000);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function WeatherCard({ data, unit = 'C', airQuality, tempMin, tempMax, isFavorite = false, onToggleFavorite }: WeatherCardProps) {
  const { t } = useTranslation();
  const suggestion = getClothingSuggestion(data.temperature);

  // Show UV only during daytime
  const now = Math.floor(Date.now() / 1000);
  const isDaytime = now >= data.sunrise && now <= data.sunset;
  const uvIndex = isDaytime ? estimateUVIndex(data) : null;

  return (
    <article className="animate-fadeInUp rounded-2xl border border-slate-200 dark:border-white/25 bg-white/80 dark:bg-white/10 p-6 shadow-lg dark:shadow-none backdrop-blur-md" aria-label={t('weather.currentAria', { city: data.city_name })}>
      <div className="mb-1 flex items-center justify-center gap-2">
        <h2 className="text-center text-2xl font-bold text-slate-900 dark:text-white">
          {data.city_name}
        </h2>
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={`text-xl transition-colors ${isFavorite ? 'text-amber-400' : 'text-slate-300 dark:text-white/30 hover:text-amber-400 dark:hover:text-amber-400'}`}
            aria-label={isFavorite ? t('favorites.removeAria', { city: data.city_name }) : t('favorites.addAria', { city: data.city_name })}
            aria-pressed={isFavorite}
          >
            {isFavorite ? '★' : '☆'}
          </button>
        )}
      </div>
      {(data.state || data.country) && (
        <p className="mb-4 text-center text-sm text-slate-500 dark:text-white/60">
          {[data.state, data.country].filter(Boolean).join(' — ')}
        </p>
      )}

      <div className="flex flex-col items-center gap-4">
        <img
          src={data.icon_url}
          alt={t('weather.conditionAlt', { description: data.description })}
          className="animate-float h-24 w-24"
        />

        <div className="grid w-full gap-3 text-center">
          <p className="text-3xl font-bold text-pink-600 dark:text-pink-300" aria-label={t('weather.temperatureAria', { temp: formatTemperature(data.temperature, unit) })}>
            {formatTemperature(data.temperature, unit)}
          </p>
          {tempMin != null && tempMax != null && (
            <div className="flex justify-center gap-4 text-sm">
              <span className="text-blue-500 dark:text-blue-300" aria-label={`Mínima: ${formatTemperature(tempMin, unit)}`}>
                ↓ {formatTemperature(tempMin, unit)}
              </span>
              <span className="text-rose-500 dark:text-pink-300" aria-label={`Máxima: ${formatTemperature(tempMax, unit)}`}>
                ↑ {formatTemperature(tempMax, unit)}
              </span>
            </div>
          )}
          <p className="text-sm text-slate-500 dark:text-white/60">
            {t('weather.feelsLike', { temp: formatTemperature(data.feels_like, unit) })}
          </p>
          <p className="text-lg capitalize text-purple-600 dark:text-purple-300">
            {data.description}
          </p>

          <div className="flex justify-center gap-6">
            <p className="text-emerald-600 dark:text-emerald-300" aria-label={t('weather.humidity', { value: data.humidity })}>
              💧 {data.humidity}%
            </p>
            <p className="text-blue-600 dark:text-blue-300" aria-label={t('weather.wind', { value: data.wind_speed })}>
              💨 {data.wind_speed} m/s
            </p>
          </div>

          <div className="flex justify-center gap-6 text-sm text-slate-600 dark:text-white/70">
            <p aria-label={t('weather.sunrise', { time: formatTime(data.sunrise, data.timezone) })}>🌅 {formatTime(data.sunrise, data.timezone)}</p>
            <p aria-label={t('weather.sunset', { time: formatTime(data.sunset, data.timezone) })}>🌇 {formatTime(data.sunset, data.timezone)}</p>
          </div>

          <LocalClock timezone={data.timezone} />

          {airQuality != null && <AirQuality aqi={airQuality} />}

          {uvIndex != null && <UVIndex uvIndex={uvIndex} />}

          <div className="mt-2 rounded-lg bg-amber-50 dark:bg-white/5 px-3 py-2 text-sm text-amber-700 dark:text-amber-200" role="note" aria-label={t('weather.clothingSuggestion')}>
            {suggestion}
          </div>
        </div>
      </div>
    </article>
  );
}
