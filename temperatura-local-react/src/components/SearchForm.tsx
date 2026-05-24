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
    <div className="flex flex-col gap-3">
      {/* Mode toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setMode('city')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            mode === 'city'
              ? 'bg-white/20 text-white'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          Cidade
        </button>
        <button
          type="button"
          onClick={() => setMode('cep')}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
            mode === 'cep'
              ? 'bg-white/20 text-white'
              : 'text-white/50 hover:text-white/80'
          }`}
        >
          CEP
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1">
          {mode === 'city' ? (
            <>
              <label htmlFor="city-input" className="text-sm font-medium text-white/80">
                Nome da cidade
              </label>
              <input
                id="city-input"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ex: São Paulo, London, Tokyo..."
                className="min-h-[48px] rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </>
          ) : (
            <>
              <label htmlFor="cep-input" className="text-sm font-medium text-white/80">
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
                className="min-h-[48px] rounded-lg border border-white/25 bg-white/10 px-4 py-2 text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-pink-400"
              />
            </>
          )}
        </div>
        <button
          type="submit"
          disabled={isLoading}
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
        className="flex min-h-[40px] items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white/80 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        Usar minha localização
      </button>
    </div>
  );
}
