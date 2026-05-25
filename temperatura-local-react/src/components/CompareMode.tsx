import { useState, useEffect, useRef, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { fetchWeather, formatTemperature } from '../services/weatherApi';
import type { WeatherData } from '../types/weather';

interface CompareModeProps {
  primaryData: WeatherData;
  unit: 'C' | 'F';
  lang: string;
}

interface CitySuggestion {
  name: string;
  state?: string;
  country: string;
  lat: number;
  lon: number;
}

async function fetchCitySuggestions(query: string): Promise<CitySuggestion[]> {
  if (query.trim().length < 2) return [];
  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((item: { name: string; state?: string; country: string; lat: number; lon: number }) => ({
      name: item.name,
      state: item.state,
      country: item.country,
      lat: item.lat,
      lon: item.lon,
    }));
  } catch {
    return [];
  }
}

export function CompareMode({ primaryData, unit, lang }: CompareModeProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [compareCity, setCompareCity] = useState('');
  const [compareData, setCompareData] = useState<WeatherData | null>(null);
  const [isCompareLoading, setIsCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced autocomplete
  useEffect(() => {
    if (compareCity.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchCitySuggestions(compareCity);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [compareCity]);

  function handleSelectSuggestion(suggestion: CitySuggestion) {
    setCompareCity(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    // Auto-search after selection
    searchCity(suggestion.name);
  }

  async function searchCity(city: string) {
    setIsCompareLoading(true);
    setCompareError(null);
    setCompareData(null);

    try {
      const data = await fetchWeather(city, lang);
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

  async function handleCompareSearch(e: FormEvent) {
    e.preventDefault();
    if (!compareCity.trim()) return;
    setShowSuggestions(false);
    searchCity(compareCity.trim());
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
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={compareCity}
            onChange={(e) => setCompareCity(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder={t('compare.placeholder')}
            className="w-full rounded-lg border border-slate-200 dark:border-white/20 bg-white dark:bg-white/10 px-3 py-2 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-white/40 outline-none focus:border-blue-400 dark:focus:border-blue-400 transition-colors"
            aria-label={t('compare.placeholder')}
            autoComplete="off"
          />
          {showSuggestions && suggestions.length > 0 && (
            <ul className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 dark:border-white/20 bg-white dark:bg-slate-800 shadow-lg overflow-hidden">
              {suggestions.map((s, i) => (
                <li key={`${s.name}-${s.country}-${i}`}>
                  <button
                    type="button"
                    onMouseDown={() => handleSelectSuggestion(s)}
                    className="w-full px-3 py-2 text-left text-sm text-slate-700 dark:text-white/90 hover:bg-blue-50 dark:hover:bg-white/10 transition-colors"
                  >
                    <span className="font-medium">{s.name}</span>
                    {s.state && <span className="text-slate-400 dark:text-white/40">, {s.state}</span>}
                    <span className="text-slate-400 dark:text-white/40"> — {s.country}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
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
