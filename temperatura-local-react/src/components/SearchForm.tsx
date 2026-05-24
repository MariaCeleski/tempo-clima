import { useState, useEffect } from 'react';

interface SearchFormProps {
  onSearch: (city: string) => void;
  onSearchByCep: (cep: string) => void;
  onGeolocate: () => void;
  isLoading: boolean;
  clearSignal?: number;
}

export function SearchForm({ onSearch, onSearchByCep, onGeolocate, isLoading, clearSignal }: SearchFormProps) {
  const [city, setCity] = useState('');
  const [cep, setCep] = useState('');
  const [mode, setMode] = useState<'city' | 'cep'>('city');

  useEffect(() => {
    if (clearSignal) {
      setCity('');
      setCep('');
    }
  }, [clearSignal]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'cep') {
      onSearchByCep(cep);
    } else {
      onSearch(city);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (mode === 'cep') {
        onSearchByCep(cep);
      } else {
        onSearch(city);
      }
    }
  }

  return (
    <search className="flex flex-col gap-3" aria-label="Buscar clima">
      {/* Mode toggle */}
      <div className="flex items-center justify-center gap-2" role="group" aria-label="Modo de busca">
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
          Cidade
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
          CEP
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end" aria-label="Formulário de busca de clima">
        <div className="flex flex-1 flex-col gap-1">
          {mode === 'city' ? (
            <>
              <label htmlFor="city-input" className="text-sm font-medium text-slate-600 dark:text-white/80">
                Nome da cidade
              </label>
              <input
                id="city-input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: São Paulo, London, Tokyo..."
                autoComplete="off"
                className="min-h-[48px] rounded-lg border border-slate-300 dark:border-white/25 bg-white dark:bg-white/10 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </>
          ) : (
            <>
              <label htmlFor="cep-input" className="text-sm font-medium text-slate-600 dark:text-white/80">
                CEP
              </label>
              <input
                id="cep-input"
                type="text"
                value={cep}
                onChange={(e) => setCep(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: 01001-000"
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
          aria-label={mode === 'city' ? 'Buscar clima por cidade' : 'Buscar clima por CEP'}
          className="min-h-[48px] rounded-lg bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 px-6 py-2 font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-pink-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
        >
          Buscar
        </button>
      </form>

      {/* Geolocation button */}
      <button
        type="button"
        onClick={onGeolocate}
        disabled={isLoading}
        aria-label="Usar minha localização para buscar clima"
        className="flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-slate-300 dark:border-white/20 bg-white/80 dark:bg-white/5 px-4 py-2 text-sm text-slate-600 dark:text-white/80 transition-all hover:bg-white dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Usar minha localização
      </button>
    </search>
  );
}
