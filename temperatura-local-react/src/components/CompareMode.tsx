import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchWeather, formatTemperature } from '../services/weatherApi';
import type { WeatherData } from '../types/weather';

interface CompareModeProps {
  primaryData: WeatherData;
  unit: 'C' | 'F';
  lang: string;
}

export function CompareMode({ primaryData, unit, lang }: CompareModeProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [compareCity, setCompareCity] = useState('');
  const [compareData, setCompareData] = useState<WeatherData | null>(null);
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  async function handleCompareSearch(e: FormEvent) {
    e.preventDefault();
    if (!compareCity.trim()) return;

    setIsCompareLoading(true);
    setCompareError(null);
    setCompareData(null);

    try {
      const data = await fetchWeather(compareCity.trim(), lang);
      setCompareData(data);
    } catch (err) {
      if (err instanceof Error) {
        setCompareError(err.message);
      } else {
        setCompareError(t('error.unexpected'));
      }
    } finally {
      setIsCompareLoading(false);
    }
  }

  function handleClose() {
    setIsOpen(false);
    setCompareCity('');
    setCompareData(null);
    setCompareError(null);
  }

  if (!isOpen) {
    return (
      <div className="mt-3 flex justify-center">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/20 bg-white/80 dark:bg-white/5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-white/80 transition-all hover:bg-white dark:hover:bg-white/10 hover:shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {t('compare.button')}
        </button>
      </div>
    );
  }

  const primaryTemp = primaryData.temperature;
  const compareTemp = compareData?.temperature ?? null;
  const primaryIsWarmer = compareTemp !== null ? primaryTemp > compareTemp : null;

  return (
    <div className="mt-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-white/5 p-4 backdrop-blur-sm">
      {/* Header with close button */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-white/90">
          {t('compare.button')}
        </h3>
        <button
          onClick={handleClose}
          className="text-xs text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80 transition-colors"
        >
          {t('compare.close')}
        </button>
      </div>

      {/* Search form for second city */}
      <form onSubmit={handleCompareSearch} className="mb-3 flex gap-2">
        <input
          type="text"
          value={compareCity}
          onChange={(e) => setCompareCity(e.target.value)}
          placeholder={t('compare.placeholder')}
          className="flex-1 rounded-lg border border-slate-200 dark:border-white/20 bg-white dark:bg-white/10 px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 outline-none focus:border-blue-400 dark:focus:border-blue-400 transition-colors"
          aria-label={t('compare.placeholder')}
        />
        <button
          type="submit"
          disabled={isCompareLoading || !compareCity.trim()}
          className="rounded-lg bg-blue-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCompareLoading ? '...' : t('search.submit')}
        </button>
      </form>

      {/* Error message */}
      {compareError && (
        <p className="mb-3 text-xs text-red-500 dark:text-red-400">{compareError}</p>
      )}

      {/* Loading state */}
      {isCompareLoading && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
        </div>
      )}

      {/* Comparison view */}
      {compareData && !isCompareLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Primary city */}
          <CityCard
            data={primaryData}
            unit={unit}
            isWarmer={primaryIsWarmer}
            t={t}
          />
          {/* Compare city */}
          <CityCard
            data={compareData}
            unit={unit}
            isWarmer={primaryIsWarmer === null ? null : !primaryIsWarmer}
            t={t}
          />
        </div>
      )}
    </div>
  );
}

interface CityCardProps {
  data: WeatherData;
  unit: 'C' | 'F';
  isWarmer: boolean | null;
  t: (key: string) => string;
}

function CityCard({ data, unit, isWarmer, t }: CityCardProps) {
  return (
    <div className="rounded-lg border border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 p-3">
      {/* City name + temp indicator */}
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">
          {data.city_name}
        </span>
        {isWarmer !== null && (
          <span className={`flex items-center gap-1 text-xs font-medium ${isWarmer ? 'text-orange-500' : 'text-blue-500'}`}>
            {isWarmer ? '▲' : '▼'}
            {isWarmer ? t('compare.warmer') : t('compare.cooler')}
          </span>
        )}
      </div>

      {/* Temperature */}
      <div className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
        {formatTemperature(data.temperature, unit)}
      </div>

      {/* Condition */}
      <p className="mb-2 text-xs capitalize text-slate-600 dark:text-white/60">
        {data.description}
      </p>

      {/* Stats */}
      <div className="space-y-1 text-xs text-slate-500 dark:text-white/50">
        <div className="flex justify-between">
          <span>💧 {data.humidity}%</span>
          <span>💨 {data.wind_speed} m/s</span>
        </div>
      </div>
    </div>
  );
}
