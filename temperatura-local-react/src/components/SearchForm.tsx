import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchFormProps {
  onSearch: (city: string) => void;
  onSearchByCep: (cep: string) => void;
  onGeolocate: () => void;
  isLoading: boolean;
  clearSignal?: number;
}

interface CitySuggestion {
  name: string;
  state?: string;
  country: string;
}

async function fetchCitySuggestions(query: string): Promise<CitySuggestion[]> {
  if (query.trim().length < 3) return [];
  try {
    const apiKey = import.meta.env.VITE_API_KEY;
    const url = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${apiKey}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((item: { name: string; state?: string; country: string }) => ({
      name: item.name,
      state: item.state,
      country: item.country,
    }));
  } catch {
    return [];
  }
}

export function SearchForm({ onSearch, onSearchByCep, onGeolocate, isLoading, clearSignal }: SearchFormProps) {
  const { t } = useTranslation();
  const [city, setCity] = useState('');
  const [cep, setCep] = useState('');
  const [mode, setMode] = useState<'city' | 'cep'>('city');
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipNextDebounceRef = useRef(false);

  useEffect(() => {
    if (clearSignal) {
      setCity('');
      setCep('');
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [clearSignal]);

  // Debounced autocomplete for city input
  useEffect(() => {
    if (skipNextDebounceRef.current) {
      skipNextDebounceRef.current = false;
      return;
    }

    if (mode !== 'city' || city.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await fetchCitySuggestions(city);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [city, mode]);

  function handleSelectSuggestion(suggestion: CitySuggestion) {
    skipNextDebounceRef.current = true;
    setCity(suggestion.name);
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch(suggestion.name);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuggestions([]);
    setShowSuggestions(false);
    if (mode === 'cep') {
      onSearchByCep(cep);
    } else {
      onSearch(city);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSuggestions([]);
      setShowSuggestions(false);
      if (mode === 'cep') {
        onSearchByCep(cep);
      } else {
        onSearch(city);
      }
    }
  }

  return (
    <search className="flex flex-col gap-3" aria-label={t('search.label')}>
      {/* Mode toggle */}
      <div className="flex items-center justify-center gap-2" role="group" aria-label={t('search.modeLabel')}>
        <button
          type="button"
          onClick={() => setMode('city')}
          aria-pressed={mode === 'city'}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            mode === 'city'
              ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
          }`}
        >
          {t('search.city')}
        </button>
        <button
          type="button"
          onClick={() => setMode('cep')}
          aria-pressed={mode === 'cep'}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            mode === 'cep'
              ? 'bg-slate-200 dark:bg-white/20 text-slate-900 dark:text-white'
              : 'text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80'
          }`}
        >
          {t('search.cep')}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end" aria-label={t('search.formLabel')}>
        <div className="flex flex-1 flex-col gap-1">
          {mode === 'city' ? (
            <>
              <label htmlFor="city-input" className="text-sm font-medium text-slate-600 dark:text-white/80">
                {t('search.cityLabel')}
              </label>
              <div className="relative">
                <input
                  id="city-input"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  placeholder={t('search.cityPlaceholder')}
                  autoComplete="off"
                  className="w-full min-h-[48px] rounded-lg border border-slate-300 dark:border-white/25 bg-white dark:bg-white/10 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 dark:border-white/20 bg-white dark:bg-slate-800 shadow-lg overflow-hidden max-h-60 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <li key={`${s.name}-${s.country}-${i}`}>
                        <button
                          type="button"
                          onMouseDown={() => handleSelectSuggestion(s)}
                          className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-white/90 hover:bg-pink-50 dark:hover:bg-white/10 transition-colors"
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
            </>
          ) : (
            <>
              <label htmlFor="cep-input" className="text-sm font-medium text-slate-600 dark:text-white/80">
                {t('search.cepLabel')}
              </label>
              <input
                id="cep-input"
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('search.cepPlaceholder')}
                maxLength={9}
                inputMode="numeric"
                autoComplete="postal-code"
                className="min-h-[48px] rounded-lg border border-slate-300 dark:border-white/25 bg-white dark:bg-white/10 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
          aria-label={mode === 'city' ? t('search.submitAriaCity') : t('search.submitAriaCep')}
          className="min-h-[48px] rounded-lg bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 px-6 py-2 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {t('search.submit')}
        </button>
      </form>

      {/* Geolocation button */}
      <button
        type="button"
        onClick={onGeolocate}
        disabled={isLoading}
        aria-label={t('search.geolocateAria')}
        className="flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-white/20 bg-white/80 dark:bg-white/5 px-4 py-2 text-sm text-slate-600 dark:text-white/80 transition-all hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        {t('search.geolocate')}
      </button>
    </search>
  );
}
