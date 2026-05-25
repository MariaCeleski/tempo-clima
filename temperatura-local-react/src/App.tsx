import { useState, useEffect, lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchForm } from './components/SearchForm';
import { WeatherCard } from './components/WeatherCard';
import { ForecastCard } from './components/ForecastCard';
import { TemperatureChart } from './components/TemperatureChart';
import { SearchHistory } from './components/SearchHistory';
import { FavoriteCities } from './components/FavoriteCities';
import { ErrorMessage } from './components/ErrorMessage';
import { SkeletonCard } from './components/SkeletonCard';
import { UnitToggle } from './components/UnitToggle';
import { ShareButton } from './components/ShareButton';
import { ThemeToggle } from './components/ThemeToggle';
import { WeatherAlerts } from './components/WeatherAlerts';
import { LanguageSelector } from './components/LanguageSelector';

import { WeatherParticles } from './components/WeatherParticles';

const WeatherMap = lazy(() => import('./components/WeatherMap').then(m => ({ default: m.WeatherMap })));
import {
  validateInput,
  validateCep,
  sanitizeInput,
  fetchWeather,
  fetchWeatherByCoords,
  fetchForecast,
  fetchForecastByCoords,
  fetchCityByCep,
  fetchAirQuality,
  generateAlerts,
  getApiLang,
} from './services/weatherApi';
import type { WeatherData, ForecastDay, WeatherAlert } from './types/weather';

const HISTORY_KEY = 'temperatura-local-history';
const FAVORITES_KEY = 'temperatura-local-favorites';
const MAX_HISTORY = 8;
const MAX_FAVORITES = 10;

function loadHistory(): string[] {
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]): void {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addToHistory(city: string, history: string[]): string[] {
  const filtered = history.filter((h) => h.toLowerCase() !== city.toLowerCase());
  const updated = [city, ...filtered].slice(0, MAX_HISTORY);
  saveHistory(updated);
  return updated;
}

function loadFavorites(): string[] {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favorites: string[]): void {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

function getBackgroundClass(iconCode: string | null): string {
  if (!iconCode) {
    return 'from-slate-950 via-slate-900 to-slate-800';
  }

  const condition = iconCode.slice(0, 2);
  const isNight = iconCode.endsWith('n');

  switch (condition) {
    case '01':
      return isNight
        ? 'from-slate-950 via-indigo-950 to-slate-900'
        : 'from-sky-950 via-amber-900 to-orange-950';
    case '02':
      return isNight
        ? 'from-slate-950 via-slate-900 to-indigo-950'
        : 'from-sky-950 via-sky-900 to-slate-800';
    case '03':
    case '04':
      return isNight
        ? 'from-gray-950 via-slate-900 to-gray-900'
        : 'from-slate-900 via-gray-800 to-slate-800';
    case '09':
    case '10':
      return isNight
        ? 'from-slate-950 via-blue-950 to-gray-950'
        : 'from-slate-900 via-blue-950 to-cyan-950';
    case '11':
      return 'from-gray-950 via-purple-950 to-slate-950';
    case '13':
      return isNight
        ? 'from-slate-950 via-blue-950 to-slate-900'
        : 'from-slate-800 via-blue-900 to-slate-900';
    case '50':
      return 'from-gray-900 via-slate-800 to-gray-900';
    default:
      return 'from-slate-950 via-slate-900 to-slate-800';
  }
}

function App() {
  const { t, i18n } = useTranslation();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [alerts, setAlerts] = useState<WeatherAlert[]>([]);
  const [airQuality, setAirQuality] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>(loadHistory);
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [clearSignal, setClearSignal] = useState(0);
  const [unit, setUnit] = useState<'C' | 'F'>('C');

  const lang = getApiLang(i18n.language);

  // Try geolocation on first load (silently — no error shown if denied)
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          setIsLoading(true);
          try {
            const [data, forecastData] = await Promise.all([
              fetchWeatherByCoords(position.coords.latitude, position.coords.longitude, lang),
              fetchForecastByCoords(position.coords.latitude, position.coords.longitude, lang),
            ]);
            setWeatherData(data);
            setForecast(forecastData);
            setAlerts(generateAlerts(data));
            setHistory(addToHistory(data.city_name, loadHistory()));
            setClearSignal((c) => c + 1);
            fetchAirQuality(data.lat, data.lon).then(setAirQuality);
          } catch {
            // Silently fail on auto-geolocation
          } finally {
            setIsLoading(false);
          }
        },
        () => {
          // Silently ignore — user didn't explicitly request geolocation
        },
        { timeout: 5000 }
      );
    }
  }, []);

  async function handleSearch(city: string): Promise<void> {
    const validationError = validateInput(city);
    if (validationError) {
      setError(validationError);
      setWeatherData(null);
      setForecast([]);
      setAlerts([]);
      setAirQuality(null);
      return;
    }

    const sanitizedCity = sanitizeInput(city);

    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    setForecast([]);
    setAlerts([]);
    setAirQuality(null);

    try {
      const [data, forecastData] = await Promise.all([
        fetchWeather(sanitizedCity, lang),
        fetchForecast(sanitizedCity, lang),
      ]);
      setWeatherData(data);
      setForecast(forecastData);
      setAlerts(generateAlerts(data));
      setHistory(addToHistory(data.city_name, history));
      setClearSignal((c) => c + 1);
      // Fetch AQI in background (non-blocking)
      fetchAirQuality(data.lat, data.lon).then(setAirQuality);
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'TimeoutError' || err.name === 'AbortError') {
          setError(t('error.timeout'));
        } else {
          setError(err.message);
        }
      } else {
        setError(t('error.unexpected'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSearchByCep(cep: string): Promise<void> {
    const validationError = validateCep(cep);
    if (validationError) {
      setError(validationError);
      setWeatherData(null);
      setForecast([]);
      setAlerts([]);
      setAirQuality(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    setForecast([]);
    setAlerts([]);
    setAirQuality(null);

    try {
      const city = await fetchCityByCep(cep);
      const [data, forecastData] = await Promise.all([
        fetchWeather(city, lang),
        fetchForecast(city, lang),
      ]);
      setWeatherData(data);
      setForecast(forecastData);
      setAlerts(generateAlerts(data));
      setHistory(addToHistory(data.city_name, history));
      setClearSignal((c) => c + 1);
      fetchAirQuality(data.lat, data.lon).then(setAirQuality);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(t('error.unexpected'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGeolocate(): Promise<void> {
    if (!('geolocation' in navigator)) {
      setError(t('error.geoUnavailable'));
      return;
    }

    setIsLoading(true);
    setError(null);
    setWeatherData(null);
    setForecast([]);
    setAlerts([]);
    setAirQuality(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const [data, forecastData] = await Promise.all([
            fetchWeatherByCoords(position.coords.latitude, position.coords.longitude, lang),
            fetchForecastByCoords(position.coords.latitude, position.coords.longitude, lang),
          ]);
          setWeatherData(data);
          setForecast(forecastData);
          setAlerts(generateAlerts(data));
          setHistory(addToHistory(data.city_name, history));
          setClearSignal((c) => c + 1);
          fetchAirQuality(data.lat, data.lon).then(setAirQuality);
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError(t('error.geoGeneric'));
          }
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        if (error.code === 1) {
          setError(t('error.geoBlocked'));
        } else if (error.code === 2) {
          setError(t('error.geoPosition'));
        } else {
          setError(t('error.geoTimeout'));
        }
        setIsLoading(false);
      },
      { timeout: 10000 }
    );
  }

  function handleClearHistory(): void {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }

  function toggleFavorite(city: string): void {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.toLowerCase() === city.toLowerCase());
      let updated: string[];
      if (exists) {
        updated = prev.filter((f) => f.toLowerCase() !== city.toLowerCase());
      } else {
        if (prev.length >= MAX_FAVORITES) return prev;
        updated = [...prev, city];
      }
      saveFavorites(updated);
      return updated;
    });
  }

  function removeFavorite(city: string): void {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.toLowerCase() !== city.toLowerCase());
      saveFavorites(updated);
      return updated;
    });
  }

  function clearFavorites(): void {
    setFavorites([]);
    localStorage.removeItem(FAVORITES_KEY);
  }

  const bgClass = getBackgroundClass(weatherData?.icon_code ?? null);

  return (
    <div className={`relative min-h-screen bg-gradient-to-br transition-colors duration-500 ${bgClass}`}>
      {/* Light mode background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-blue-50 to-white transition-opacity duration-500 dark:opacity-0" aria-hidden="true" />

      {/* Theme toggle */}
      <ThemeToggle />

      {/* Language selector */}
      <LanguageSelector />

      {/* Skip to content link for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-slate-900 focus:font-semibold focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-pink-400"
      >
        {t('app.skipToContent')}
      </a>

      <WeatherParticles iconCode={weatherData?.icon_code ?? null} />
      <main
        id="main-content"
        className="relative z-10 flex min-h-screen flex-col items-center justify-start px-4 py-8 sm:justify-center"
      >
        <div className="w-full max-w-md">
          <h1 className="mb-6 text-center text-3xl font-bold text-slate-900 dark:text-white">
            {t('app.title')}
          </h1>

          <h1 className="mb-8 text-center text-1xl font-bold text-slate-900 dark:text-white">
            {t('app.subtitle')}
          </h1>

          <SearchForm
            onSearch={handleSearch}
            onSearchByCep={handleSearchByCep}
            onGeolocate={handleGeolocate}
            isLoading={isLoading}
            clearSignal={clearSignal}
          />

          <SearchHistory
            history={history}
            onSelect={handleSearch}
            onClear={handleClearHistory}
          />

          <FavoriteCities
            favorites={favorites}
            onSelect={handleSearch}
            onRemove={removeFavorite}
            onClear={clearFavorites}
          />

          <div className="mt-6" aria-live="polite" aria-atomic="true">
            {error && !isLoading && <ErrorMessage message={error} />}
            {isLoading && <SkeletonCard />}
            {weatherData && !isLoading && (
              <>
                <WeatherAlerts alerts={alerts} />
                <div className="mb-3 flex justify-between items-center">
                  <ShareButton data={weatherData} />
                  <UnitToggle unit={unit} onToggle={() => setUnit((u) => u === 'C' ? 'F' : 'C')} />
                </div>
                <WeatherCard
                  data={weatherData}
                  unit={unit}
                  airQuality={airQuality}
                  isFavorite={favorites.some((f) => f.toLowerCase() === weatherData.city_name.toLowerCase())}
                  onToggleFavorite={() => toggleFavorite(weatherData.city_name)}
                />
                <Suspense fallback={<div className="mt-4 h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-white/5" aria-label={t('skeleton.loadingMap')} />}>
                  <WeatherMap
                    lat={weatherData.lat}
                    lon={weatherData.lon}
                    cityName={weatherData.city_name}
                    temperature={weatherData.temperature}
                  />
                </Suspense>
                {forecast.length > 0 && (
                  <TemperatureChart forecast={forecast} unit={unit} />
                )}
                <ForecastCard forecast={forecast} unit={unit} />
              </>
            )}
          </div>
        </div>

        <footer className="mt-12 pb-4 text-center text-xs text-slate-400 dark:text-white/30">
          <p>© {new Date().getFullYear()} Temperatura Local — Maria Celeski</p>
          <p className="mt-1">Todos os direitos reservados</p>
        </footer>
      </main>
    </div>
  );
}

export default App;
